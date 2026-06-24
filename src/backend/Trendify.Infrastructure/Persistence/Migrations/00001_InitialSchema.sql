-- ============================================================
-- Trendify initial schema migration
-- Run via: dotnet ef database update (EF handles this automatically)
-- This file is for reference only
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- Accounts module
-- ============================================================
CREATE TABLE IF NOT EXISTS workspaces (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id    UUID NOT NULL,
    name         VARCHAR(200) NOT NULL,
    slug         VARCHAR(200) NOT NULL,
    plan         VARCHAR(50) NOT NULL DEFAULT 'free',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ,
    deleted_at   TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_workspaces_slug
    ON workspaces(slug) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS users (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID NOT NULL,
    email             VARCHAR(255) NOT NULL,
    password_hash     VARCHAR(255) NOT NULL,
    display_name      VARCHAR(255),
    is_active         BOOLEAN NOT NULL DEFAULT true,
    role              VARCHAR(50) NOT NULL DEFAULT 'owner',
    refresh_token     TEXT,
    refresh_token_expires_at TIMESTAMPTZ,
    last_login_at     TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ,
    deleted_at        TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email
    ON users(email) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS social_accounts (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id            UUID NOT NULL,
    platform             VARCHAR(50) NOT NULL,
    platform_user_id     VARCHAR(200) NOT NULL,
    display_name         VARCHAR(200),
    username             VARCHAR(200),
    profile_image_url    TEXT,
    is_active            BOOLEAN NOT NULL DEFAULT true,
    follower_count       BIGINT NOT NULL DEFAULT 0,
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at     TIMESTAMPTZ,
    status               VARCHAR(30) NOT NULL DEFAULT 'active',
    last_synced_at       TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ,
    deleted_at           TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_social_accounts_platform_user
    ON social_accounts(tenant_id, platform, platform_user_id) WHERE deleted_at IS NULL;

-- ============================================================
-- Trends module
-- ============================================================
CREATE TABLE IF NOT EXISTS trend_detections (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID NOT NULL,
    keyword          VARCHAR(500) NOT NULL,
    niche            VARCHAR(200) NOT NULL,
    platform         VARCHAR(50) NOT NULL,
    score            NUMERIC(5,2) NOT NULL DEFAULT 0,
    velocity_score   NUMERIC(5,2),
    volume_score     NUMERIC(5,2),
    engagement_score NUMERIC(5,2),
    recency_score    NUMERIC(5,2),
    status           VARCHAR(30) NOT NULL DEFAULT 'rising',
    peak_at          TIMESTAMPTZ,
    expires_at       TIMESTAMPTZ,
    raw_data         JSONB,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ,
    deleted_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_trend_detections_tenant_status_score
    ON trend_detections(tenant_id, status, score DESC) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS trend_watchlist (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    trend_detection_id  UUID NOT NULL REFERENCES trend_detections(id),
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ,
    deleted_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_trend_watchlist_tenant_trend
    ON trend_watchlist(tenant_id, trend_detection_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS competitor_profiles (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID NOT NULL,
    tiktok_username   VARCHAR(100) NOT NULL,
    display_name      VARCHAR(200),
    avatar_url        VARCHAR(1000),
    follower_count    BIGINT,
    notes             TEXT,
    last_scanned_at   TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ,
    deleted_at        TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_competitor_profiles_tenant_username
    ON competitor_profiles(tenant_id, tiktok_username) WHERE deleted_at IS NULL;

-- ============================================================
-- Content module
-- ============================================================
CREATE TABLE IF NOT EXISTS content_ideas (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id            UUID NOT NULL,
    title                VARCHAR(500) NOT NULL,
    description          TEXT,
    hook                 VARCHAR(1000),
    script               TEXT,
    cta                  VARCHAR(500),
    niche                VARCHAR(200),
    target_persona_id    UUID,
    trend_id             UUID,
    status               VARCHAR(30) NOT NULL DEFAULT 'draft',
    generated_by_ai      BOOLEAN NOT NULL DEFAULT false,
    created_by_user_id   UUID NOT NULL,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ,
    deleted_at           TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_content_ideas_tenant_status
    ON content_ideas(tenant_id, status) WHERE deleted_at IS NULL;

-- ============================================================
-- Analytics module
-- ============================================================
CREATE TABLE IF NOT EXISTS post_metrics (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id          UUID NOT NULL,
    post_id            UUID NOT NULL,
    recorded_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    views              BIGINT NOT NULL DEFAULT 0,
    likes              BIGINT NOT NULL DEFAULT 0,
    comments           BIGINT NOT NULL DEFAULT 0,
    shares             BIGINT NOT NULL DEFAULT 0,
    saves              BIGINT NOT NULL DEFAULT 0,
    watch_time_seconds BIGINT NOT NULL DEFAULT 0,
    revenue_usd        NUMERIC(12,4) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_post_metrics_tenant_post
    ON post_metrics(tenant_id, post_id, recorded_at DESC);

-- ============================================================
-- Audience module
-- ============================================================
CREATE TABLE IF NOT EXISTS audience_profiles (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id            UUID NOT NULL,
    social_account_id    UUID NOT NULL,
    niche                VARCHAR(200) NOT NULL,
    total_followers      BIGINT NOT NULL DEFAULT 0,
    avg_engagement_rate  NUMERIC(6,4),
    age_distribution     JSONB,
    geo_distribution     JSONB,
    active_hours         JSONB,
    top_interests        TEXT[],
    status               VARCHAR(20) NOT NULL DEFAULT 'pending',
    last_analysed_at     TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ,
    deleted_at           TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_audience_profiles_account
    ON audience_profiles(tenant_id, social_account_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS audience_personas (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id            UUID NOT NULL,
    profile_id           UUID NOT NULL REFERENCES audience_profiles(id),
    name                 VARCHAR(200) NOT NULL,
    description          VARCHAR(2000),
    age_min              INT,
    age_max              INT,
    gender               VARCHAR(20),
    interests            TEXT[],
    pain_points          TEXT[],
    content_preferences  TEXT[],
    percentage           NUMERIC(5,2),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ,
    deleted_at           TIMESTAMPTZ
);

-- ============================================================
-- Learning module
-- ============================================================
CREATE TABLE IF NOT EXISTS content_patterns (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    niche               VARCHAR(200) NOT NULL,
    pattern_type        VARCHAR(100) NOT NULL,
    name                VARCHAR(300) NOT NULL,
    description         VARCHAR(2000),
    avg_engagement_rate NUMERIC(6,4),
    sample_size         INT NOT NULL DEFAULT 0,
    confidence          NUMERIC(4,3),
    tags                TEXT[],
    status              VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ,
    deleted_at          TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS improvement_recommendations (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID NOT NULL,
    pattern_id       UUID,
    category         VARCHAR(100) NOT NULL,
    title            VARCHAR(300) NOT NULL,
    rationale        VARCHAR(2000),
    actionable_advice VARCHAR(2000),
    priority         VARCHAR(20) NOT NULL DEFAULT 'medium',
    confidence       NUMERIC(4,3),
    status           VARCHAR(20) NOT NULL DEFAULT 'pending',
    applied_at       TIMESTAMPTZ,
    expires_at       TIMESTAMPTZ NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ,
    deleted_at       TIMESTAMPTZ
);

-- ============================================================
-- AI Engine module
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_prompts (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID NOT NULL,
    slug             VARCHAR(200) NOT NULL,
    name             VARCHAR(200) NOT NULL,
    description      VARCHAR(2000),
    template         TEXT NOT NULL,
    tier             VARCHAR(20) NOT NULL DEFAULT 'standard',
    feature_context  VARCHAR(200) NOT NULL,
    version          INT NOT NULL DEFAULT 1,
    is_active        BOOLEAN NOT NULL DEFAULT true,
    variables        JSONB,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ,
    deleted_at       TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_ai_prompts_slug_version
    ON ai_prompts(tenant_id, slug, version) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    user_id             UUID NOT NULL,
    correlation_id      UUID NOT NULL,
    feature_context     VARCHAR(200) NOT NULL,
    prompt_id           UUID,
    provider            VARCHAR(50) NOT NULL,
    model               VARCHAR(100) NOT NULL,
    prompt_tokens       INT NOT NULL,
    completion_tokens   INT NOT NULL,
    estimated_cost_usd  NUMERIC(10,6) NOT NULL,
    duration_ms         INT NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'success',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_tenant_created
    ON ai_usage_logs(tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_correlation
    ON ai_usage_logs(correlation_id);

-- ============================================================
-- Post-migration: add missing columns (idempotent)
-- ============================================================
ALTER TABLE social_accounts DROP COLUMN IF EXISTS workspace_id;
ALTER TABLE social_accounts ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users DROP COLUMN IF EXISTS workspace_id;
ALTER TABLE users DROP COLUMN IF EXISTS login_count;
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- ============================================================
-- user_refresh_tokens table (multi-device sessions)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id       UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    token           VARCHAR(500) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    revoked_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_refresh_tokens_user_id ON user_refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_refresh_tokens_revoked_at ON user_refresh_tokens(revoked_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_refresh_tokens_token ON user_refresh_tokens(token);

ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50);

-- ============================================================
-- Infrastructure: Outbox pattern
-- ============================================================
CREATE TABLE IF NOT EXISTS outbox_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    type            TEXT NOT NULL,
    data            TEXT NOT NULL,
    occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at    TIMESTAMPTZ,
    error           TEXT
);

CREATE INDEX IF NOT EXISTS idx_outbox_messages_unprocessed
    ON outbox_messages(occurred_at) WHERE processed_at IS NULL;
