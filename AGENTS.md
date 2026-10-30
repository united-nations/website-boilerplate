<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Template maintenance

- Use pnpm; Node 24 is recommended. Run lint, typecheck, tests and build.
- Keep the shared files in scripts/shared-files.json identical in main and
  template-with-auth, and run check:sync against the companion branch.
- Import shared UI components and typography from @un-eosg/ui. Use brand tokens
  through globals.css; check the UI catalogue before creating a composition.
- Keep secrets and database access in server code. Never add runtime writes or
  automatic imports to systemchart. The explicit administrator bootstrap must
  remain a no-op whenever that schema already exists.
- Document search is intentionally absent.
- Keep setup steps in README and docs consistent with actual file locations.
