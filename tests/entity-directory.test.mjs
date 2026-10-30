import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

test("bundled entity directory preserves reviewed keys, names and provenance", async () => {
  const bytes = await readFile(
    new URL("../data/reference/systemchart-entities.json", import.meta.url),
  );
  const rows = JSON.parse(bytes);
  const provenance = JSON.parse(
    await readFile(
      new URL("../data/reference/systemchart-provenance.json", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(rows.length, provenance.rowCount);
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    provenance.sha256,
  );
  const keys = rows.map((row) => {
    assert.deepEqual(Object.keys(row).sort(), ["entity", "entity_long"]);
    assert.equal(typeof row.entity, "string");
    assert.ok(row.entity.length > 0 && row.entity.length <= 255);
    assert.equal(row.entity, row.entity.trim());
    assert.equal(typeof row.entity_long, "string");
    assert.ok(row.entity_long.trim());
    return row.entity;
  });
  assert.equal(new Set(keys).size, rows.length);
  assert.deepEqual(keys, [...keys].sort());
  // Preserve established database identities rather than silently adopting aliases.
  assert.ok(keys.includes("UN Women"));
  assert.ok(keys.includes("SR-RES2792"));
  assert.ok(!keys.includes("Peacekeeping Operations"));
  assert.ok(!keys.includes("UN Secretariat"));
});
