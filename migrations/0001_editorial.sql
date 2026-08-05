-- Editorial system of record (local / non-production first).
-- Remote apply requires Approval Gate.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS authors (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  handle TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS content_items (
  id TEXT PRIMARY KEY NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('episode', 'column', 'newsletter')),
  status TEXT NOT NULL CHECK (
    status IN (
      'idea',
      'research',
      'draft',
      'editing',
      'approved',
      'scheduled',
      'published',
      'syndicated'
    )
  ),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  body_markdown TEXT NOT NULL DEFAULT '',
  author_id TEXT NOT NULL REFERENCES authors (id),
  published_at TEXT,
  updated_at TEXT NOT NULL,
  canonical_url TEXT,
  category TEXT,
  disclosure TEXT,
  featured_asset_id TEXT,
  syndication_rule TEXT NOT NULL DEFAULT 'exclude'
    CHECK (syndication_rule IN ('exclude', 'excerpt', 'full_after_delay', 'full')),
  UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS idx_content_items_status_published
  ON content_items (status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_items_kind_status
  ON content_items (kind, status);

CREATE TABLE IF NOT EXISTS content_versions (
  id TEXT PRIMARY KEY NOT NULL,
  content_item_id TEXT NOT NULL REFERENCES content_items (id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body_markdown TEXT NOT NULL,
  status TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (content_item_id, version_number)
);

CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY NOT NULL,
  content_item_id TEXT REFERENCES content_items (id) ON DELETE SET NULL,
  r2_key TEXT NOT NULL,
  content_type TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  source_url TEXT NOT NULL,
  publisher TEXT,
  published_at TEXT,
  license TEXT,
  sensitivity TEXT NOT NULL CHECK (sensitivity IN ('public', 'internal', 'confidential')),
  approved INTEGER NOT NULL DEFAULT 0 CHECK (approved IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS citations (
  id TEXT PRIMARY KEY NOT NULL,
  content_item_id TEXT NOT NULL REFERENCES content_items (id) ON DELETE CASCADE,
  source_id TEXT NOT NULL REFERENCES sources (id),
  claim TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  source_url TEXT NOT NULL,
  published_at TEXT,
  verified_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_citations_content_item
  ON citations (content_item_id);

CREATE TABLE IF NOT EXISTS publication_requests (
  id TEXT PRIMARY KEY NOT NULL,
  content_item_id TEXT NOT NULL REFERENCES content_items (id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('linkedin', 'resend', 'rss', 'partner')),
  payload_version INTEGER NOT NULL DEFAULT 1,
  approval_state TEXT NOT NULL CHECK (
    approval_state IN (
      'draft',
      'needs_approval',
      'approved',
      'rejected',
      'executed',
      'failed'
    )
  ),
  idempotency_key TEXT NOT NULL,
  scheduled_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_publication_requests_content
  ON publication_requests (content_item_id, channel);

CREATE TABLE IF NOT EXISTS channel_deliveries (
  id TEXT PRIMARY KEY NOT NULL,
  publication_request_id TEXT NOT NULL REFERENCES publication_requests (id),
  channel TEXT NOT NULL,
  provider_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'failed', 'duplicate')),
  attempt INTEGER NOT NULL DEFAULT 1,
  diagnostic TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contacts_consent (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL,
  consent_source TEXT NOT NULL,
  consent_at TEXT NOT NULL,
  double_opt_in_at TEXT,
  unsubscribe_at TEXT,
  retention_until TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (email, consent_source)
);

CREATE TABLE IF NOT EXISTS knowledge_documents (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  source_url TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  sensitivity TEXT NOT NULL CHECK (sensitivity IN ('public', 'internal', 'confidential')),
  license TEXT NOT NULL DEFAULT '',
  collected_at TEXT NOT NULL,
  published_at TEXT,
  r2_key TEXT,
  approved INTEGER NOT NULL DEFAULT 0 CHECK (approved IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_approved_sensitivity
  ON knowledge_documents (approved, sensitivity);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_events_entity
  ON audit_events (entity_type, entity_id, created_at DESC);
