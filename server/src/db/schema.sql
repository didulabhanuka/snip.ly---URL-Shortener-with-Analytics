-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- URLs table
CREATE TABLE IF NOT EXISTS urls (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT UNIQUE NOT NULL,
  original_url  TEXT NOT NULL,
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  password_hash TEXT DEFAULT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_urls_slug ON urls(slug);
CREATE INDEX IF NOT EXISTS idx_urls_user_id ON urls(user_id);

-- Migration: add password_hash if upgrading existing db
ALTER TABLE urls ADD COLUMN IF NOT EXISTS password_hash TEXT DEFAULT NULL;

-- Clicks table
CREATE TABLE IF NOT EXISTS clicks (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url_id     UUID REFERENCES urls(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  ip         TEXT,
  country    TEXT,
  referrer   TEXT,
  browser    TEXT,
  os         TEXT,
  device     TEXT
);

CREATE INDEX IF NOT EXISTS idx_clicks_url_id ON clicks(url_id);
CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON clicks(clicked_at);