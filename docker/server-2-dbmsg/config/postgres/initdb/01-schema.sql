-- ============================================================
-- argux — PostgreSQL Initial Schema
-- ============================================================

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Create Infisical database
CREATE DATABASE infisical OWNER argux_app;

-- ── Core Tables ─────────────────────────────────────────────

CREATE TABLE subjects (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    aliases         TEXT[],
    risk_level      SMALLINT DEFAULT 0 CHECK (risk_level BETWEEN 0 AND 10),
    photo_url       VARCHAR(512),
    notes           TEXT,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_subjects_tsvector ON subjects USING GIN (to_tsvector('english', name || ' ' || COALESCE(array_to_string(aliases, ' '), '')));
CREATE INDEX idx_subjects_risk ON subjects (risk_level);

CREATE TABLE organizations (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    type            VARCHAR(50),
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE devices (
    id              BIGSERIAL PRIMARY KEY,
    device_token    VARCHAR(255) UNIQUE NOT NULL,
    type            VARCHAR(50) NOT NULL,
    label           VARCHAR(255),
    subject_id      BIGINT REFERENCES subjects(id) ON DELETE SET NULL,
    last_seen       TIMESTAMPTZ,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_devices_token ON devices (device_token);
CREATE INDEX idx_devices_subject ON devices (subject_id);

CREATE TABLE device_latest_position (
    device_id       BIGINT PRIMARY KEY REFERENCES devices(id) ON DELETE CASCADE,
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    altitude        DOUBLE PRECISION,
    speed           DOUBLE PRECISION,
    heading         DOUBLE PRECISION,
    accuracy        DOUBLE PRECISION,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE geofences (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    geometry        GEOMETRY(Polygon, 4326) NOT NULL,
    alert_on_enter  BOOLEAN DEFAULT TRUE,
    alert_on_exit   BOOLEAN DEFAULT TRUE,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_geofences_gist ON geofences USING GIST (geometry);

CREATE TABLE alert_rules (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    type            VARCHAR(50) NOT NULL,
    severity        SMALLINT DEFAULT 3 CHECK (severity BETWEEN 1 AND 5),
    conditions      JSONB NOT NULL,
    enabled         BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE alert_events (
    id              BIGSERIAL PRIMARY KEY,
    alert_rule_id   BIGINT REFERENCES alert_rules(id),
    subject_id      BIGINT REFERENCES subjects(id),
    severity        SMALLINT NOT NULL,
    context         JSONB DEFAULT '{}',
    acknowledged    BOOLEAN DEFAULT FALSE,
    acknowledged_by BIGINT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions for current and next 12 months
DO $$
DECLARE
    start_date DATE := DATE_TRUNC('month', CURRENT_DATE);
    end_date DATE;
    partition_name TEXT;
BEGIN
    FOR i IN 0..12 LOOP
        end_date := start_date + INTERVAL '1 month';
        partition_name := 'alert_events_' || TO_CHAR(start_date, 'YYYY_MM');
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS %I PARTITION OF alert_events FOR VALUES FROM (%L) TO (%L)',
            partition_name, start_date, end_date
        );
        start_date := end_date;
    END LOOP;
END $$;

CREATE TABLE streams (
    id              BIGSERIAL PRIMARY KEY,
    stream_name     VARCHAR(255) UNIQUE NOT NULL,
    camera_id       BIGINT,
    location_id     BIGINT,
    status          VARCHAR(20) DEFAULT 'inactive',
    rtsp_url        VARCHAR(512),
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Media (spatie/laravel-medialibrary) ─────────────────────
CREATE TABLE media (
    id              BIGSERIAL PRIMARY KEY,
    model_type      VARCHAR(255) NOT NULL,
    model_id        BIGINT NOT NULL,
    uuid            UUID,
    collection_name VARCHAR(255) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    file_name       VARCHAR(255) NOT NULL,
    mime_type       VARCHAR(255),
    disk            VARCHAR(255) DEFAULT 'minio',
    size            BIGINT,
    manipulations   JSONB DEFAULT '[]',
    custom_properties JSONB DEFAULT '{}',
    responsive_images JSONB DEFAULT '{}',
    order_column    INT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_media_model ON media (model_type, model_id);

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO argux_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO argux_app;
