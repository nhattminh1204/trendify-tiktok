using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Trendify.Infrastructure.Auth;
using Trendify.Shared.Errors;

namespace Trendify.Modules.Accounts.Infrastructure.TikTok;

public sealed class TikTokOAuthService
{
    private readonly HttpClient _http;
    private readonly TikTokOptions _options;
    private readonly TokenEncryptionService _encryption;

    private const string TokenEndpoint = "https://open.tiktokapis.com/v2/oauth/token/";
    private const string UserInfoEndpoint = "https://open.tiktokapis.com/v2/user/info/";

    public TikTokOAuthService(
        HttpClient http,
        IOptions<TikTokOptions> options,
        TokenEncryptionService encryption)
    {
        _http = http;
        _options = options.Value;
        _encryption = encryption;
    }

    /// <summary>
    /// Generates a PKCE code_verifier, derives the S256 challenge, and returns
    /// both the authorization URL (with code_challenge + code_challenge_method=S256)
    /// and the raw verifier that must be stored server-side until the callback.
    /// </summary>
    public TikTokAuthChallenge BuildAuthorizationUrl(string state)
    {
        // RFC 7636 §4.1: 32 random bytes → base64url = 43 chars (within 43-128 range)
        var verifierBytes = RandomNumberGenerator.GetBytes(32);
        var codeVerifier = Base64UrlEncode(verifierBytes);

        // RFC 7636 §4.2: code_challenge = BASE64URL(SHA256(ASCII(code_verifier)))
        var challengeBytes = SHA256.HashData(Encoding.ASCII.GetBytes(codeVerifier));
        var codeChallenge = Base64UrlEncode(challengeBytes);

        var scopes = Uri.EscapeDataString("user.info.basic,user.info.stats,video.list");
        var authUrl = "https://www.tiktok.com/v2/auth/authorize/" +
                      $"?client_key={_options.ClientKey}" +
                      $"&scope={scopes}" +
                      $"&response_type=code" +
                      $"&redirect_uri={Uri.EscapeDataString(_options.RedirectUri)}" +
                      $"&state={Uri.EscapeDataString(state)}" +
                      $"&code_challenge={Uri.EscapeDataString(codeChallenge)}" +
                      $"&code_challenge_method=S256";

        return new TikTokAuthChallenge(authUrl, codeVerifier);
    }

    public async Task<TikTokTokenResult> ExchangeCodeForTokensAsync(
        string code, string redirectUri, string codeVerifier, CancellationToken ct)
    {
        var payload = new Dictionary<string, string>
        {
            ["client_key"] = _options.ClientKey,
            ["client_secret"] = _options.ClientSecret,
            ["code"] = Uri.UnescapeDataString(code),
            ["grant_type"] = "authorization_code",
            ["redirect_uri"] = redirectUri,
            ["code_verifier"] = codeVerifier   // RFC 7636 §4.5
        };

        var response = await _http.PostAsync(TokenEndpoint, new FormUrlEncodedContent(payload), ct);

        if (!response.IsSuccessStatusCode)
            throw new DomainException(ErrorCodes.TikTokAuthFailed,
                "Failed to exchange TikTok authorization code.", 502);

        var result = await response.Content.ReadFromJsonAsync<TikTokTokenResponse>(ct)
            ?? throw new DomainException(ErrorCodes.TikTokAuthFailed, "Invalid token response.", 502);

        return new TikTokTokenResult(
            OpenId: result.open_id,
            AccessToken: result.access_token,
            AccessTokenEncrypted: _encryption.Encrypt(result.access_token),
            RefreshTokenEncrypted: _encryption.Encrypt(result.refresh_token),
            ExpiresAt: DateTimeOffset.UtcNow.AddSeconds(result.expires_in),
            Scope: result.scope
        );
    }

