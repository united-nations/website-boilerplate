# Verified entity seed and Airtable scope

This guide and `data/reference/` exist only on `template-with-auth`. Static websites do not need a System Chart seed.

`systemchart-entities.json` contains **243 independently source-verified key/name pairs** for initial database setup. The seed was reconstructed from upstream evidence, then compared with a read-only database query; the database itself is **not** counted as source evidence. The per-entry source ledger, immutable commit paths, checksums and Airtable audit results are in `systemchart-provenance.json`.

## Verified sources

- **236 exact pairs** come from the System Chart Navigator's historical [`data/output/entity_reference.csv`](https://github.com/UN-EOSG-Analytics/un-system-chart-navigator/blob/e57930cb4c893c2923a85d713035cde9b89ac007/data/output/entity_reference.csv). This full intermediate export has 237 rows; its `UN-Women` key is not substituted for the database's `UN Women` key.
- **GOM-Cyprus, SC-RES1559, SR-RES2792 and PoE-Iran** have explicit key and long-name literals in Mandates migration `032_rename_spm_entities.sql`.
- **UNSOH** has an explicit definition in Mandates migration `009_import_pkm.sql`.
- **UNSDG-SWEO** is present in the committed Section 1 resolved CSV and its import is documented by migration `022_import_ppb2027_section1.sql`.
- **UN Women** has an exact key/name pair in Open's pinned published export.

All 243 seed entries have at least one exact immutable repository source. The ledger records source commits/paths and selectors for each one. Historical evidence establishes a name's origin; it does not assert that the entity is currently active or that every migration has been applied to every database.

## Airtable snapshot: 30 October 2026

The snapshot was captured at 02:59 UTC on 30 October 2026. A read-only source audit used metadata and paginated record GET requests against the same **All Entities** base/table used by Navigator. Source IDs, capture time and view counts are recorded in the ledger so the scope is reproducible. The token is never stored in the repository.

| Scope                                                  | Records |
| ------------------------------------------------------ | ------: |
| All table records                                      |     274 |
| Complete key + long name, not pending form submissions |     253 |
| Missing a key or long name                             |      21 |
| `on_display=True`                                      |     169 |
| Complete records with `on_display=False`               |      74 |
| Complete records with `on_display=Maybe`               |      10 |

There were no pending-form flags at audit time. `All` and `UN Entities – SHARED` both returned 274 raw records; `shown on chart` returned 169 and `System Chart Hierarchy` returned 78. Navigator fetches the whole table, filters incomplete/pending records, then publishes only `on_display=True` rows. Its [169-entry public JSON](https://github.com/UN-EOSG-Analytics/un-system-chart-navigator/blob/a7cd08f84c9038f4733b60835e48a7ba3bd3917d/public/un-entities.json) exactly matched the visible subset at capture time. It is not the full entity table.

Open's pinned export contains 253 real rows (excluding the two synthetic financial aggregates), which matched all 253 eligible Airtable rows after **five explicit normalizations in its pipeline**: `UN-Women` → `UN Women`, `OVRA` → `VRA`, and `SRSG-CAAC/SVC/VAC` → `OSRSG-CAAC/SVC/VAC`. Those are documented application mappings, not inferred aliases.

Compared with the 243 database entries reviewed at the time, the Airtable snapshot had **229 exact key/name matches**, **12 absent keys**, and **two differing long names** (`OSC-SEA` and `UNAIDS`). These cases are listed per row in the ledger. They retain historical/curated evidence in the seed rather than silently adopting new names or conflating related offices. Neither the 253 complete records nor the 169 displayed records should be treated as an exact database replacement.

## Provisioning and updates

The administrator bootstrap uses the bundled verified seed with no network access. It creates and populates `systemchart` only if that entire schema is absent. An existing schema is always a no-op, even when empty or missing its entities table. There is no automatic synchronization or force/overwrite option.

Review future source changes explicitly. Every added or renamed seed entry needs an exact key/name source and a corresponding ledger entry. Update the seed checksum after reviewing the diff. `pnpm test` checks checksum, shape, unique/sorted keys and per-entry immutable evidence. Never add an entry solely because it appears in a database export, and never union differently named source records by inference.
