import pg from "pg";
import { pathToFileURL } from "node:url";
import { connectionOptions } from "../src/lib/db/connection-options.ts";

export const ENTITY_SOURCE =
  "https://raw.githubusercontent.com/UN-EOSG-Analytics/un-system-chart-navigator/refs/heads/main/public/un-entities.json";
export function validateEntities(data) {
  if (!Array.isArray(data) || data.length === 0 || data.length > 10000)
    throw new Error(
      "Expected a nonempty entity array (at most 10,000 records).",
    );
  const seen = new Set();
  return data.map((row) => {
    if (
      !row ||
      typeof row.entity !== "string" ||
      !row.entity.trim() ||
      row.entity !== row.entity.trim() ||
      row.entity.length > 255 ||
      /[\u0000-\u001f\u007f]/.test(row.entity) ||
      typeof row.entity_long !== "string" ||
      !row.entity_long.trim() ||
      row.entity_long.includes("\u0000") ||
      seen.has(row.entity)
    ) {
      throw new Error(
        "Invalid entity record or duplicate key; no data was imported.",
      );
    }
    seen.add(row.entity);
    return { entity: row.entity, entity_long: row.entity_long };
  });
}

/** Explicit provisioning only. An existing schema is always a no-op, even empty. */
export async function bootstrapEntities(client, fetchSource = fetch) {
  await client.query("BEGIN");
  try {
    // Same lock for every app using this bootstrap in the database.
    await client.query("SELECT pg_advisory_xact_lock(1937339234, 1701737577)");
    const existing = await client.query(
      "SELECT 1 FROM pg_namespace WHERE nspname = 'systemchart'",
    );
    if (existing.rowCount) {
      await client.query("COMMIT");
      return { created: false, count: 0 };
    }
    const response = await fetchSource(ENTITY_SOURCE, {
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok)
      throw new Error(`Entity source returned HTTP ${response.status}.`);
    // Bound downloaded data as well as the validated record count.
    const reader = response.body.getReader();
    const chunks = [];
    let bytes = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > 5_000_000) throw new Error("Entity source exceeded 5 MB.");
        chunks.push(Buffer.from(value));
      }
    } finally {
      await reader.cancel();
    }
    const rows = validateEntities(
      JSON.parse(Buffer.concat(chunks).toString("utf8")),
    );
    // No IF NOT EXISTS: a competing external creator must cause a rollback,
    // never silently redirect inserts into somebody else's schema/table.
    await client.query("CREATE SCHEMA systemchart");
    await client.query(
      "CREATE TABLE systemchart.entities (entity varchar(255) PRIMARY KEY, entity_long text, updated_at timestamptz DEFAULT now())",
    );
    await client.query(
      "INSERT INTO systemchart.entities (entity, entity_long) SELECT entity, entity_long FROM jsonb_to_recordset($1::jsonb) AS x(entity text, entity_long text)",
      [JSON.stringify(rows)],
    );
    await client
      .query(
        "SELECT format('COMMENT ON TABLE systemchart.entities IS %L', $1::text) AS sql",
        [
          `Starter directory imported ${new Date().toISOString()} from ${ENTITY_SOURCE}; not synchronized with the shared directory.`,
        ],
      )
      .then(async ({ rows }) => client.query(rows[0].sql));
    await client.query("COMMIT");
    return { created: true, count: rows.length };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  let client;
  try {
    client = new pg.Client({
      ...connectionOptions(process.env, true),
      connectionTimeoutMillis: 10000,
      query_timeout: 45000,
    });
    await client.connect();
    const result = await bootstrapEntities(client);
    console.log(
      result.created
        ? `Created starter entity directory with ${result.count} records.`
        : "systemchart already exists: no network fetch, schema changes or data writes performed.",
    );
  } catch (error) {
    console.error(
      `Entity bootstrap failed (${error.code || error.name}). Check database access and source availability. No existing directory was modified.`,
    );
    process.exitCode = 1;
  } finally {
    if (client) await client.end();
  }
}
