using Microsoft.EntityFrameworkCore;
using Trendify.Infrastructure.Outbox;
using Trendify.Shared.Abstractions;

namespace Trendify.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    private readonly ICurrentUser _currentUser;

    public AppDbContext(DbContextOptions<AppDbContext> options, ICurrentUser currentUser)
        : base(options)
    {
        _currentUser = currentUser;
    }

    // Explicit DbSet for outbox — other entities accessed via Set<T>() in repos
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Infrastructure configs (OutboxMessage, etc.)
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Load configurations from all module assemblies
        foreach (var assembly in ModuleAssemblies.All)
            modelBuilder.ApplyConfigurationsFromAssembly(assembly);

        base.OnModelCreating(modelBuilder);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        foreach (var entry in ChangeTracker.Entries<Trendify.Shared.Domain.TenantEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                if (_currentUser.IsAuthenticated)
                    entry.Property("TenantId").CurrentValue = _currentUser.TenantId;
                entry.Property("CreatedAt").CurrentValue = DateTimeOffset.UtcNow;
                entry.Property("UpdatedAt").CurrentValue = DateTimeOffset.UtcNow;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Property("UpdatedAt").CurrentValue = DateTimeOffset.UtcNow;
            }
        }

        return await base.SaveChangesAsync(ct);
    }
}
