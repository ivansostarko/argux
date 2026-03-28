-- ============================================================
-- argux — ClickHouse 25 Analytics Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS argux;

-- Location pings (highest volume table)
CREATE TABLE IF NOT EXISTS argux.location_pings (
    device_id       UInt64,
    subject_id      UInt64,
    latitude        Float64,
    longitude       Float64,
    altitude        Nullable(Float64),
    speed           Nullable(Float64),
    heading         Nullable(Float64),
    accuracy        Nullable(Float64),
    source          LowCardinality(String),
    ts              DateTime64(3, 'UTC')
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(ts)
ORDER BY (subject_id, device_id, ts)
TTL ts + INTERVAL 365 DAY;

-- Alert events
CREATE TABLE IF NOT EXISTS argux.alert_events (
    id              UInt64,
    alert_rule_id   UInt64,
    subject_id      UInt64,
    severity        UInt8,
    type            LowCardinality(String),
    context         String,
    ts              DateTime64(3, 'UTC')
) ENGINE = MergeTree()
ORDER BY (subject_id, ts)
TTL ts + INTERVAL 365 DAY;

-- LPR captures
CREATE TABLE IF NOT EXISTS argux.lpr_captures (
    id              UInt64,
    plate           String,
    confidence      Float32,
    camera_id       UInt64,
    latitude        Float64,
    longitude       Float64,
    image_path      String,
    ts              DateTime64(3, 'UTC')
) ENGINE = MergeTree()
ORDER BY (plate, ts)
TTL ts + INTERVAL 365 DAY;

-- Face match results
CREATE TABLE IF NOT EXISTS argux.face_match_results (
    id              UInt64,
    subject_id      UInt64,
    confidence      Float32,
    camera_id       UInt64,
    embedding_id    String,
    image_path      String,
    ts              DateTime64(3, 'UTC')
) ENGINE = MergeTree()
ORDER BY (subject_id, ts)
TTL ts + INTERVAL 365 DAY;

-- Voice ID results
CREATE TABLE IF NOT EXISTS argux.voice_id_results (
    id              UInt64,
    subject_id      UInt64,
    confidence      Float32,
    device_id       UInt64,
    audio_path      String,
    ts              DateTime64(3, 'UTC')
) ENGINE = MergeTree()
ORDER BY (subject_id, ts)
TTL ts + INTERVAL 365 DAY;

-- Audio transcriptions
CREATE TABLE IF NOT EXISTS argux.audio_transcriptions (
    id              UInt64,
    device_id       UInt64,
    language        LowCardinality(String),
    transcript      String,
    confidence      Float32,
    duration_sec    Float32,
    audio_path      String,
    ts              DateTime64(3, 'UTC')
) ENGINE = MergeTree()
ORDER BY (device_id, ts)
TTL ts + INTERVAL 365 DAY;

-- Anomaly events
CREATE TABLE IF NOT EXISTS argux.anomaly_events (
    id              UInt64,
    subject_id      UInt64,
    anomaly_type    LowCardinality(String),
    score           Float32,
    context         String,
    ts              DateTime64(3, 'UTC')
) ENGINE = MergeTree()
ORDER BY (subject_id, ts)
TTL ts + INTERVAL 365 DAY;

-- Prediction results
CREATE TABLE IF NOT EXISTS argux.prediction_results (
    id              UInt64,
    subject_id      UInt64,
    model           LowCardinality(String),
    prediction_type LowCardinality(String),
    result          String,
    confidence      Float32,
    ts              DateTime64(3, 'UTC')
) ENGINE = MergeTree()
ORDER BY (subject_id, ts)
TTL ts + INTERVAL 365 DAY;

-- Immutable audit log
CREATE TABLE IF NOT EXISTS argux.audit_log (
    id              UInt64,
    user_id         UInt64,
    action          LowCardinality(String),
    resource_type   LowCardinality(String),
    resource_id     UInt64,
    changes         String,
    ip_address      String,
    ts              DateTime64(3, 'UTC')
) ENGINE = ReplacingMergeTree(ts)
ORDER BY (id)
TTL ts + INTERVAL 730 DAY;
