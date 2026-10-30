-- Administrator-only app setup. Never changes the shared systemchart schema.
-- psql "$DATABASE_ADMIN_URL" -v app_schema=myapp -f sql/auth_tables.sql
\ir validate_schema.sql
BEGIN;
CREATE SCHEMA IF NOT EXISTS :"app_schema";

-- Users table
CREATE TABLE IF NOT EXISTS :"app_schema".users (
  id UUID PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  entity TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Magic tokens for passwordless login
CREATE TABLE IF NOT EXISTS :"app_schema".magic_tokens (
  token TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_magic_tokens_expires ON :"app_schema".magic_tokens (expires_at);
CREATE INDEX IF NOT EXISTS idx_magic_tokens_cleanup ON :"app_schema".magic_tokens (expires_at) WHERE used_at IS NULL;

-- Allowed email domains (configurable per-app)
-- Entity '*' means global (allowed for all)
CREATE TABLE IF NOT EXISTS :"app_schema".allowed_domains (
  entity TEXT NOT NULL,
  domain TEXT NOT NULL,
  PRIMARY KEY (entity, domain)
);

COMMENT ON TABLE :"app_schema".allowed_domains IS 'Allowed email domains. Entity ''*'' means allowed globally.';

-- UN System email domains
-- Entity '*' = global (allowed for all entities)
-- Customize this list for your app - remove domains you don't need
INSERT INTO :"app_schema".allowed_domains (entity, domain) VALUES
  -- UN Secretariat
  ('*', 'un.org'),
  
  -- UN Funds and Programmes
  ('UNDP', 'undp.org'),
  ('UNICEF', 'unicef.org'),
  ('UNFPA', 'unfpa.org'),
  ('WFP', 'wfp.org'),
  ('UNHCR', 'unhcr.org'),
  ('UNRWA', 'unrwa.org'),
  ('UN-Habitat', 'unhabitat.org'),
  ('UNEP', 'unep.org'),
  ('UNODC', 'unodc.org'),
  ('UN-Women', 'unwomen.org'),
  
  -- Specialized Agencies
  ('WHO', 'who.int'),
  ('UNESCO', 'unesco.org'),
  ('ILO', 'ilo.org'),
  ('FAO', 'fao.org'),
  ('IFAD', 'ifad.org'),
  ('IMO', 'imo.org'),
  ('ICAO', 'icao.int'),
  ('ITU', 'itu.int'),
  ('UPU', 'upu.int'),
  ('WIPO', 'wipo.int'),
  ('UNIDO', 'unido.org'),
  ('UNWTO', 'unwto.org'),
  ('WMO', 'wmo.int'),
  
  -- Related Organizations
  ('IAEA', 'iaea.org'),
  ('WTO', 'wto.org'),
  ('IOM', 'iom.int'),
  ('ICJ', 'icj-cij.org'),
  
  -- Regional Commissions
  ('ECLAC', 'cepal.org'),
  ('ESCAP', 'un.org'),      -- uses un.org
  ('ESCWA', 'un.org'),      -- uses un.org
  ('ECA', 'un.org'),        -- uses un.org
  ('ECE', 'un.org'),        -- uses un.org
  
  -- Other UN entities
  ('UNCTAD', 'unctad.org'),
  ('ITC', 'intracen.org'),
  ('UNAIDS', 'unaids.org'),
  ('UNSSC', 'unssc.org'),
  ('UNU', 'unu.edu'),
  ('UNCCD', 'unccd.int')
ON CONFLICT DO NOTHING;

COMMIT;
