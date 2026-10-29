import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { signSession, verifySession } from "../src/features/auth/session.ts";
import {
  normalizeEmail,
  normalizeEntity,
  validToken,
} from "../src/features/auth/validation.ts";
import { validateSchema } from "../src/lib/db/config.ts";
import { connectionOptions } from "../src/lib/db/connection-options.ts";
import { getBaseUrl } from "../src/lib/get-base-url.ts";
import { validateEntities } from "../scripts/bootstrap-entities.mjs";

test("signed sessions reject modified, expired and malformed payloads", () => {
  const before = process.env.AUTH_SECRET;
  process.env.AUTH_SECRET = "a-test-secret-with-at-least-32-characters";
  try {
    const userId = "550e8400-e29b-41d4-a716-446655440000";
    const session = signSession(userId);
    assert.deepEqual(verifySession(session), { userId });
    assert.equal(verifySession(`x${session}`), null);
    assert.equal(verifySession(`${session}.extra`), null);
    assert.equal(verifySession("garbage"), null);
    for (const data of [
      { userId, exp: 0 },
      { userId, exp: "tomorrow" },
      { userId: "bad", exp: Date.now() + 10000 },
    ]) {
      const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
      const signature = createHmac("sha256", process.env.AUTH_SECRET)
        .update(payload)
        .digest("hex");
      assert.equal(verifySession(`${payload}.${signature}`), null);
    }
    delete process.env.AUTH_SECRET;
    assert.throws(() => signSession(userId), /AUTH_SECRET/);
    assert.throws(() => verifySession(session), /AUTH_SECRET/);
  } finally {
    if (before === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = before;
  }
});
test("email, token, affiliation and SQL identifiers are bounded", () => {
  assert.equal(normalizeEmail(" Person@UN.ORG "), "person@un.org");
  assert.equal(normalizeEmail("person@un.org@attacker.org"), null);
  assert.equal(normalizeEmail("x\n@un.org"), null);
  assert.equal(normalizeEntity(" Custom organisation "), "Custom organisation");
  assert.equal(normalizeEntity("a".repeat(256)), null);
  assert.equal(normalizeEntity("\u0000"), null);
  assert.equal(validToken("a".repeat(64)), true);
  assert.equal(validToken({}), false);
  for (const name of [
    "systemchart",
    "public",
    "pg_catalog",
    "information_schema",
    "a;DROP SCHEMA systemchart",
    "a".repeat(64),
  ])
    assert.throws(() => validateSchema(name));
});
test("database options verify remote TLS and only allow insecure loopback", () => {
  assert.throws(
    () =>
      connectionOptions({
        DATABASE_URL: "postgres://user:pass@example.org/db?sslmode=disable",
      }),
    /loopback/,
  );
  assert.equal(
    connectionOptions({
      DATABASE_URL: "postgres://user@localhost/db?sslmode=disable",
    }).ssl,
    false,
  );
  assert.deepEqual(
    connectionOptions({
      DATABASE_URL: "postgres://user@example.org/db?sslmode=require",
    }).ssl,
    { rejectUnauthorized: true },
  );
  assert.throws(() => connectionOptions({}, true), /DATABASE_ADMIN_URL/);
});
test("magic link origin is explicitly configured and validated", () => {
  const before = process.env.BASE_URL;
  try {
    process.env.BASE_URL = "https://example.un.org";
    assert.equal(getBaseUrl(), "https://example.un.org");
    for (const url of [
      "https://example.org/path",
      "https://user:password@example.org",
      "javascript:alert(1)",
      "http://example.org",
    ]) {
      process.env.BASE_URL = url;
      assert.throws(() => getBaseUrl());
    }
  } finally {
    if (before === undefined) delete process.env.BASE_URL;
    else process.env.BASE_URL = before;
  }
});
test("entity source validation rejects partial and ambiguous imports", () => {
  const entity = {
    entity: "UNDP",
    entity_long: "United Nations Development Programme",
  };
  assert.deepEqual(validateEntities([entity]), [entity]);
  for (const data of [
    [],
    {},
    [entity, entity],
    [{ entity: "", entity_long: "Name" }],
    [{ entity: "UNDP" }],
  ])
    assert.throws(() => validateEntities(data));
});
