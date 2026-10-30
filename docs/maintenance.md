# Maintenance

## Maintain a website created from this template

Once you have created your own website, develop the version you chose on its working branch. You do not need to keep a second version of your website synchronized. GitHub's template creation copies files into new branch histories; it does not preserve the original boilerplate's merge history. See [GitHub's template documentation](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template).

Use the Node version in `.node-version` and pnpm version in `package.json`. Commit `pnpm-lock.yaml` whenever dependency versions change. Use pnpm consistently.

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm format:check
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:browser
```

`pnpm format` fixes formatting. On Linux, Playwright may also need system dependencies: use `pnpm exec playwright install --with-deps chromium` with the necessary administrator access. Browser tests normally start a preview on port 3100. To reuse a running preview, set `PLAYWRIGHT_BASE_URL` to its origin. On macOS/Linux, for example:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 pnpm test:browser
```

In PowerShell, set `$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:3000'` before running `pnpm test:browser`. Browser tests check navigation, the footer, mobile layout and keyboard access. The authenticated version also has database and end-to-end sign-in tests; follow `docs/auth-setup.md` there. Use a disposable local database for those tests.

### Update dependencies

Run `pnpm outdated` to list available updates and `pnpm audit` to inspect reported vulnerabilities. `pnpm update` updates within the declared ranges; review release notes before major upgrades. Keep `next` and `eslint-config-next` aligned, and React and React DOM aligned. Run `pnpm peers check` and the checks above after changes. In CI, use `pnpm install --frozen-lockfile` so installation matches the committed lockfile.

The shared UI dependency is pinned to a Git commit in `package.json`. To adopt a reviewed UI commit:

```bash
pnpm add '@un-eosg/ui@github:UN-EOSG-Analytics/ui#COMMIT'
```

Replace `COMMIT` with its full commit hash, test the website, and commit both `package.json` and `pnpm-lock.yaml`. Pin an immutable commit or release rather than a moving branch.

Python dependencies are separate. If you use the [data preparation workflow](data-preparation.md), update them with `uv lock --upgrade`, run `uv sync`, regenerate and inspect your output, and commit the reviewed `uv.lock` change.

## Maintain the original boilerplate repository

This section applies to contributors to `united-nations/website-boilerplate`, where `main` and `template-with-auth` share Git ancestry. It does not describe the branch histories of repositories generated with GitHub's template button.

1. Make shared changes once on `main`, or a branch targeting it.
2. Merge those commits into `template-with-auth`, or its companion branch. Keep static export configuration on main and authentication/server configuration on auth.
3. Run all applicable checks in both versions.
4. Fetch current refs with `git fetch origin`. From main run `pnpm check:sync origin/template-with-auth`; from auth run `pnpm check:sync origin/main`. For coordinated PRs, use the companion PR branch instead.

`scripts/shared-files.json` lists files that must be identical. The sync check also compares common scripts, tooling and dependency versions. `SiteChrome` and `SiteHeader` are shared; the `SiteShell` adapters differ because only the authenticated version loads a session and selects account controls. Pages may have version-specific content and authentication code. The auth lockfile includes its additional server dependencies. Add new shared guides and foundation files to the manifest.

The CI sync check runs only in the original boilerplate repository. During coordinated PRs it reports drift without blocking the PR; both branches must pass a comparison against their companion change before release. Generated websites still run the lint, type, unit, browser and build checks for their chosen version.

The static branch has a separate Pages deployment workflow. The auth branch has no automatic hosting target. Check [the publishing guide](github-pages.md) when changing deployment configuration.

## Contribute to the UI library

Browse the [UI catalogue](https://un-eosg-analytics.github.io/ui/) before adding a composition. Keep reusable components, typography, colour tokens and official footer copy in the UI library; keep site-specific text, database access and authentication logic in the website.

For local UI work, follow the UI repository's README for installation and local linking. Test changes in its catalogue and in a consuming website. Reusable components need accessible labels, keyboard behavior, token-based styles and appropriate stories, including RTL where applicable. Adopt the reviewed UI commit in both boilerplate versions and run their checks.
