-- ============================================================
-- Video Engine module schema
-- ============================================================

CREATE TABLE IF NOT EXISTS video_render_jobs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    campaign_id         UUID,
    content_idea_id     UUID,
    status              VARCHAR(50) NOT NULL DEFAULT 'queued',
    render_type         VARCHAR(50) NOT NULL DEFAULT 'text_to_video',
    template_id         VARCHAR(100) NOT NULL DEFAULT 'product-review-v1',
    voice_id            VARCHAR(100) NOT NULL DEFAULT 'vi-VN-HoaiMyNeural',
    tts_engine          VARCHAR(50) NOT NULL DEFAULT 'edge',
    voice_speed         DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    script_text         TEXT,
    caption_text        TEXT,
    hashtags            TEXT[],
    output_url          TEXT,
    thumbnail_url       TEXT,
    duration_seconds    SMALLINT,
    file_size_bytes     BIGINT,
    error_message       TEXT,
    retry_count         SMALLINT NOT NULL DEFAULT 0,
    viral_template_id   UUID,
    ai_model_id         UUID,
    queued_at           TIMESTAMPTZ,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ,
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_video_render_jobs_tenant_status
    ON video_render_jobs(tenant_id, status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_video_render_jobs_campaign
    ON video_render_jobs(tenant_id, campaign_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS video_assets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    render_job_id   UUID NOT NULL REFERENCES video_render_jobs(id),
    tenant_id       UUID NOT NULL,
    asset_type      VARCHAR(50) NOT NULL,
    source_url      TEXT NOT NULL,
    minio_url       TEXT,
    sort_order      SMALLINT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ,
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_video_assets_job
    ON video_assets(render_job_id, sort_order) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS video_templates (
    id                  VARCHAR(100) PRIMARY KEY,
    name                VARCHAR(200) NOT NULL,
    description         TEXT,
    aspect_ratio        VARCHAR(20) NOT NULL DEFAULT '9:16',
    max_duration_seconds SMALLINT NOT NULL DEFAULT 60,
    min_duration_seconds SMALLINT NOT NULL DEFAULT 10,
    content_styles      TEXT[],
    preview_url         TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ
);

-- Seed default templates
INSERT INTO video_templates (id, name, description, content_styles, min_duration_seconds, max_duration_seconds)
VALUES
    ('product-review-v1', 'Product Review', 'Talking-head style with product overlay', ARRAY['review', 'testimonial'], 30, 60),
    ('product-showcase-v1', 'Product Showcase', 'Fast-cut product images with text overlays', ARRAY['entertaining', 'promotional'], 15, 30),
    ('educational-v1', 'Educational', 'Slide-by-slide with voiceover', ARRAY['educational', 'tutorial'], 45, 60)
ON CONFLICT (id) DO NOTHING;
