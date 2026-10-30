import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import pg from "pg";
import { bootstrapEntities } from "../scripts/bootstrap-entities.mjs";
import { connectionOptions } from "../src/lib/db/connection-options.ts";

const supplied = process.env.TEST_DATABASE_URL;
if (!supplied)
  throw new Error(
    "Set TEST_DATABASE_URL to a disposable loopback PostgreSQL database ending in _test.",
  );
const base = new URL(supplied);
if (
  !["localhost", "127.0.0.1", "[::1]"].includes(base.hostname) ||
  !base.pathname.endsWith("_test")
)
  throw new Error(
    "Refusing database tests: require loopback and a database name ending in _test.",
  );
const database = `boilerplate_${randomUUID().replaceAll("-", "")}_test`;
const runtimeRole = `starter_${randomUUID().replaceAll("-", "")}`;
const unsafeRole = `${runtimeRole}_unsafe`;
const root = new pg.Client(connectionOptions({ DATABASE_URL: supplied }));
const sandboxUrl = new URL(supplied);
sandboxUrl.pathname = `/${database}`;
const admin = new pg.Client(
  connectionOptions({ DATABASE_URL: sandboxUrl.toString() }),
);
const source = [
  { entity: "UNDP", entity_long: "United Nations Development Programme" },
  { entity: "UNICEF", entity_long: "United Nations Children's Fund" },
];
const fetchFixture = async () => Response.json(source);
function psql(file, role = runtimeRole, schema = "starter") {
  const result = spawnSync(
    "psql",
    [
      "-X",
      "-v",
      "ON_ERROR_STOP=1",
      "-v",
      `app_schema=${schema}`,
      "-v",
      `app_role=${role}`,
      "-f",
      file,
    ],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        PGHOST: base.hostname,
        PGPORT: base.port || "5432",
        PGDATABASE: database,
        PGUSER: decodeURIComponent(base.username),
        PGPASSWORD: decodeURIComponent(base.password),
        PGSSLMODE: base.searchParams.get("sslmode") || "verify-full",
      },
    },
  );
  return result;
}

