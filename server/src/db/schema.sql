-- =============================================================
-- URL Shortener — Database Schema
-- Run with: psql $DATABASE_URL -f src/db/schema.sql
-- =============================================================

-- Enable the pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------------
-- USERS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT        NOT NULL UNIQUE,
  password    TEXT        NOT NULL,                  -- bcrypt hash
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- URLS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS urls (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         VARCHAR(12) NOT NULL UNIQUE,          -- nanoid short code
  original_url TEXT        NOT NULL,
  user_id      UUID        REFERENCES users(id) ON DELETE CASCADE,
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at   TIMESTAMPTZ                           -- NULL = never expires
);

CREATE INDEX IF NOT EXISTS idx_urls_slug    ON urls (slug);
CREATE INDEX IF NOT EXISTS idx_urls_user_id ON urls (user_id);

-- -------------------------------------------------------------
-- CLICKS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clicks (
  id          BIGSERIAL   PRIMARY KEY,
  url_id      UUID        NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
  clicked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip          TEXT,                                  -- raw IP (hash if privacy-sensitive)
  country     VARCHAR(2),                            -- ISO 3166-1 alpha-2, e.g. 'SG'
  referrer    TEXT,
  user_agent  TEXT,
  browser     VARCHAR(64),                           -- parsed from user_agent
  os          VARCHAR(64),                           -- parsed from user_agent
  device      VARCHAR(16)                            -- 'desktop' | 'mobile' | 'tablet'
);

CREATE INDEX IF NOT EXISTS idx_clicks_url_id    ON clicks (url_id);
CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON clicks (clicked_at DESC);
-- Composite index for the most common analytics query pattern
CREATE INDEX IF NOT EXISTS idx_clicks_url_time  ON clicks (url_id, clicked_at DESC);