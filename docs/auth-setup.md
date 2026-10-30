# Authentication setup (template-with-auth only)

Switch to `template-with-auth` before following this guide. The static main branch does not connect to a database or send email. An administrator should complete database provisioning; ordinary website users do not need database access.

## 1. Configure local settings

Copy `.env.example` to `.env.local`. Configure:

| Setting                  | Meaning                                                                                                                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`           | Connection string for the **restricted runtime login**, not an administrator. Use TLS verification (`sslmode=verify-full`) for remote PostgreSQL.                           |
| `DB_SCHEMA`              | Your app's own auth schema, such as `myapp`; use letters, digits and underscores, beginning with a letter. Never use `public`, `systemchart` or a PostgreSQL system schema. |
| `AUTH_SECRET`            | At least 32 random characters. Generate with `openssl rand -hex 32`; keep it private and stable across server instances. Changing it signs everyone out.                    |
| `BASE_URL`               | Trusted website origin, e.g. `http://localhost:3000` locally or `https://example.un.org` in production. Emailed links use this value, never the incoming Host header.       |
| `SMTP_HOST`, `SMTP_PORT` | Your organisation's SMTP server and port, usually 587 (STARTTLS) or 465 (TLS).                                                                                              |
| `SMTP_USER`, `SMTP_PASS` | SMTP credentials; omit both only for an explicitly configured local testing relay.                                                                                          |
| `SMTP_FROM`              | Approved sender email address.                                                                                                                                              |

Production requires HTTPS for `BASE_URL`. Remote PostgreSQL must present a valid certificate. For a local PostgreSQL server use `sslmode=disable` on a loopback address only. Restart `pnpm dev` after changing settings.

Older installations using `AZURE_POSTGRES_*` settings remain supported. Prefer `DATABASE_URL` for new installations; do not configure both. Set `DB_SSL=false` only for local loopback development with the legacy settings.

## 2. Decide where the entity directory comes from

The picker reads only `entity` and `entity_long` from `systemchart.entities`. The template includes **243 independently source-verified entries**, reconstructed from historical System Chart exports, explicit Mandates curation and Open’s published export in `data/reference/systemchart-entities.json`. Independent setup uses this bundled file without Airtable credentials or a network download. See [Entity directory sources](entity-directory.md) for the Airtable/export lineage, Mandates curation, checksum and differences from the smaller 169-entry Navigator JSON and Open's 255-entry export.

**Existing/shared database:** do not import anything. Ask the directory owner to confirm that `systemchart.entities` exposes those two columns, then proceed to app setup. The boilerplate never migrates, renames, updates or refreshes an existing directory.

**Independent/new database:** an administrator can explicitly run:

```bash
DATABASE_ADMIN_URL='postgresql://administrator:password@host/database?sslmode=verify-full' pnpm db:bootstrap-entities
```

This environment prefix syntax is for macOS/Linux; in PowerShell set `$env:DATABASE_ADMIN_URL` first, then run the command. Avoid leaving credentials in shell history; use your organisation's secret handling or an injected environment variable. The website itself never reads `DATABASE_ADMIN_URL`.

The bootstrap reads and validates the bundled JSON, and creates a minimal compatible `systemchart.entities` table **only if the entire schema does not exist**. If `systemchart` already exists, it exits without reading the seed file or writing anything, even if the schema is empty or its table is missing. Concurrent bootstrap attempts are serialized with a transaction advisory lock; ordinary `CREATE SCHEMA` fails safely if another tool creates it in the meantime. All inserts and schema creation are atomic. There is no overwrite, update, refresh or force option. Nothing imports automatically at startup, build, login or deployment.

Only the two required fields are imported; additional JSON metadata is not needed. Imported keys must be unique, nonempty and fit the existing 255-character key convention. Source failures or invalid data abort without creating a partial schema. The bundled source path, its SHA-256 and import timestamp are recorded in a table comment.

