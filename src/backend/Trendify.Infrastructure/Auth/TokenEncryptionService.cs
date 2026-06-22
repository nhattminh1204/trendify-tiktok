using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;

namespace Trendify.Infrastructure.Auth;

public sealed class TokenEncryptionService
{
    private readonly byte[] _key;

    public TokenEncryptionService(IOptions<EncryptionOptions> options)
    {
        _key = Encoding.UTF8.GetBytes(options.Value.Key.PadRight(32)[..32]);
    }

    public string Encrypt(string plainText)
    {
        using var aes = Aes.Create();
        aes.Key = _key;
        aes.GenerateIV();

        using var encryptor = aes.CreateEncryptor();
        var plainBytes = Encoding.UTF8.GetBytes(plainText);
        var cipherBytes = encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);

        var result = new byte[aes.IV.Length + cipherBytes.Length];
        aes.IV.CopyTo(result, 0);
        cipherBytes.CopyTo(result, aes.IV.Length);

        return Convert.ToBase64String(result);
    }

    public string Decrypt(string cipherText)
    {
        var allBytes = Convert.FromBase64String(cipherText);

        using var aes = Aes.Create();
        aes.Key = _key;

        var iv = allBytes[..16];
        var cipherBytes = allBytes[16..];
        aes.IV = iv;

        using var decryptor = aes.CreateDecryptor();
        var plainBytes = decryptor.TransformFinalBlock(cipherBytes, 0, cipherBytes.Length);

        return Encoding.UTF8.GetString(plainBytes);
    }
}

public sealed class EncryptionOptions
{
    public const string Section = "Encryption";
    public string Key { get; set; } = string.Empty;
}
