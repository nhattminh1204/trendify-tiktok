# Database Map — Trendify

## Conventions

### Naming
- Table names: `snake_case`, plural — `trend_detections`, `content_ideas`
- Column names: `snake_case` — `created_at`, `tenant_id`
- Primary keys: always `id UUID DEFAULT gen_random_uuid()`
- Foreign keys: `{referenced_table_singular}_id UUID`

### Required Columns (every tenant-scoped table)
```sql
id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
tenant_id   UUID        NOT NULL,  -- always filter by this
created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
deleted_at  TIMESTAMPTZ NULL       -- soft delete, NULL = not deleted
```

### Indexes
- Every `tenant_id` column has an index
- Every foreign key column has an index
- Composite indexes documented here when added
- No index added without a query justifying it

### Migration Rules
- All migrations use EF Core Migrations
- Every migration file has a paired rollback script in `src/infrastructure/Persistence/Migrations/Rollbacks/`
- Migrations that drop columns are two-phase: Phase 1 rename to `_deprecated_`, Phase 2 drop in next sprint
- No migration merges without DBA review annotation in PR description

---

## Schema by Module

### accounts

```sql
-- Workspace (= Tenant in Phase 1)
CREATE TABLE workspaces (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    plan        VARCHAR(50)  NOT NULL DEFAULT 'free',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMPTZ NULL
);

-- Users
CREATE TABLE users (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL REFERENCES workspaces(id),
    email           VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    display_name    VARCHAR(255),
    role            VARCHAR(50)  NOT NULL DEFAULT 'owner',
    is_active       BOOLEAN      NOT NULL DEFAULT true,
    last_login_at   TIMESTAMPTZ NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ NULL
);

-- Social media accounts (TikTok accounts managed by the user)
CREATE TABLE social_accounts (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL REFERENCES workspaces(id),
    platform        VARCHAR(50)  NOT NULL,  -- 'tiktok', 'instagram', etc.
    platform_user_id VARCHAR(255) NOT NULL,
    username        VARCHAR(255) NOT NULL,
    display_name    VARCHAR(255),
    profile_image_url TEXT,
    access_token    TEXT,        -- encrypted
    refresh_token   TEXT,        -- encrypted
    token_expires_at TIMESTAMPTZ,
    follower_count  BIGINT       NOT NULL DEFAULT 0,
    is_active       BOOLEAN      NOT NULL DEFAULT true,
    last_synced_at  TIMESTAMPTZ NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ NULL
);

-- Account groups
CREATE TABLE account_groups (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID        NOT NULL REFERENCES workspaces(id),
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE account_group_members (
    group_id        UUID NOT NULL REFERENCES account_groups(id),
    social_account_id UUID NOT NULL REFERENCES social_accounts(id),
    PRIMARY KEY (group_id, social_account_id)
);
```

---

### trends