    public async Task<TikTokUserProfile> GetUserProfileAsync(string accessToken, CancellationToken ct)
    {
        var fields = "id,display_name,avatar_url,follower_count,username";
        var request = new HttpRequestMessage(HttpMethod.Get, $"{UserInfoEndpoint}?fields={fields}");
        request.Headers.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        var response = await _http.SendAsync(request, ct);

        if (!response.IsSuccessStatusCode)
            throw new DomainException(ErrorCodes.UpstreamError, "Failed to fetch TikTok profile.", 502);

        var result = await response.Content.ReadFromJsonAsync<TikTokUserInfoResponse>(ct)
            ?? throw new DomainException(ErrorCodes.UpstreamError, "Invalid profile response.", 502);

        var user = result.data?.user ?? throw new DomainException(ErrorCodes.UpstreamError, "No user data.", 502);

        return new TikTokUserProfile(
            OpenId: user.id,
            Username: user.username ?? user.id,
            DisplayName: user.display_name,
            AvatarUrl: user.avatar_url,
            FollowerCount: user.follower_count
        );
    }

    public async Task RefreshAccessTokenAsync(
        string refreshTokenEncrypted,
        Action<string, string, DateTimeOffset> onSuccess,
        CancellationToken ct)
    {
        var refreshToken = _encryption.Decrypt(refreshTokenEncrypted);

        var payload = new Dictionary<string, string>
        {
            ["client_key"] = _options.ClientKey,
            ["client_secret"] = _options.ClientSecret,
            ["grant_type"] = "refresh_token",
            ["refresh_token"] = refreshToken
        };

        var response = await _http.PostAsync(TokenEndpoint, new FormUrlEncodedContent(payload), ct);
        if (!response.IsSuccessStatusCode) return;

        var result = await response.Content.ReadFromJsonAsync<TikTokTokenResponse>(ct);
        if (result is null) return;

        onSuccess(
            _encryption.Encrypt(result.access_token),
            _encryption.Encrypt(result.refresh_token),
            DateTimeOffset.UtcNow.AddSeconds(result.expires_in)
        );
    }

    // BASE64URL: standard base64 with + → -, / → _, trailing = stripped (RFC 4648 §5)
    private static string Base64UrlEncode(byte[] data) =>
        Convert.ToBase64String(data).TrimEnd('=').Replace('+', '-').Replace('/', '_');
}

// PKCE result from BuildAuthorizationUrl — store CodeVerifier in server-side session
public sealed record TikTokAuthChallenge(string AuthUrl, string CodeVerifier);

// TikTok API response shapes (snake_case to match TikTok API)
#pragma warning disable IDE1006
internal sealed class TikTokTokenResponse
{
    public string open_id { get; set; } = string.Empty;
    public string access_token { get; set; } = string.Empty;
    public string refresh_token { get; set; } = string.Empty;
    public int expires_in { get; set; }
    public int refresh_expires_in { get; set; }
    public string scope { get; set; } = string.Empty;
    public string token_type { get; set; } = string.Empty;
}

internal sealed class TikTokUserInfoResponse
{
    public TikTokUserInfoData? data { get; set; }
}

internal sealed class TikTokUserInfoData
{
    public TikTokUserData? user { get; set; }
}

internal sealed class TikTokUserData
{
    public string id { get; set; } = string.Empty;
    public string? username { get; set; }
    public string? display_name { get; set; }
    public string? avatar_url { get; set; }
    public long follower_count { get; set; }
}
#pragma warning restore IDE1006

// Internal result types
public sealed record TikTokTokenResult(
    string OpenId,
    string AccessToken,
    string AccessTokenEncrypted,
    string RefreshTokenEncrypted,
    DateTimeOffset ExpiresAt,
    string Scope
);

public sealed record TikTokUserProfile(
    string OpenId,
    string Username,
    string? DisplayName,
    string? AvatarUrl,
    long FollowerCount
);

public sealed class TikTokOptions
{
    public const string Section = "TikTok";
    public string ClientKey { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string RedirectUri { get; set; } = string.Empty;
}
