using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace Trendify.Infrastructure.TikTok;

/// <summary>
/// Low-level TikTok API v2 HTTP client.
/// Takes a decrypted access_token — callers are responsible for decryption.
/// </summary>
public sealed class TikTokApiClient
{
    private readonly HttpClient _http;
    private readonly ILogger<TikTokApiClient> _logger;

    private const string UserInfoEndpoint =
        "https://open.tiktokapis.com/v2/user/info/";
    private const string VideoListEndpoint =
        "https://open.tiktokapis.com/v2/video/list/";

    private static readonly JsonSerializerOptions _json =
        new() { PropertyNameCaseInsensitive = true };

    public TikTokApiClient(HttpClient http, ILogger<TikTokApiClient> logger)
    {
        _http = http;
        _logger = logger;
    }

    public async Task<TikTokUserStats?> GetUserStatsAsync(
        string accessToken, CancellationToken ct = default)
    {
        var fields = "id,display_name,avatar_url,follower_count,following_count,likes_count,video_count";
        var request = new HttpRequestMessage(
            HttpMethod.Get, $"{UserInfoEndpoint}?fields={fields}");
        request.Headers.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        try
        {
            var response = await _http.SendAsync(request, ct);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("TikTok user info returned {Status}", response.StatusCode);
                return null;
            }

            var envelope = await response.Content
                .ReadFromJsonAsync<TikTokUserInfoEnvelope>(_json, ct);
            return envelope?.Data?.User;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to fetch TikTok user stats");
            return null;
        }
    }

    public async Task<List<TikTokVideoData>> GetVideosAsync(
        string accessToken, int maxCount = 20, CancellationToken ct = default)
    {
        var fields = "id,create_time,title,video_description,duration," +
                     "cover_image_url,share_url,view_count,like_count," +
                     "comment_count,share_count,play_count";

        var body = new { max_count = Math.Clamp(maxCount, 1, 20) };
        var request = new HttpRequestMessage(HttpMethod.Post, $"{VideoListEndpoint}?fields={fields}")
        {
            Content = JsonContent.Create(body)
        };
        request.Headers.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        try
        {
            var response = await _http.SendAsync(request, ct);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("TikTok video list returned {Status}", response.StatusCode);
                return [];
            }

            var envelope = await response.Content
                .ReadFromJsonAsync<TikTokVideoListEnvelope>(_json, ct);
            return envelope?.Data?.Videos ?? [];
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to fetch TikTok videos");
            return [];
        }
    }
}

// ── Response shapes (snake_case matching TikTok API) ──────────────────────────
#pragma warning disable IDE1006

public sealed class TikTokUserInfoEnvelope
{
    public TikTokUserInfoData? Data { get; set; }
}

public sealed class TikTokUserInfoData
{
    public TikTokUserStats? User { get; set; }
}

public sealed class TikTokUserStats
{
    public string id { get; set; } = string.Empty;
    public string? display_name { get; set; }
    public string? avatar_url { get; set; }
    public long follower_count { get; set; }
    public long following_count { get; set; }
    public long likes_count { get; set; }
    public long video_count { get; set; }
}

public sealed class TikTokVideoListEnvelope
{
    public TikTokVideoListData? Data { get; set; }
}

public sealed class TikTokVideoListData
{
    public List<TikTokVideoData> Videos { get; set; } = [];
    public bool Has_More { get; set; }
    public string? Cursor { get; set; }
}

public sealed class TikTokVideoData
{
    public string id { get; set; } = string.Empty;
    public long create_time { get; set; }
    public string? title { get; set; }
    public string? video_description { get; set; }
    public string? cover_image_url { get; set; }
    public string? share_url { get; set; }
    public long view_count { get; set; }
    public long like_count { get; set; }
    public long comment_count { get; set; }
    public long share_count { get; set; }
    public long play_count { get; set; }
}

#pragma warning restore IDE1006