```sql
CREATE TABLE trend_detections (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL,
    keyword         VARCHAR(500) NOT NULL,
    platform        VARCHAR(50)  NOT NULL,
    score           DECIMAL(5,2) NOT NULL,  -- 0.00 to 100.00
    velocity        DECIMAL(10,2) NOT NULL, -- growth rate
    volume          BIGINT       NOT NULL,  -- total posts/views
    status          VARCHAR(50)  NOT NULL DEFAULT 'active', -- active, peaking, declining, dead
    first_seen_at   TIMESTAMPTZ NOT NULL,
    peaked_at       TIMESTAMPTZ NULL,
    detected_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE trend_watchlist (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL,
    trend_id        UUID        NOT NULL REFERENCES trend_detections(id),
    added_by_user_id UUID       NOT NULL REFERENCES users(id),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE competitor_profiles (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL,
    platform        VARCHAR(50)  NOT NULL,
    platform_user_id VARCHAR(255) NOT NULL,
    username        VARCHAR(255) NOT NULL,
    last_analyzed_at TIMESTAMPTZ NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### audience

```sql
CREATE TABLE audience_profiles (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL,
    social_account_id UUID      NOT NULL REFERENCES social_accounts(id),
    age_distribution  JSONB,
    gender_split      JSONB,
    top_countries     JSONB,
    top_interests     JSONB,
    active_hours      JSONB,
    analyzed_at       TIMESTAMPTZ NOT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audience_personas (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL,
    social_account_id UUID      REFERENCES social_accounts(id),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    demographics    JSONB,
    pain_points     JSONB,
    motivations     JSONB,
    content_preferences JSONB,
    generated_by_ai BOOLEAN     NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### content

```sql
CREATE TABLE content_ideas (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL,
    title           VARCHAR(500) NOT NULL,
    description     TEXT,
    hook            TEXT,
    script          TEXT,
    cta             TEXT,
    niche           VARCHAR(255),
    target_persona_id UUID      REFERENCES audience_personas(id),
    trend_id        UUID        REFERENCES trend_detections(id),
    status          VARCHAR(50)  NOT NULL DEFAULT 'draft', -- draft, approved, in_production, published, archived
    generated_by_ai BOOLEAN     NOT NULL DEFAULT false,
    ai_prompt_ref   UUID        NULL,
    created_by_user_id UUID     NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ NULL
);

CREATE TABLE content_assets (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL,
    idea_id         UUID        REFERENCES content_ideas(id),
    asset_type      VARCHAR(50)  NOT NULL, -- 'video', 'audio', 'subtitle', 'thumbnail'
    storage_key     VARCHAR(1000) NOT NULL, -- MinIO object key
    file_size_bytes BIGINT,
    duration_seconds DECIMAL(10,2),
    mime_type       VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE content_pipelines (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL,
    name            VARCHAR(255) NOT NULL,
    steps           JSONB       NOT NULL, -- pipeline step configuration
    is_active       BOOLEAN     NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE content_pipeline_runs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL,
    pipeline_id     UUID        NOT NULL REFERENCES content_pipelines(id),
    idea_id         UUID        REFERENCES content_ideas(id),
    status          VARCHAR(50)  NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
    started_at      TIMESTAMPTZ NULL,
    completed_at    TIMESTAMPTZ NULL,
    error_message   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### analytics

```sql
CREATE TABLE content_posts (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID        NOT NULL,
    social_account_id   UUID        NOT NULL REFERENCES social_accounts(id),
    idea_id             UUID        REFERENCES content_ideas(id),
    platform_post_id    VARCHAR(255) NOT NULL,
    caption             TEXT,
    posted_at           TIMESTAMPTZ NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE post_metrics (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL,
    post_id         UUID        NOT NULL REFERENCES content_posts(id),
    recorded_at     TIMESTAMPTZ NOT NULL,
    views           BIGINT      NOT NULL DEFAULT 0,
    likes           BIGINT      NOT NULL DEFAULT 0,
    comments        BIGINT      NOT NULL DEFAULT 0,
    shares          BIGINT      NOT NULL DEFAULT 0,
    saves           BIGINT      NOT NULL DEFAULT 0,
    watch_time_seconds BIGINT   NOT NULL DEFAULT 0,
    revenue_usd     DECIMAL(12,4) NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### learning

```sql
CREATE TABLE content_patterns (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL,
    pattern_type    VARCHAR(50)  NOT NULL, -- 'winning', 'losing'
    category        VARCHAR(100) NOT NULL, -- 'hook', 'length', 'posting_time', 'niche', etc.
    description     TEXT        NOT NULL,
    confidence      DECIMAL(5,2) NOT NULL,
    evidence_count  INT         NOT NULL DEFAULT 0,
    detected_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE improvement_recommendations (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL,
    social_account_id UUID      REFERENCES social_accounts(id),
    title           VARCHAR(500) NOT NULL,
    description     TEXT,
    priority        VARCHAR(20)  NOT NULL DEFAULT 'medium', -- low, medium, high, critical
    status          VARCHAR(50)  NOT NULL DEFAULT 'active', -- active, applied, dismissed
    based_on_pattern_ids UUID[],
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### ai_engine

```sql
CREATE TABLE ai_prompts (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NULL,  -- NULL = system-level prompt
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) NOT NULL,
    version         INT         NOT NULL DEFAULT 1,
    template        TEXT        NOT NULL,
    provider        VARCHAR(50),       -- NULL = any
    model           VARCHAR(100),      -- NULL = auto-route
    max_tokens      INT,
    temperature     DECIMAL(3,2),
    is_active       BOOLEAN     NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ai_usage_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID        NOT NULL,
    user_id         UUID        REFERENCES users(id),
    correlation_id  UUID        NOT NULL,
    feature_context VARCHAR(255) NOT NULL, -- e.g. 'content-brain.idea-generation'
    provider        VARCHAR(50)  NOT NULL,
    model           VARCHAR(100) NOT NULL,
    prompt_tokens   INT         NOT NULL,
    completion_tokens INT       NOT NULL,
    estimated_cost_usd DECIMAL(12,6) NOT NULL,
    duration_ms     INT,
    status          VARCHAR(50)  NOT NULL DEFAULT 'success', -- success, failed, rate_limited
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Indexes

```sql
-- All tenant_id columns
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_social_accounts_tenant_id ON social_accounts(tenant_id);
CREATE INDEX idx_trend_detections_tenant_id ON trend_detections(tenant_id);
CREATE INDEX idx_content_ideas_tenant_id ON content_ideas(tenant_id);
CREATE INDEX idx_post_metrics_tenant_id ON post_metrics(tenant_id);
CREATE INDEX idx_ai_usage_logs_tenant_id ON ai_usage_logs(tenant_id);

-- High-frequency lookups
CREATE INDEX idx_trend_detections_status ON trend_detections(status, score DESC);
CREATE INDEX idx_content_ideas_status ON content_ideas(tenant_id, status);
CREATE INDEX idx_post_metrics_post_recorded ON post_metrics(post_id, recorded_at DESC);
CREATE INDEX idx_ai_usage_logs_tenant_date ON ai_usage_logs(tenant_id, created_at DESC);
CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
```

---

## Data Retention Policy

| Table | Retention | Archive Strategy |
|---|---|---|
| `trend_detections` | 90 days hot, 1 year cold | Move to `trend_detections_archive` |
| `post_metrics` | 2 years hot | Aggregate to weekly/monthly summaries after 90 days |
| `ai_usage_logs` | 1 year | Delete after 1 year |
| `content_assets` | Until manually deleted | Never auto-purge |
| `users`, `workspaces` | Until account deleted | Soft delete only |
