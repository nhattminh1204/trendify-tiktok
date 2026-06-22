# Database Overview — Trendify

## Conventions (Bắt buộc)

```sql
-- Mọi bảng tenant-scoped đều có:
id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
tenant_id   UUID        NOT NULL,           -- LUÔN index
created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
deleted_at  TIMESTAMPTZ NULL               -- soft delete (NULL = chưa xóa)

-- Không dùng INT cho PK — luôn UUID
-- Tên bảng: snake_case, số nhiều (trend_detections, content_ideas)
-- Tên cột: snake_case (created_at, tenant_id)
-- FK: {referenced_table_singular}_id (social_account_id, post_id)
```

---

## Schema Map — Theo Module

### Module: Accounts

**`workspaces`** (= Tenant, không có tenant_id chính nó)
- `id`, `name`, `slug` (unique), `plan` (free/pro/agency)

**`users`**
- `id`, `tenant_id` → workspaces, `email` (unique khi chưa xóa), `password_hash` (bcrypt)
- `role` (owner/admin/editor/viewer), `is_active`, `last_login_at`

**`social_accounts`** (TikTok accounts)
- `id`, `tenant_id` → workspaces
- `platform` (tiktok/instagram), `platform_user_id`, `username`
- `access_token` (AES-256-GCM encrypted), `refresh_token` (encrypted)
- `token_expires_at`, `follower_count`, `is_active`, `last_synced_at`

**`account_groups`**
- `id`, `tenant_id`, `name`, `description`

**`account_group_members`** (junction table)
- `group_id` → account_groups, `social_account_id` → social_accounts

---

### Module: Trend Intelligence

**`trend_detections`**
- `id`, `tenant_id`, `keyword`, `platform` (tiktok)
- `score` (0–100), `velocity` (posts/hour), `volume` (total posts)
- `status`: `rising | peaking | declining | dead`
- `first_seen_at`, `peaked_at`, `detected_at`

**`trend_watchlist`**
- `id`, `tenant_id`, `trend_id` → trend_detections
- `added_by_user_id` → users, `notes`

**`competitor_profiles`**
- `id`, `tenant_id`, `platform`, `platform_user_id`, `username`, `last_analyzed_at`

---

### Module: Audience Intelligence

**`audience_profiles`**
- `id`, `tenant_id`, `social_account_id` → social_accounts
- `age_distribution` JSONB: `{"18-24": 0.42, "25-34": 0.31}`
- `gender_split` JSONB: `{"female": 0.65, "male": 0.35}`
- `top_countries` JSONB: `[{"code": "US", "pct": 0.45}]`
- `top_interests` JSONB: `["fitness", "nutrition"]`
- `active_hours` JSONB: `{"monday": [18, 19, 20, 21]}`
- `analyzed_at`

**`audience_personas`**
- `id`, `tenant_id`, `social_account_id` → social_accounts (nullable)
- `name`, `description`, `demographics` JSONB, `pain_points` JSONB
- `motivations` JSONB, `content_preferences` JSONB, `generated_by_ai`

---

### Module: Content

**`content_ideas`**
- `id`, `tenant_id`, `title`, `description`, `hook`, `script`, `cta`
- `niche`, `target_persona_id` → audience_personas (nullable)
- `trend_id` → trend_detections (nullable — ý tưởng inspired bởi trend)
- `status`: `draft | approved | in_production | published | archived`
- `generated_by_ai`, `ai_prompt_ref`, `created_by_user_id` → users

**`content_assets`** (files in MinIO, not stored in DB)
- `id`, `tenant_id`, `idea_id` → content_ideas (nullable)
- `asset_type`: `video | audio | subtitle | thumbnail`
- `storage_key` (MinIO object key), `file_size_bytes`, `duration_seconds`, `mime_type`

**`content_pipelines`**
- `id`, `tenant_id`, `name`, `is_active`
- `steps` JSONB: `[{"type": "voice_generation", "provider": "elevenlabs", "voice_id": "..."}, ...]`

**`content_pipeline_runs`**
- `id`, `tenant_id`, `pipeline_id` → content_pipelines, `idea_id` → content_ideas
- `status`: `pending | running | completed | failed`
- `started_at`, `completed_at`, `error_message`

---

### Module: Analytics

**`content_posts`**
- `id`, `tenant_id`, `social_account_id` → social_accounts
- `idea_id` → content_ideas (nullable — posts không qua Trendify sẽ không có)
- `platform_post_id` (TikTok's ID), `caption`, `posted_at`

**`post_metrics`** (**Append-only — không bao giờ UPDATE**)
- `id`, `tenant_id`, `post_id` → content_posts, `recorded_at`
- `views`, `likes`, `comments`, `shares`, `saves`, `watch_time_seconds`
- `revenue_usd` (TikTok Creator Fund)

---

### Module: Learning Engine

**`content_patterns`**
- `id`, `tenant_id`
- `pattern_type`: `winning | losing`
- `category`: `hook | length | posting_time | niche | cta | format`
- `description` (text), `confidence` (0–100), `evidence_count`

**`improvement_recommendations`**
- `id`, `tenant_id`, `social_account_id` → social_accounts (nullable)
- `title`, `description`, `priority`: `low | medium | high | critical`
- `status`: `active | applied | dismissed`
- `based_on_pattern_ids` UUID[] (PostgreSQL array)

---

### Module: AI Engine

**`ai_prompts`**
- `id`, `tenant_id` (NULL = system-level), `name`, `slug` (unique per tenant)
- `version` INT, `template` TEXT (có `{variable}` placeholders)
- `provider` (NULL = any), `model` (NULL = auto-route)
- `max_tokens`, `temperature`, `is_active`

**`ai_usage_logs`** (**Append-only**)
- `id`, `tenant_id`, `user_id`, `correlation_id`
- `feature_context` (e.g. `content-brain.idea-generation`)
- `provider`, `model`, `prompt_tokens`, `completion_tokens`
- `estimated_cost_usd`, `duration_ms`
- `status`: `success | failed | budget_exceeded`

---

## Indexes Quan trọng

```sql
-- Mọi tenant_id đều có index
CREATE INDEX idx_{table}_tenant_id ON {table}(tenant_id);

-- High-frequency lookups
CREATE INDEX idx_trend_detections_status ON trend_detections(status, score DESC);
CREATE INDEX idx_content_ideas_status ON content_ideas(tenant_id, status);
CREATE INDEX idx_post_metrics_post_recorded ON post_metrics(post_id, recorded_at DESC);
CREATE INDEX idx_ai_usage_logs_tenant_date ON ai_usage_logs(tenant_id, created_at DESC);
CREATE UNIQUE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
```

---

## Data Retention Policy

| Bảng | Hot | Archive |
|---|---|---|
| `trend_detections` | 90 ngày | Move to `trend_detections_archive` sau 1 năm |
| `post_metrics` | 90 ngày full | Sau 90 ngày: aggregate thành weekly/monthly summaries |
| `ai_usage_logs` | 1 năm | Xóa sau 1 năm |
| `content_assets` | Vĩnh viễn | Không auto-purge, chỉ xóa thủ công |
| `users`, `workspaces` | Vĩnh viễn | Chỉ soft delete |

---

## Migration Rules

- Tất cả dùng EF Core Migrations
- Mỗi migration có rollback script trong `src/infrastructure/Persistence/Migrations/Rollbacks/`
- Drop column: 2-phase (Phase 1: rename `_deprecated_`, Phase 2: drop sprint sau)
- Mọi PR chứa migration cần rollback instructions trong description
