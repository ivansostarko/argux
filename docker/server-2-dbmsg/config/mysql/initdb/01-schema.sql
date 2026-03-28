-- ============================================================
-- argux — MySQL 9.1 Initial Schema (Laravel Log Tables)
-- ============================================================

USE argux_logs;

-- Slow query log
CREATE TABLE IF NOT EXISTS slow_query_log (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    query       TEXT NOT NULL,
    duration_ms DOUBLE NOT NULL,
    connection  VARCHAR(50),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Auth log
CREATE TABLE IF NOT EXISTS auth_log (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT,
    event       VARCHAR(50) NOT NULL,
    ip_address  VARCHAR(45),
    user_agent  VARCHAR(512),
    metadata    JSON,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_event (user_id, event),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- App errors
CREATE TABLE IF NOT EXISTS app_errors (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    level       VARCHAR(20) NOT NULL,
    message     TEXT NOT NULL,
    context     JSON,
    channel     VARCHAR(50),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_level (level),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- AI task log
CREATE TABLE IF NOT EXISTS ai_task_log (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    model_name      VARCHAR(100) NOT NULL,
    task_type       VARCHAR(50) NOT NULL,
    duration_ms     DOUBLE,
    tokens_used     INT,
    confidence      DOUBLE,
    status          VARCHAR(20) DEFAULT 'completed',
    metadata        JSON,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_model (model_name),
    INDEX idx_task_type (task_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;
