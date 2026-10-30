-- Run with psql as an administrator; the script prompts for the role password.
-- psql "$DATABASE_ADMIN_URL" -v app_schema=myapp -v app_role=myapp_runtime -f sql/app_role.sql
\ir validate_schema.sql
\if :{?app_role}
\else
  \echo 'Supply -v app_role=your_unique_runtime_login'
  SELECT 1 / 0; -- ON_ERROR_STOP makes an invalid setup exit nonzero.
\endif
BEGIN;
SELECT format('CREATE ROLE %I NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS', :'app_role') \gexec
SELECT format('GRANT CONNECT ON DATABASE %I TO %I', current_database(), :'app_role') \gexec
-- No public-schema grant is needed: UUID generation uses pg_catalog.
GRANT USAGE ON SCHEMA :"app_schema", systemchart TO :"app_role";
GRANT SELECT, INSERT, UPDATE ON :"app_schema".users, :"app_schema".magic_tokens TO :"app_role";
GRANT SELECT ON :"app_schema".allowed_domains, systemchart.entities TO :"app_role";

-- PUBLIC grants count too. Abort rather than changing shared permissions.
SELECT set_config('boilerplate.runtime_role', :'app_role', true);
SELECT set_config('boilerplate.app_schema', :'app_schema', true);
DO $$
DECLARE
  runtime_role text := current_setting('boilerplate.runtime_role');
  app_schema text := current_setting('boilerplate.app_schema');
BEGIN
  IF has_database_privilege(runtime_role, current_database(), 'CREATE')
     OR has_schema_privilege(runtime_role, 'systemchart', 'CREATE')
     OR has_schema_privilege(runtime_role, app_schema, 'CREATE')
     OR has_schema_privilege(runtime_role, 'public', 'CREATE') THEN
    RAISE EXCEPTION 'Runtime login inherits CREATE through existing PUBLIC grants. Ask the administrator to resolve these grants.';
  END IF;
  IF EXISTS (
    SELECT FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'systemchart' AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
      AND has_table_privilege(runtime_role, c.oid, 'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
  ) OR EXISTS (
    SELECT FROM information_schema.column_privileges
    WHERE table_schema = 'systemchart' AND grantee IN (runtime_role, 'PUBLIC')
      AND privilege_type IN ('INSERT', 'UPDATE', 'REFERENCES')
  ) THEN
    RAISE EXCEPTION 'Runtime login inherits write access to systemchart. Existing shared grants must be resolved by its owner.';
  END IF;
END $$;
-- psql prompts twice with hidden input and hashes the password client-side.
-- Enter a nonempty password: psql treats empty input/EOF as clearing it.
SET LOCAL password_encryption = 'scram-sha-256';
\password :"app_role"
SELECT format('ALTER ROLE %I LOGIN', :'app_role') \gexec
COMMIT;
