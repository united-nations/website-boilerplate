# Entity directory: sources and the bundled snapshot

`data/reference/systemchart-entities.json` contains the **243 exact entity keys and display names** observed in the shared PostgreSQL `systemchart.entities` directory. It is a read-only snapshot of `entity` and `entity_long`, sorted by key. No database host, credentials, personal details, or other tables are included. Its capture time, SHA-256 and source comparisons are recorded in `data/reference/systemchart-provenance.json`.

The auth template's explicit administrator bootstrap uses this bundled snapshot. It needs no Airtable credentials or download, and never reads the seed or writes anything if `systemchart` already exists. The static template includes the same reference files for documentation; it does not connect to PostgreSQL.

## Where the larger directory comes from

The repository evidence points to an Airtable-derived directory plus application-specific curation. It does **not** establish a complete history of every database import:

- **Open's Airtable pipeline:** `python/01-fetch_from_airtable.py` in the Open checkout (`united-nations/transparency`) reads `table.all(view="All")`, normalizes entity keys and exports `public/data/entities.json`. Its current local export has 255 rows. Two are synthetic financial aggregates, **UN Secretariat** and **Peacekeeping Operations**; they should not be treated as additional organisations merely because they occur in that export. Programme Budget's `assets/references/system-chart-entities.json` independently records the remaining 253 name pairs and documents the same Airtable lineage.
- **Historical export:** [Budget Explorer's 5 December 2025 JSON](https://github.com/UN-EOSG-Analytics/budget-explorer/blob/6a19e2299fe76eb6aab7de1bd745ef03c1b53f70/data/input/2025-12-05_un-entities.json) has 221 rows. Of these, 210 keys occur in the database and all 210 long names match exactly. Its remaining keys include grouping headings and different abbreviations. This is strong evidence of shared lineage, not proof of the original import command.
- **Mandates curation:** [`sql/migrations/009_import_pkm.sql`](https://github.com/united-nations/mandates/blob/326b80dad7d8164e4d1b824370a05ebe24579f18/sql/migrations/009_import_pkm.sql) registers UNSOH; migrations `022_import_ppb2027_section1.sql` and `033_import_ppb2027_spm.sql` register entities from their budget staging data. [`032_rename_spm_entities.sql`](https://github.com/united-nations/mandates/blob/326b80dad7d8164e4d1b824370a05ebe24579f18/sql/migrations/032_rename_spm_entities.sql) records the GOM-Cyprus and SC-RES1559 renames and adds SR-RES2792 and PoE-Iran. These establish that the database also receives curated budget-driven changes. A migration file alone does not prove its current application state: the snapshot retains the database's actual keys, including older keys that coexist with newer ones.

## Why not simply replace the 169-entry source URL?

The smaller Navigator JSON is not a full export of the existing database. The initial comparison found 157 matching keys, 86 database-only keys, 12 JSON-only keys and one differing long name.

Open's larger export is closer, but it is also not an exact replacement: **228 matching keys, 15 database-only keys, 27 Open-only keys, and two differing long names**. Examples include `OVRA` versus `VRA`, `UNGGIM` versus `UN-GGIM`, and `SRSG-*` versus `OSRSG-*`. Some may describe renamed or related offices; the boilerplate does not infer equivalence or merge them. The two synthetic financial aggregates also account for part of the Open-only set.

The bundled snapshot therefore preserves the established database choices exactly. It is a reproducible starter directory, not a promise of current membership, an official acronym authority, or a complete replica of all System Chart metadata. Users may explicitly choose a custom affiliation where needed; affiliation remains self-reported.

## Refreshing

Refresh only through a deliberate read-only export by a directory maintainer, followed by review. Export the two fields in the query recorded in the provenance file, update the capture time/hash/comparison evidence, and keep the files identical in both template variants. `pnpm test` checks shape, uniqueness, sorting and the checksum. Review aliases and source changes; do not automatically union directories.

Updating these files changes only what **future independent databases** are initially seeded with. It never synchronizes, renames, inserts into, or overwrites an existing `systemchart` schema. Keep that guard when changing the bootstrap.
