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
    provenance.seedSha256,
  );
  const sources = new Map(
    provenance.sources.map((source) => [source.id, source]),
  );
  const evidence = new Map(
    provenance.entries.map((entry) => [entry.entity, entry]),
  );
  assert.equal(evidence.size, rows.length);
  const keys = rows.map((row) => {
    const entry = evidence.get(row.entity);
    assert.equal(entry?.entity_long, row.entity_long);
    assert.ok(
      entry.sources.some((reference) => {
        const source = sources.get(reference.sourceId);
        return (
          source?.kind === "immutable-repository-file" &&
          /^[a-f0-9]{40}$/.test(source.commit) &&
          /^[a-f0-9]{64}$/.test(source.sha256) &&
          ["exact-key-and-name", "explicit-key-and-name-literals"].includes(
            reference.match,
          )
        );
      }),
      `Missing exact upstream evidence for ${row.entity}`,
    );
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
