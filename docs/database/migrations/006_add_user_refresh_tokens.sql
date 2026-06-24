-- Migration 006: Add user_refresh_tokens table + status column
-- Phase: Multi-device sessions, token_expired tracking

BEGIN;

-- 1. Create user_refresh_tokens table
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

CREATE INDEX idx_user_refresh_tokens_user_id ON user_refresh_tokens(user_id);
CREATE INDEX idx_user_refresh_tokens_revoked_at ON user_refresh_tokens(revoked_at);
CREATE UNIQUE INDEX idx_user_refresh_tokens_token ON user_refresh_tokens(token);

-- 2. Add status column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50);

-- 3. Migrate existing refresh tokens from users to user_refresh_tokens
-- Only migrate users with a valid tenant_id that exists in workspaces
INSERT INTO user_refresh_tokens (user_id, tenant_id, token, expires_at, created_at, updated_at)
SELECT
    u.id AS user_id,
    u.tenant_id,
    u.refresh_token AS token,
    u.refresh_token_expires_at AS expires_at,
    now() AS created_at,
    now() AS updated_at
FROM users u
INNER JOIN workspaces w ON w.id = u.tenant_id
WHERE u.refresh_token IS NOT NULL
  AND u.refresh_token_expires_at > now()
  AND u.deleted_at IS NULL;

-- 4. Drop old columns from users
ALTER TABLE users DROP COLUMN IF EXISTS refresh_token;
ALTER TABLE users DROP COLUMN IF EXISTS refresh_token_expires_at;

COMMIT;
