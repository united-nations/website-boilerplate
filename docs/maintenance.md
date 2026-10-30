# Maintenance

## Routine checks

Use the Node version in `.node-version` and the pnpm version in `package.json`. Install with `pnpm install --frozen-lockfile` in CI. Locally, run:

```bash
pnpm lint
pnpm typecheck
pnpm format:check
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:browser
pnpm audit
pnpm outdated
```

`pnpm format` fixes formatting. If a preview is already running, set `PLAYWRIGHT_BASE_URL` to its origin when running browser tests (for example `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 pnpm test:browser`) so the tests reuse it. Browser tests check the shared shell at desktop and mobile sizes, including keyboard navigation. The auth branch adds session tests and isolated PostgreSQL tests (`pnpm test:db`, see `docs/auth-setup.md` on that branch). Never point database tests at a shared or production database.

Use `pnpm update` for updates within declared ranges. Review major upgrades and peer dependencies before using `pnpm add package@latest`. Keep `next` and `eslint-config-next` aligned, and React/React DOM aligned. ESLint 9 is retained because Next's React/import/accessibility plugins do not yet declare ESLint 10 support. TypeScript 6 is the tested compiler baseline; upgrade major versions with a separate compatibility review. Run `pnpm peers check` after changes. Commit `pnpm-lock.yaml`; do not add `package-lock.json` or a second package manager's lockfile.

## Two variants, one shared foundation

1. Make shared changes on `main` (or a PR targeting it).
2. Merge those commits into `template-with-auth` (or its companion PR). Keep static export configuration on main, server configuration and authentication on auth.
3. Run all applicable checks in **both** variants.
4. Run `pnpm check:sync origin/template-with-auth` from main and `pnpm check:sync origin/main` from auth. During paired PRs, substitute the companion branch ref. `scripts/shared-files.json` defines identical files; dependency versions, tooling and common scripts are checked too.

Main is the shared foundation; the auth branch includes main in its Git ancestry and adds server/authentication functionality on top. Make shared edits once on main and merge them into auth, rather than implementing the same edit independently. README and general guides are deliberately identical. `SiteChrome` and `SiteHeader` are shared; the `SiteShell` adapters differ because only the auth version reads a session and selects account controls. Authentication setup, entity seed data and provenance live only on the auth branch. Dependencies required only for authentication may differ. Lockfiles differ because their dependency sets differ. Update the shared-file manifest when adding a new common foundation file.

CI reports cross-branch drift while coordinated PRs are being landed; treat a clean sync check as a release requirement. It also builds and checks the actual selected variant on pull requests and pushes. Main additionally has a separate GitHub Pages deployment workflow. Auth has no automatic deployment target: configure your server host deliberately.

## Updating or contributing UI

Both variants already pin `10414dc7a607ee9ff5da4bc7fc66b209b49196bb`. This includes the shared entity picker, account menu, sign-in card nested-dialog Escape fix and centralized official footer copy in all six languages; no manual dependency switch is needed after installing the template. That commit is available on [UI PR #4](https://github.com/UN-EOSG-Analytics/ui/pull/4), which is stacked on the existing `codex/login-system` work. Once those changes land, a future maintenance change can pin a release tag or merge commit in both variants.

The dependency is pinned to a Git commit so changes are reviewed before adoption. To update it, run `pnpm add '@un-eosg/ui@github:UN-EOSG-Analytics/ui#COMMIT'` in both variants and commit both lockfiles. Do not use a mutable branch ref for released templates.

For local UI work, install dependencies in the UI checkout, then follow its README's local-link workflow. Test the component inside a real consuming website as well as Storybook. New reusable compositions should have an accessible name, keyboard behavior, translated labels supplied as props, tokens, and stories including RTL. Data access, SMTP and authentication logic remain in the application.
