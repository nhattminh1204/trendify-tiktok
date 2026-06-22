# Database Standards — Trendify

## Naming Conventions

| Object | Convention | Example |
|---|---|---|
| Tables | snake_case, plural | `content_ideas`, `trend_detections` |
| Columns | snake_case | `created_at`, `tenant_id` |
| Primary keys | `id` | `id UUID PRIMARY KEY` |
| Foreign keys | `{table_singular}_id` | `social_account_id` |
| Indexes | `idx_{table}_{column(s)}` | `idx_trends_tenant_id` |
| Unique indexes | `uq_{table}_{column(s)}` | `uq_users_email` |
| Enum-like columns | VARCHAR with CHECK | `status VARCHAR(50) CHECK (status IN (...))` |

---

## Required Columns

Every tenant-scoped table must have these columns. No exceptions.

```sql
id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
tenant_id   UUID        NOT NULL,
created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
deleted_at  TIMESTAMPTZ NULL  -- NULL = active, value = soft deleted
```

System-level tables (not tenant-scoped) omit `tenant_id` but keep the rest.

---

## Primary Key Rules

- Always use `UUID`, never `BIGSERIAL` or `INT`
- Use `gen_random_uuid()` (PostgreSQL built-in, no extension needed)
- Never expose sequential IDs to clients

---

## Soft Delete

- All user-facing data uses soft delete (`deleted_at TIMESTAMPTZ NULL`)
- Hard delete only for: AI usage logs (after retention period), temporary pipeline artifacts
- All queries must filter `WHERE deleted_at IS NULL` unless explicitly querying deleted records
- EF Core global query filter enforces this automatically on all entities

---

## Migration Rules

1. Every migration uses EF Core Migrations — no raw SQL scripts in production deployments
2. Migration naming: `{Timestamp}_{PascalCaseDescription}` (EF Core default)
3. Every destructive migration (drop column, drop table, change column type) requires:
   - A rollback script in `src/infrastructure/Persistence/Migrations/Rollbacks/`
   - PR description includes: "Migration is reversible: YES/NO. Rollback steps: ..."
4. Two-phase column removal:
   - Sprint N: rename column to `{name}_deprecated`, stop reading/writing it
   - Sprint N+1: drop the column
5. Zero-downtime migrations preferred: additive changes only (add nullable column, add index concurrently)
6. Never run migrations in the same transaction as data migrations — separate migration files

---

## Indexing Rules

1. Every `tenant_id` column has an index
2. Every foreign key column has an index
3. No index added without a query in the PR that justifies it
4. Use `CREATE INDEX CONCURRENTLY` for adding indexes to large tables in production
5. Partial indexes preferred over full table indexes for filtered queries:
   ```sql
   CREATE INDEX idx_content_ideas_active ON content_ideas(tenant_id, created_at DESC)
   WHERE deleted_at IS NULL;
   ```
6. Run `EXPLAIN ANALYZE` before adding indexes — document the query plan improvement in the PR

---

## JSONB Columns

- Use `JSONB` (not `JSON`) for all JSON storage — it's indexed and queryable
- JSONB columns are for flexible/evolving schema, not core business logic
- Core attributes that are queried or filtered must be proper columns, not buried in JSONB
- Document the expected JSONB structure in the feature doc (`docs/features/{module}.md`)

---

## Sensitive Data

- Passwords: bcrypt hash only, never store plaintext
- OAuth tokens: encrypted at application level before storage (AES-256-GCM)
- Column naming for encrypted values: no special prefix, document in schema comments
- PII columns (email, display_name): noted in the database map
- Never log PII — use masked representations in logs

---

## Data Types

| Use Case | Type |
|---|---|
| Primary/foreign keys | `UUID` |
| Money/revenue | `DECIMAL(12, 4)` — never FLOAT |
| Percentages, scores | `DECIMAL(5, 2)` |
| All timestamps | `TIMESTAMPTZ` (always UTC) |
| Short strings (<500 chars) | `VARCHAR(N)` with explicit limit |
| Long text (scripts, descriptions) | `TEXT` |
| Flags | `BOOLEAN NOT NULL DEFAULT false` |
| Counters | `BIGINT` (not INT — views can exceed INT_MAX) |
| Enum-like status | `VARCHAR(50)` with CHECK constraint or PostgreSQL ENUM |

---

## Connection Management

- Connection pooling via `Npgsql` (built into EF Core PostgreSQL provider)
- Max pool size: 20 per application instance (configurable via `DATABASE_MAX_POOL_SIZE`)
- Command timeout: 30 seconds (configurable, never set to unlimited)
- Retry policy: 3 retries with exponential backoff for transient failures

---

## Backup & Recovery

| Metric | Target |
|---|---|
| RPO (Recovery Point Objective) | 1 hour |
| RTO (Recovery Time Objective) | 4 hours |
| Backup frequency | Every 6 hours (full dump) + WAL archiving |
| Backup retention | 30 days |
| Backup location | Separate storage from primary VPS |
| Backup test | Monthly restore drill |
