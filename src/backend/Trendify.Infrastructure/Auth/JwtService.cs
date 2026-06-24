using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Trendify.Infrastructure.Auth;

public sealed class JwtService
{
    private readonly JwtOptions _options;
    private readonly RsaSecurityKey _privateKey;
    private readonly RsaSecurityKey _publicKey;

    public JwtService(IOptions<JwtOptions> options)
    {
        _options = options.Value;

        var rsa = RSA.Create();
        rsa.ImportFromPem(_options.PrivateKeyPem);
        _privateKey = new RsaSecurityKey(rsa);

        var rsaPub = RSA.Create();
        rsaPub.ImportFromPem(_options.PublicKeyPem);
        _publicKey = new RsaSecurityKey(rsaPub);
    }

    public string GenerateAccessToken(Guid userId, Guid tenantId, string email, string role)
    {
        var credentials = new SigningCredentials(_privateKey, SecurityAlgorithms.RsaSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim("tenant_id", tenantId.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat,
                DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(),
                ClaimValueTypes.Integer64)
        };

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_options.AccessTokenTtlMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes);
    }

    public int RefreshTokenTtlDays => _options.RefreshTokenTtlDays;

    public ClaimsPrincipal? ValidateAccessToken(string token)
    {
        var handler = new JwtSecurityTokenHandler();
        var parameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = _options.Issuer,
            ValidateAudience = true,
            ValidAudience = _options.Audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = _publicKey,
            ClockSkew = TimeSpan.FromSeconds(30)
        };

        try
        {
            return handler.ValidateToken(token, parameters, out _);
        }
        catch
        {
            return null;
        }
    }

    public TokenValidationParameters GetValidationParameters() => new()
    {
        ValidateIssuer = true,
        ValidIssuer = _options.Issuer,
        ValidateAudience = true,
        ValidAudience = _options.Audience,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = _publicKey,
        ClockSkew = TimeSpan.FromSeconds(30)
    };
}

public sealed class JwtOptions
{
    public const string Section = "Jwt";

    public string PrivateKeyPem { get; set; } = string.Empty;
    public string PublicKeyPem { get; set; } = string.Empty;
    public string Issuer { get; set; } = "trendify";
    public string Audience { get; set; } = "trendify-clients";
    public int AccessTokenTtlMinutes { get; set; } = 15;
    public int RefreshTokenTtlDays { get; set; } = 7;
}