test("entity bootstrap and least-privilege app setup on disposable PostgreSQL", async (t) => {
  await root.connect();
  await root.query(`CREATE DATABASE ${database}`);
  try {
    await admin.connect();
    await t.test(
      "invalid source and HTTP failures leave no schema behind",
      async () => {
        await assert.rejects(
          bootstrapEntities(admin, async () =>
            Response.json([source[0], source[0]]),
          ),
          /duplicate/,
        );
        await assert.rejects(
          bootstrapEntities(
            admin,
            async () => new Response("unavailable", { status: 503 }),
          ),
          /503/,
        );
        assert.equal(
          (
            await admin.query(
              "SELECT 1 FROM pg_namespace WHERE nspname='systemchart'",
            )
          ).rowCount,
          0,
        );
      },
    );
    await t.test(
      "concurrent independent setup imports exactly once",
      async () => {
        const second = new pg.Client(
          connectionOptions({ DATABASE_URL: sandboxUrl.toString() }),
        );
        await second.connect();
        try {
          const results = await Promise.all([
            bootstrapEntities(admin, fetchFixture),
            bootstrapEntities(second, fetchFixture),
          ]);
          assert.equal(results.filter((r) => r.created).length, 1);
          assert.equal(
            (await admin.query("SELECT * FROM systemchart.entities")).rowCount,
            2,
          );
        } finally {
          await second.end();
        }
      },
    );
    await t.test(
      "existing directory is preserved byte-for-byte without a fetch",
      async () => {
        await admin.query(
          "CREATE TABLE systemchart.extra (secret text); INSERT INTO systemchart.extra VALUES ('keep me')",
        );
        const snapshot = async () =>
          (
            await admin.query(
              "SELECT row_to_json(e) AS row FROM systemchart.entities e ORDER BY entity",
            )
          ).rows;
        const before = await snapshot();
        const result = await bootstrapEntities(admin, () => {
          throw new Error("Network must not be used");
        });
        assert.equal(result.created, false);
        assert.deepEqual(await snapshot(), before);
        assert.equal(
          (await admin.query("SELECT secret FROM systemchart.extra")).rows[0]
            .secret,
          "keep me",
        );
      },
    );
    await t.test(
      "reserved schema names cannot direct auth setup at systemchart",
      async () => {
        assert.notEqual(
          psql("sql/auth_tables.sql", runtimeRole, "systemchart").status,
          0,
        );
        assert.equal(
          (
            await admin.query(
              "SELECT to_regclass('systemchart.users') AS table_name",
            )
          ).rows[0].table_name,
          null,
        );
      },
    );
    await t.test(
      "auth setup is rerunnable; runtime role exercises every required query",
      async () => {
        for (let i = 0; i < 2; i++) {
          const result = psql("sql/auth_tables.sql");
          assert.equal(result.status, 0, result.stderr);
        }
        const setup = psql("sql/app_role.sql");
        assert.equal(setup.status, 0, setup.stderr);
        await admin.query(`SET ROLE ${runtimeRole}`);
        try {
          assert.equal(
            (
              await admin.query(
                "SELECT entity, entity_long FROM systemchart.entities ORDER BY entity",
              )
            ).rowCount,
            2,
          );
          assert.ok(
            Number(
              (
                await admin.query(
                  "SELECT count(*) FROM starter.allowed_domains WHERE domain='un.org'",
                )
              ).rows[0].count,
            ) > 0,
          );
          await admin.query(
            "INSERT INTO starter.magic_tokens (token,email,expires_at) VALUES ('token','test@un.org',now()+interval '15 minutes')",
          );
          assert.equal(
            (
              await admin.query(
                "SELECT count(*) FROM starter.magic_tokens WHERE email='test@un.org' AND used_at IS NULL AND expires_at > now()+interval '13 minutes'",
              )
            ).rows[0].count,
            "1",
          );
          assert.equal(
            (
              await admin.query(
                "UPDATE starter.magic_tokens SET used_at=now() WHERE token='token' AND used_at IS NULL RETURNING email",
              )
            ).rows[0].email,
            "test@un.org",
          );
          assert.equal(
            (
              await admin.query(
                "UPDATE starter.magic_tokens SET used_at=now() WHERE token='token' AND used_at IS NULL RETURNING email",
              )
            ).rowCount,
            0,
          );
          for (let i = 0; i < 2; i++)
            await admin.query(
              "INSERT INTO starter.users (email,last_login_at) VALUES ('test@un.org',now()) ON CONFLICT(email) DO UPDATE SET last_login_at=now() RETURNING id",
            );
          await admin.query(
            "UPDATE starter.users SET entity='UNDP' WHERE email='test@un.org'",
          );
          assert.equal(
            (
              await admin.query(
                "SELECT id,email,entity FROM starter.users WHERE email='test@un.org'",
              )
            ).rows[0].entity,
            "UNDP",
          );
          for (const sql of [
            "INSERT INTO systemchart.entities VALUES ('BAD','Bad',now())",
            "UPDATE systemchart.entities SET entity_long='changed'",
            "DELETE FROM systemchart.entities",
            "DROP TABLE systemchart.entities",
            "CREATE TABLE systemchart.bad (id int)",
            "CREATE TABLE starter.bad (id int)",
            "DELETE FROM starter.users",
            "UPDATE starter.allowed_domains SET domain='bad.org'",
            "SELECT * FROM systemchart.extra",
          ])
            await assert.rejects(admin.query(sql), { code: "42501" });
        } finally {
          await admin.query("RESET ROLE");
        }
        assert.notEqual(
          psql("sql/app_role.sql").status,
          0,
          "Existing cluster roles must not be modified or adopted",
        );
      },
    );
    if (process.env.TEST_AUTH_BROWSER === "1")
      await t.test(
        "browser authentication uses the restricted role and a local SMTP fixture",
        async () => {
          const password = randomBytes(24).toString("hex");
          const { rows } = await admin.query(
            "SELECT format('ALTER ROLE %I PASSWORD %L', $1::text, $2::text) AS sql",
            [runtimeRole, password],
          );
          await admin.query(rows[0].sql);
          const runtimeUrl = new URL(sandboxUrl);
          runtimeUrl.username = runtimeRole;
          runtimeUrl.password = password;
          const result = spawnSync("pnpm", ["test:browser"], {
            encoding: "utf8",
            timeout: 180000,
            env: {
              ...process.env,
              CI: "true",
              DATABASE_URL: runtimeUrl.toString(),
              AUTH_TEST_DATABASE_URL: runtimeUrl.toString(),
              DB_SCHEMA: "starter",
              AUTH_SECRET:
                "isolated-browser-test-secret-at-least-32-characters",
              BASE_URL: "http://127.0.0.1:3100",
              SMTP_HOST: "127.0.0.1",
              SMTP_PORT: "2525",
              SMTP_FROM: "test@un.org",
              SMTP_USER: "",
              SMTP_PASS: "",
            },
          });
          assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
        },
      );
    await t.test(
      "unsafe PUBLIC grants abort role provisioning without changing shared grants",
      async () => {
        await admin.query("GRANT UPDATE ON systemchart.entities TO PUBLIC");
        assert.notEqual(psql("sql/app_role.sql", unsafeRole).status, 0);
        assert.equal(
          (
            await admin.query("SELECT 1 FROM pg_roles WHERE rolname=$1", [
              unsafeRole,
            ])
          ).rowCount,
          0,
        );
        assert.equal(
          (
            await admin.query(
              "SELECT has_table_privilege('public','systemchart.entities','UPDATE') AS allowed",
            )
          ).rows[0].allowed,
          true,
        );
        await admin.query("REVOKE UPDATE ON systemchart.entities FROM PUBLIC");
      },
    );
    await t.test(
      "an existing empty schema is never completed or populated",
      async () => {
        await admin.query(
          "DROP SCHEMA systemchart CASCADE; CREATE SCHEMA systemchart",
        );
        assert.equal(
          (
            await bootstrapEntities(admin, () => {
              throw new Error("No fetch allowed");
            })
          ).created,
          false,
        );
        assert.equal(
          (
            await admin.query(
              "SELECT to_regclass('systemchart.entities') AS table_name",
            )
          ).rows[0].table_name,
          null,
        );
      },
    );
    await t.test(
      "default bootstrap imports the full bundled directory without fetching",
      async () => {
        await admin.query("DROP SCHEMA systemchart CASCADE");
        const originalFetch = globalThis.fetch;
        globalThis.fetch = () => {
          throw new Error("Bootstrap must not fetch data");
        };
        try {
          const result = await bootstrapEntities(admin);
          assert.deepEqual(result, { created: true, count: 243 });
          assert.equal(
            (await admin.query("SELECT count(*) FROM systemchart.entities"))
              .rows[0].count,
            "243",
          );
          assert.equal(
            (
              await admin.query(
                "SELECT entity FROM systemchart.entities WHERE entity='SR-RES2792'",
              )
            ).rowCount,
            1,
          );
          assert.match(
            (
              await admin.query(
                "SELECT obj_description('systemchart.entities'::regclass) AS comment",
              )
            ).rows[0].comment,
            /SHA-256 [a-f0-9]{64}/,
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      },
    );
  } finally {
    await admin.end();
    await root.query(`DROP DATABASE ${database} WITH (FORCE)`);
    await root.query(`DROP ROLE IF EXISTS ${runtimeRole}`);
    await root.query(`DROP ROLE IF EXISTS ${unsafeRole}`);
    await root.end();
  }
});
