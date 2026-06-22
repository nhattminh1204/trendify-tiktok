using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;
using Trendify.Shared.Abstractions;

namespace Trendify.Infrastructure.Storage;

public sealed class MinIOStorageService : IStorageService
{
    private readonly IMinioClient _client;
    private readonly string _bucket;

    public MinIOStorageService(IMinioClient client, IOptions<MinIOOptions> options)
    {
        _client = client;
        _bucket = options.Value.Bucket;
    }

    public async Task<string> UploadAsync(string key, Stream content, string contentType, CancellationToken ct = default)
    {
        await EnsureBucketExistsAsync(ct);

        var args = new PutObjectArgs()
            .WithBucket(_bucket)
            .WithObject(key)
            .WithStreamData(content)
            .WithObjectSize(content.Length)
            .WithContentType(contentType);

        await _client.PutObjectAsync(args, ct);
        return key;
    }

    public async Task<string> GetPresignedUrlAsync(string key, TimeSpan expiry, CancellationToken ct = default)
    {
        var args = new PresignedGetObjectArgs()
            .WithBucket(_bucket)
            .WithObject(key)
            .WithExpiry((int)expiry.TotalSeconds);

        return await _client.PresignedGetObjectAsync(args);
    }

    public async Task DeleteAsync(string key, CancellationToken ct = default)
    {
        var args = new RemoveObjectArgs()
            .WithBucket(_bucket)
            .WithObject(key);

        await _client.RemoveObjectAsync(args, ct);
    }

    public async Task<bool> ExistsAsync(string key, CancellationToken ct = default)
    {
        try
        {
            var args = new StatObjectArgs()
                .WithBucket(_bucket)
                .WithObject(key);

            await _client.StatObjectAsync(args, ct);
            return true;
        }
        catch
        {
            return false;
        }
    }

    private async Task EnsureBucketExistsAsync(CancellationToken ct)
    {
        var exists = await _client.BucketExistsAsync(
            new BucketExistsArgs().WithBucket(_bucket), ct);

        if (!exists)
            await _client.MakeBucketAsync(new MakeBucketArgs().WithBucket(_bucket), ct);
    }
}

public sealed class MinIOOptions
{
    public const string Section = "MinIO";
    public string Endpoint { get; set; } = string.Empty;
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string Bucket { get; set; } = "trendify-assets";
    public bool UseSSL { get; set; } = false;
}
