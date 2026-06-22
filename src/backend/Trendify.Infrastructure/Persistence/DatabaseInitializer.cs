using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Trendify.Infrastructure.Persistence;

/// <summary>
/// Applies 00001_InitialSchema.sql on first startup if the schema does not yet exist.
/// Idempotent — safe to call on every start.
/// </summary>
public sealed class DatabaseInitializer
{
    private readonly AppDbContext _db;
    private readonly ILogger<DatabaseInitializer> _logger;

    public DatabaseInitializer(AppDbContext db, ILogger<DatabaseInitializer> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task InitializeAsync(CancellationToken ct = default)
    {
        // Ensure Postgres is reachable
        var canConnect = await _db.Database.CanConnectAsync(ct);
        if (!canConnect)
            throw new InvalidOperationException("Cannot connect to PostgreSQL. Check connection string.");

        // Check whether schema already exists (workspaces table is the anchor)
        var exists = await SchemaExistsAsync(ct);
        if (exists)
        {
            _logger.LogInformation("Database schema already exists — skipping initialization.");
            return;
        }

        _logger.LogInformation("Applying initial database schema...");

        var sql = ReadEmbeddedSql();
        await _db.Database.ExecuteSqlRawAsync(sql, ct);

        _logger.LogInformation("Database schema applied successfully.");
    }

    private async Task<bool> SchemaExistsAsync(CancellationToken ct)
    {
        var conn = _db.Database.GetDbConnection();
        await conn.OpenAsync(ct);
        try
        {
            await using var cmd = conn.CreateCommand();
            cmd.CommandText =
                "SELECT EXISTS(SELECT 1 FROM information_schema.tables " +
                "WHERE table_schema = 'public' AND table_name = 'workspaces')";
            return (bool)(await cmd.ExecuteScalarAsync(ct))!;
        }
        finally
        {
            await conn.CloseAsync();
        }
    }

    private static string ReadEmbeddedSql()
    {
        var assembly = Assembly.GetExecutingAssembly();
        const string resourceName =
            "Trendify.Infrastructure.Persistence.Migrations.00001_InitialSchema.sql";

        using var stream = assembly.GetManifestResourceStream(resourceName)
            ?? throw new InvalidOperationException(
                $"Embedded resource '{resourceName}' not found. " +
                "Ensure the file is included as EmbeddedResource in the csproj.");

        using var reader = new StreamReader(stream);
        return reader.ReadToEnd();
    }
}
