# Set up email-link sign-in

Follow this guide in a checkout of the authenticated version. Start with the installation steps in the README. Database provisioning is an administrator task; visitors only need access to their email.

## Before you start

You need:

- Node.js and pnpm as described in the README, with `pnpm install` completed.
- A PostgreSQL database and an administrator connection that can create the app schema, tables and a restricted login. PostgreSQL 18 is used in CI. If a shared `systemchart` directory exists, its owner must permit granting read access to `systemchart.entities`.
- The `psql` command-line client, included with [PostgreSQL installations](https://www.postgresql.org/download/). Check `psql --version` in your terminal. These scripts use psql commands and cannot be pasted unchanged into a generic SQL editor.
- An SMTP email service, its host/port, credentials and an approved sender address. Ask your organization's email administrator for these details. For local development, the optional recipe below captures mail on your computer.

Choose a unique schema name and runtime role for your application. This guide uses `my_website` and `my_website_runtime`; replace them consistently. Schema names must match `[a-z][a-z0-9_]{0,62}`: a lowercase letter followed by lowercase letters, digits or underscores, up to 63 characters. `public`, `systemchart`, `information_schema` and names beginning `pg_` are reserved. PostgreSQL roles are shared across databases in a cluster, so role names must also be unique there.

## 1. Configure local settings

Copy `.env.example` to `.env.local` if you have not already done so. Generate a secret using Node.js, which is already installed:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Paste the result into `AUTH_SECRET`. Keep it private and stable across server instances; changing it signs everyone out.

| Setting                  | What to enter                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`           | Leave empty until step 4. It will contain the restricted runtime login, not the administrator login.   |
| `DB_SCHEMA`              | Your chosen app schema, matching `app_schema` in step 3.                                               |
| `AUTH_SECRET`            | The generated random secret, at least 32 characters.                                                   |
| `BASE_URL`               | `http://localhost:3000` locally; your public HTTPS origin in production. Email links use this address. |
| `NEXT_PUBLIC_SITE_URL`   | The same origin, used for website metadata. Set it before building.                                    |
| `SMTP_HOST`, `SMTP_PORT` | Your SMTP host and port: usually 587 for STARTTLS or 465 for TLS.                                      |
| `SMTP_USER`, `SMTP_PASS` | Credentials supplied by your email administrator. Leave both empty only for a local test relay.        |
| `SMTP_FROM`              | An approved sender address.                                                                            |

Restart `pnpm dev` after changing settings. If development uses a different port, update `BASE_URL` to match before requesting a sign-in link. Production requires HTTPS. Remote PostgreSQL connections require verified TLS; use `sslmode=verify-full`. Use `sslmode=disable` only for a local loopback connection.

### Optional: run local services with Docker

If you have [Docker](https://docs.docker.com/get-started/get-docker/), these commands start a disposable development database and [Mailpit](https://mailpit.axllent.org/docs/install/docker/), which captures messages instead of delivering them. Run each command as a single line on macOS/Linux or PowerShell:

```bash
docker run --name boilerplate-postgres -e POSTGRES_USER=boilerplate_admin -e POSTGRES_PASSWORD=local-demo-only -e POSTGRES_DB=boilerplate_local -p 127.0.0.1:5432:5432 -d postgres:18
docker run --name boilerplate-mailpit -p 127.0.0.1:1025:1025 -p 127.0.0.1:8025:8025 -d axllent/mailpit:v1.27.4
```

These example credentials are for this local database only. Wait for `docker logs boilerplate-postgres` to report that the database is ready. If a port is already occupied, stop the conflicting service or change the host port and corresponding settings. You still need the local `psql` client for the SQL steps below.

Use `postgresql://boilerplate_admin:local-demo-only@127.0.0.1:5432/boilerplate_local?sslmode=disable` as the administrator URL in step 2. Set these values in `.env.local`:

```dotenv
DB_SCHEMA=my_website
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@example.org
```

Keep the generated `AUTH_SECRET` and local origins from above. Complete steps 2–4 to provision the database and fill `DATABASE_URL`. In step 5, use `developer@un.org` as a synthetic test address and open [localhost:8025](http://localhost:8025) to read its captured sign-in email. Mailpit does not send it to a real mailbox.

To stop the services, run `docker stop boilerplate-postgres boilerplate-mailpit`; restart them with `docker start boilerplate-postgres boilerplate-mailpit`. Keep these containers for later previews. Removing the database container without a separate volume removes its database contents.

## 2. Connect as an administrator and prepare the directory

Set `DATABASE_ADMIN_URL` in the current terminal so it remains available to **all** provisioning commands. For a real database, obtain the administrator URL through your organization's secret handling. To paste it without displaying it or putting it in command history, use one of these options.

In Bash (macOS/Linux; start `bash` first if your terminal uses another shell):

```bash
read -r -s -p 'Administrator PostgreSQL URL: ' DATABASE_ADMIN_URL
export DATABASE_ADMIN_URL
printf '\n'
```

In PowerShell:

```powershell
$adminConnection = Read-Host 'Administrator PostgreSQL URL' -AsSecureString
$env:DATABASE_ADMIN_URL = [System.Net.NetworkCredential]::new('', $adminConnection).Password
Remove-Variable adminConnection
$DATABASE_ADMIN_URL = $env:DATABASE_ADMIN_URL
```

Use this same terminal for the following steps. The website does not use this administrator variable. Check that you are connected to the intended database and host before creating anything:

```bash
psql "$DATABASE_ADMIN_URL" -c '\conninfo'
```

**If the database already has `systemchart`:** ask its owner to confirm `systemchart.entities` has `entity` and `entity_long` columns. Skip the bootstrap and continue to step 3.

**If the database has no `systemchart` schema:** run:

```bash
pnpm db:bootstrap-entities
```

This creates a minimal directory from the 243 source-verified entries bundled in `data/reference/systemchart-entities.json`. No Airtable credentials or download are required. If the entire schema already exists, the command makes no changes, including when that schema is empty or its table is missing. Ask the owner to resolve an incomplete existing schema. Directory data is never imported automatically by the running website. See [Entity directory sources](entity-directory.md) for provenance and the update procedure.

## 3. Create app tables and the runtime login

Replace the example schema and role with your chosen names:

```bash
psql "$DATABASE_ADMIN_URL" -v app_schema=my_website -f sql/auth_tables.sql
psql "$DATABASE_ADMIN_URL" -v app_schema=my_website -v app_role=my_website_runtime -f sql/app_role.sql
```

`app_schema` is required; omitting it fails before creating anything. The second script asks for the new runtime password twice with hidden input and stores a SCRAM hash. Generate and store a strong, nonempty password with a password manager. Do not pipe input to this script.

Role creation and grants run in one transaction. A SQL error, password mismatch or Ctrl+C rolls them back. An existing role is refused. Empty input or EOF in psql's password prompt clears the password: if that happens, connect as administrator and run `\password my_website_runtime` to set a nonempty password.

The runtime role receives database `CONNECT`, schema `USAGE`, `SELECT/INSERT/UPDATE` on app `users` and `magic_tokens`, and `SELECT` on `allowed_domains` and `systemchart.entities`. It needs no grants on the `public` schema. Setup aborts if existing `PUBLIC` grants would give it schema-creation or directory-write privileges. Ask the administrator to review those shared grants rather than changing them for other applications.

App table setup can be rerun for the same schema. It seeds default UN email domains only when it first creates the `allowed_domains` table; reruns preserve subsequent administrator changes, including an empty allowlist. Table setup creates missing tables but does not migrate existing table definitions.

### Choose who can sign in

Review the default allowed domains before publishing. To inspect them, open an administrator session with `psql "$DATABASE_ADMIN_URL"` and run, using your schema name:

```sql
SELECT entity, domain FROM my_website.allowed_domains ORDER BY domain, entity;
```

For example, to remove a domain or allow another one:

```sql
DELETE FROM my_website.allowed_domains WHERE domain = 'un.org';
INSERT INTO my_website.allowed_domains (entity, domain)
VALUES ('*', 'example.org') ON CONFLICT DO NOTHING;
```

Replace these example domains with your admission policy. Use lowercase domain names. Admission checks the email domain only; the `entity` column does not restrict a domain to an organisation. Affiliation is self-reported and must not be used as proof that someone represents an organisation. Type `\q` to leave psql.

## 4. Configure and verify the runtime connection

Set `DATABASE_URL` in `.env.local` using the new runtime role and its password. For the local Docker example, its shape is:

```dotenv
DATABASE_URL=postgresql://my_website_runtime:YOUR_ENCODED_PASSWORD@127.0.0.1:5432/boilerplate_local?sslmode=disable
DB_SCHEMA=my_website
```

Replace `YOUR_ENCODED_PASSWORD`; percent-encode reserved characters in URL usernames/passwords, including `@`, `:`, `/`, `#` and `%`. Use your provider's hostname/database and `sslmode=verify-full` for a remote database. Never use the administrator login as `DATABASE_URL`.

Verify the runtime login using the connection-password prompt. This local example prompts for the password you just set:

```bash
psql "host=127.0.0.1 port=5432 dbname=boilerplate_local user=my_website_runtime sslmode=disable" -W -c 'SELECT current_user;'
```

For a remote database, replace host, port, database and user, and use `sslmode=verify-full`. A successful result names your runtime role. If a private certificate authority is required, arrange trusted certificates with your administrator; the application verifies remote certificates.

Remove the administrator variable after provisioning: `unset DATABASE_ADMIN_URL` in Bash, or `Remove-Item Env:DATABASE_ADMIN_URL; Remove-Variable DATABASE_ADMIN_URL` in PowerShell. Keep production credentials in your hosting service's secret settings.

## 5. Start and verify sign-in

Run `pnpm dev`, visit [localhost:3000/about](http://localhost:3000/about), and choose **Sign in**. Use an allowed email domain, open the emailed link, and select an organisation or enter a custom affiliation. For local Mailpit, read the message at [localhost:8025](http://localhost:8025). Returning users can sign in with their saved affiliation; the account menu changes it or signs out.

Links expire after 15 minutes and can be used once. Requests for the same address have a two-minute cooldown. Sessions use an HTTP-only signed cookie lasting 30 days. About, login and verification are public. The homepage and other pages require sign-in unless allowed in `src/proxy.ts`. `SiteShell` supplies account controls and session-aware navigation on every page. Protected pages redirect signed-out visitors to About; protected API routes return 401. Public paths are configured in `src/proxy.ts`. The health endpoint `/api/health` checks liveness, not database or email readiness.

| Problem                            | What to check                                                                                                                                            |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `psql` is not recognised           | Install the PostgreSQL client and ensure its executable directory is on your PATH; reopen the terminal.                                                  |
| Missing database settings          | Complete `.env.local` and restart the development server.                                                                                                |
| Schema validation fails            | Use the lowercase name rules above and the same name for `DB_SCHEMA` and SQL `app_schema`.                                                               |
| Runtime permission denied          | Confirm role provisioning succeeded and `DATABASE_URL` uses that role in the intended database.                                                          |
| No sign-in email                   | Check allowed domains, SMTP settings, spam folder and server logs. With Mailpit, check its local inbox; wait two minutes before requesting another link. |
| Email link opens the wrong address | Correct `BASE_URL`, restart, and request a fresh link.                                                                                                   |
| Expired or reused link             | Request a new link after the cooldown.                                                                                                                   |
| Production cookie is not retained  | Use HTTPS and confirm the configured origin matches the public website address.                                                                          |

## 6. Test changes

Run the README checks. For database tests, create a disposable local database ending in `_test`. The tests need a local administrator with `CREATEDB`, `CREATEROLE` and access to `pg_authid`, normally a superuser in the disposable cluster. They create and remove their own database and roles. Never use a shared or production cluster.

For the Docker services above:

```bash
docker exec boilerplate-postgres createdb -U boilerplate_admin boilerplate_test
```

In Bash:

```bash
export TEST_DATABASE_URL='postgresql://boilerplate_admin:local-demo-only@127.0.0.1:5432/boilerplate_test?sslmode=disable'
pnpm test:db
```

In PowerShell:

```powershell
$env:TEST_DATABASE_URL = 'postgresql://boilerplate_admin:local-demo-only@127.0.0.1:5432/boilerplate_test?sslmode=disable'
pnpm test:db
```

Tests refuse non-loopback hosts or database names without the `_test` suffix. Linux password-prompt checks also require the `script` terminal utility. To include browser sign-in tests, install Chromium with `pnpm exec playwright install chromium`, set `TEST_AUTH_BROWSER` to `1` in your shell environment, and rerun `pnpm test:db`. These tests use their own SMTP fixture on port 2525; no real mail is sent. Ports 2525 and 3100 must be available. Linux may need Playwright system dependencies; see [Maintenance](maintenance.md).

## 7. Deploy to a Node.js host

Use a host that supports the project's Node.js version and a persistent server process. Configure it to install with `pnpm install --frozen-lockfile`, build with `pnpm build`, and start with `pnpm start`. The authenticated version is served at the domain root.

Supply `AUTH_SECRET`, `DATABASE_URL`, `DB_SCHEMA`, `BASE_URL` and SMTP settings through the host's secret/environment configuration. Set `BASE_URL` and `NEXT_PUBLIC_SITE_URL` to the public HTTPS origin. Supply `NEXT_PUBLIC_*` settings at build time and rebuild after changes; keep runtime settings available to the running server. Arrange database firewall access and verified TLS, and verify a full sign-in after deployment. Use `/api/health` for liveness monitoring.

GitHub Pages serves static files and cannot run this version's authentication server. Its [publishing guide](github-pages.md) applies to the static version.

## Existing deployments

Legacy `AZURE_POSTGRES_HOST`, `AZURE_POSTGRES_DB`, `AZURE_POSTGRES_USER`, `AZURE_POSTGRES_PASSWORD` and optional `AZURE_POSTGRES_PORT` remain supported when `DATABASE_URL` is absent. Prefer `DATABASE_URL` for new setups. With legacy settings, `DB_SSL=false` is allowed only for local loopback development.
