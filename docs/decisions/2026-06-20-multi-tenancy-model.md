# ADR: Multi-Tenancy Isolation Model

- **Date:** 2026-06-20
- **Status:** Accepted

## Context

Trendify will serve multiple creators (tenants) in Phase 3. Data isolation between tenants is a business and legal requirement. Three isolation models exist: database-per-tenant, schema-per-tenant, and row-level with `tenant_id`.

The decision must be made in Phase 1 so that the data model is correct from day one. Retrofitting is extremely expensive after data exists.

## Decision

Use **row-level isolation with `tenant_id`** on all tenant-scoped tables.

Every tenant-scoped table includes `tenant_id UUID NOT NULL`. All queries are automatically filtered by `tenant_id` via a base repository class that reads from `ICurrentUser.TenantId`.

## Alternatives Considered

### Database-per-tenant
- Best isolation — complete data separation
- Rejected because: operational complexity is enormous at Phase 1 (1 database per creator = potentially thousands of databases), migration management is a nightmare, connection pooling is difficult
- Appropriate at Phase 4 for enterprise tiers only

### Schema-per-tenant (PostgreSQL schemas)
- Good isolation — separate schema per tenant in same database
- Rejected because: EF Core schema-per-tenant support is limited, migrations become complex (run per schema), search_path management adds risk
- Mid-ground option that adds operational complexity without matching the isolation of database-per-tenant

### Row-level isolation
- Chosen because:
  - Simple to implement and reason about
  - EF Core global query filters enforce it automatically
  - Works on standard PostgreSQL without extensions
  - Single migration applies to all tenants
  - Standard PostgreSQL RLS (Row Level Security) can be added as an additional safety layer (Phase 3+)

## Consequences

**Made easier:**
- Single database to manage and back up
- Migrations are simple — one migration file for all tenants
- Standard EF Core query patterns work without modification
- OpenSearch indexing is simple (one index with `tenant_id` field)

**Made harder:**
- A bug that bypasses `tenant_id` filtering could expose cross-tenant data — mitigated by global query filters and integration tests
- Very large tenants cannot be easily moved to a dedicated database without significant work
- Noisy neighbor problem: a tenant with huge data affects query performance for others — mitigated by proper indexing and future read replicas

## Enforcement Mechanism

```csharp
// TenantRepository<T> in src/infrastructure/
public abstract class TenantRepository<T> where T : TenantEntity
{
    protected IQueryable<T> Query =>
        _dbContext.Set<T>().Where(e => e.TenantId == _currentUser.TenantId && e.DeletedAt == null);
}

// EF Core global query filter (backup safety net)
modelBuilder.Entity<ContentIdea>()
    .HasQueryFilter(e => e.TenantId == _tenantId && e.DeletedAt == null);
```

Any query that bypasses the base repository must have an explicit comment explaining why and must be reviewed by the module owner.
