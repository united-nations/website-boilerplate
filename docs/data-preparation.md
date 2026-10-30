# Prepare website data with Python

Python is optional. Use it when you want to clean or convert a spreadsheet before publishing it on your website. Node.js and pnpm run the website; [uv](https://docs.astral.sh/uv/getting-started/installation/) manages the separate Python environment and the dependencies in `pyproject.toml`. Python does not run automatically when you start or build the website.

## Convert the included example

Install uv, then run these commands from the repository root:

```bash
uv sync
uv run python python/data_prep.py
```

The project requires Python 3.13 or newer; uv can download a compatible interpreter if needed. `uv sync` creates a local `.venv` and installs the locked Python dependencies, including pandas for CSV processing and ipykernel for optional notebooks. You do not need to activate `.venv` when using `uv run`.

The input is `data/example.csv`:

```csv
name,value
Example A,12
Example B,8
```

The script writes `public/data/data.json` as an array of records:

```json
[
  { "name": "Example A", "value": 12 },
  { "name": "Example B", "value": 8 }
]
```

Run `pnpm dev` and visit `http://localhost:3000/data/data.json` to inspect the output. Add your configured base path to that address if applicable. On the authenticated version, sign in first; `/data/` is protected by default.

## Display the data on a page

Create `src/app/data-example/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { typography } from "@un-eosg/ui/typography";
import { SiteShell } from "@/components/SiteShell";
import { withBasePath } from "@/lib/paths";

type Row = { name: string; value: number };

export default function DataExample() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(withBasePath("/data/data.json"))
      .then((response) => {
        if (!response.ok) throw new Error("Could not load data");
        return response.json() as Promise<Row[]>;
      })
      .then((data) => {
        if (active) setRows(data);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <SiteShell>
      <h1 className={typography.pageTitle}>Example data</h1>
      <p className={`${typography.meta} mt-4`}>
        Source: included demonstration CSV.
      </p>
      {failed ? (
        <p role="alert">Could not load data. Please try again.</p>
      ) : rows ? (
        <ul className={`${typography.body} mt-4 list-disc ps-6`}>
          {rows.map((row) => (
            <li key={row.name}>
              {row.name}: {row.value}
            </li>
          ))}
        </ul>
      ) : (
        <p role="status">Loading data…</p>
      )}
    </SiteShell>
  );
}
```

Visit `/data-example`. This example expects the demonstrated columns and unique names; adapt the type and display when changing your CSV. TypeScript describes the expected data but does not validate a downloaded JSON file. Add validation when consuming an external or changing source.

## Use your own CSV and publish updates

1. Export your spreadsheet as CSV and put it in `data/`.
2. Change `input_path` in `python/data_prep.py` to your filename. Adjust any transformations and the page's fields for your data.
3. Run `uv run python python/data_prep.py` again after every source update. Starting the website does not regenerate JSON.
4. Check `public/data/data.json` and your page in the browser. Review values, missing data and field types; document the source and update date.
5. Run the website checks and `pnpm build` from the README.
6. Commit the generated `public/data/data.json`, the page, and any script changes. Include the source CSV only if it is suitable to share. Push to publish using your hosting workflow.

The supplied Pages workflow builds the website from committed files; it does not run Python. A file in `public/` is a downloadable website asset. Do not export credentials or private spreadsheet columns into it. On the static version all these assets are public; on authentication, review the route's access rules.

## Troubleshooting

| Problem                       | Try this                                                                                                                   |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `uv` is not recognised        | Finish uv installation and reopen your terminal.                                                                           |
| CSV file not found            | Run from the repository root and check `input_path` against the actual filename.                                           |
| JSON is unchanged             | Rerun the Python script, then inspect its output before rebuilding.                                                        |
| The page reports a data error | Check that the generated file exists and its fields match the page; check the browser's network panel for the failing URL. |