## 3. Create app tables and the runtime login

Run `psql` as a database administrator or an owner with the necessary permissions, against the intended database:

```bash
psql "$DATABASE_ADMIN_URL" -v app_schema=myapp -f sql/auth_tables.sql
psql "$DATABASE_ADMIN_URL" -v app_schema=myapp -v app_role=myapp_runtime -f sql/app_role.sql
```

In an interactive administrator `psql` session, set the new login's password using `\password myapp_runtime`. Passwords are not embedded in SQL files. `CREATE ROLE` is cluster-wide: role setup refuses to reuse an existing role, so choose a unique name for each new application. Existing applications can review and apply the documented grants manually. Auth table setup is rerunnable for the same application schema; it does not grant the runtime login ownership.

Set `DATABASE_URL` in `.env.local` to this runtime login. `DB_SCHEMA` must match `app_schema`. SQL scripts use quoted psql variables; the application separately validates its schema identifier.

The role receives database `CONNECT`, schema `USAGE`, `SELECT/INSERT/UPDATE` on `users` and `magic_tokens`, and read access to `allowed_domains` and `systemchart.entities`. It receives no public-schema grants or document access, sequence permissions, `DELETE`, schema creation, ownership, role creation, or grant options. PostgreSQL's inherited and `PUBLIC` privileges can add access: the setup script checks effective access and aborts if the role could write to `systemchart` or create objects in application/public schemas. An administrator must resolve unsafe existing grants; the template does not revoke permissions from other applications.

UUID defaults explicitly use `pg_catalog.gen_random_uuid()`; neither the document-search tables nor a function in `public` is required. The isolated database tests revoke public-schema usage before running the runtime auth queries.

Allowed domains are initially seeded with UN system domains. Administrators can adjust the list in the app's `allowed_domains` table. `entity='*'` means a global domain entry; currently admission checks the domain only, and affiliation is self-reported, not an authorization role. Do not use a selected entity as proof that a visitor represents that organisation.

## 4. Start and verify

Run `pnpm dev`, visit `/about`, and choose **Sign in**. Request an email from an allowed domain, follow its link, and select an entity (or explicitly choose a custom affiliation). Returning users can complete sign-in with their existing affiliation. The account menu lets users update their entity and sign out.

Links expire after 15 minutes and are consumed once. Sessions use an HTTP-only signed cookie lasting 30 days; sessions are not stored in a database table. Protected pages redirect unauthenticated visitors to About. Protected API routes return 401. The health endpoint `/api/health` returns liveness only and does not expose settings or credentials.

## 5. Test and deploy

`pnpm test` checks session signatures and input validation. For database tests create a **disposable database whose name ends in `_test`** and use a local test administrator with `CREATEDB` and `CREATEROLE`, and give its URL to:

```bash
TEST_DATABASE_URL='postgresql://local_admin@localhost/boilerplate_test?sslmode=disable' pnpm test:db
```

These tests create and remove their own test objects and exercise restricted-role queries and existing-schema preservation. They refuse non-loopback hosts and database names without the `_test` suffix. CI runs them against a fresh PostgreSQL service. Set `TEST_AUTH_BROWSER=1` when running `pnpm test:db` to also exercise the emailed link, entity selection/change, logout, and expired/reused links in Chromium; install Chromium first with `pnpm exec playwright install chromium`. These browser checks use a local SMTP fixture on port 2525 and the restricted database login. No real email is sent by automated tests.

For production, run `pnpm build`, then `pnpm start`, on a Node.js host. Supply runtime database, secret and SMTP variables through the host's secret settings. Set `BASE_URL` and `NEXT_PUBLIC_SITE_URL` to the public origin; the auth variant uses the domain root. Configure database firewall access and verified TLS. `/api/health` can be used for host liveness checks. Do not use GitHub Pages, `out/`, or the static branch's Pages workflow for this version.
