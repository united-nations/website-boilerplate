# United Nations Website Starter

An English-language Next.js website using the shared [EOSG UI library](https://un-eosg-analytics.github.io/ui/). You can change the content without knowing how every part of the application works.

## Choose your version

| Branch               | Choose this when…                                                            | Hosting                                  |
| -------------------- | ---------------------------------------------------------------------------- | ---------------------------------------- |
| `main`               | Everyone can see your website; no sign-in or database is needed.             | GitHub Pages or any static web host      |
| `template-with-auth` | Visitors should sign in using an emailed link and select their organisation. | A Node.js host, plus PostgreSQL and SMTP |

On GitHub, choose **Use this template → Create a new repository**. Enable **Include all branches** if you need the authenticated version. Clone your new repository, open its folder in your editor, and open a terminal there. The terminal is where you type the commands below; do not type the surrounding backticks.

To choose the authenticated version, run `git switch template-with-auth` before installing anything. Document search is not included in either version.

## Start the website on your computer

1. Install **Node.js 24 LTS** from [nodejs.org](https://nodejs.org/en/download) and **pnpm 11.22.0** using the [pnpm installation guide](https://pnpm.io/installation). Node 22.18 or newer is also supported. Use pnpm for this project; do not generate an npm lockfile.
2. Check that installation worked: run `node --version`, then `pnpm --version`.
3. In your project folder, run `pnpm install`. This downloads the website's dependencies. The first installation needs internet access, including access to the GitHub UI library.
4. Copy `.env.example` to `.env.local`. On macOS/Linux use `cp .env.example .env.local`; in PowerShell use `Copy-Item .env.example .env.local`. These are local settings. Never commit passwords or `.env.local`.
5. **Auth branch only:** complete [database and email setup](docs/auth-setup.md) first. Ask a database administrator to help with the administrator steps.
6. Run `pnpm dev`. Keep this terminal open while you work.
7. Open [localhost:3000](http://localhost:3000) in your browser. If the terminal reports a different port, open that address instead.

`pnpm dev` starts a development preview on your computer. It does not publish your changes. Save a file in your editor and the browser updates automatically. To stop the preview, click the terminal and press **Ctrl+C**. Start it again with `pnpm dev`.

## Make your first change

- Open `src/lib/site-config.ts`. Change `name` and `description`, save, and look at your browser.
- Edit the text in `src/app/page.tsx` for the home page and `src/app/about/page.tsx` for About. Keep the surrounding JSX tags, quotes and brackets intact.
- Put downloadable files in `public/`. A file at `public/guide.pdf` is served as `/guide.pdf`.
- Navigation, page title and optional analytics are explained in [Customization](docs/customization.md).

Before sharing your changes, run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`. These detect common mistakes. If a command fails, read the first error and its file name; fixing that error often resolves later ones too.

## Preview and publish

On **main**, `pnpm build` creates a static website in `out/`. Run `pnpm start` to preview it at localhost:3000. For a GitHub project URL such as `https://organisation.github.io/my-site/`, set `BASE_PATH=/my-site` in `.env.local` before building. For a custom domain, leave it empty. Enable **Settings → Pages → Source → GitHub Actions** in your repository; the supplied workflow deploys pushes to `main` and derives the path automatically. A push to `main` can therefore publish the website.

On **template-with-auth**, `pnpm build` creates a server application and `pnpm start` runs it. Deploy to a Node.js host, configure the environment variables there, and connect PostgreSQL and SMTP. GitHub Pages cannot run authentication. See [Auth setup](docs/auth-setup.md).

Set `NEXT_PUBLIC_SITE_URL` to the real public origin before publishing. Public environment variables and static content are visible to visitors. Changing build-time settings requires a rebuild.

## Common problems

| Problem                                 | Try this                                                                                                   |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `pnpm` or `node` is not recognised      | Finish installation, close your terminal, and open a new one.                                              |
| `package.json` cannot be found          | Open a terminal in the repository folder, not its parent folder.                                           |
| Port 3000 is occupied                   | Stop the other preview with Ctrl+C, or use the port shown in the terminal.                                 |
| My change is not visible                | Save the file; confirm the preview terminal is still running and you have the right browser address.       |
| Images or links fail after publishing   | Check `BASE_PATH`, rebuild, and use the URL helpers described in Customization.                            |
| Auth reports a missing setting or table | Follow the auth setup guide and restart `pnpm dev` after editing `.env.local`.                             |
| Sign-in email does not arrive           | Check the SMTP settings, spam folder, allowed domain and server logs; a request has a two-minute cooldown. |

## For maintainers

[Maintenance](docs/maintenance.md) covers dependency updates, checks, UI contributions and keeping both branches synchronized. Python data preparation in `python/` is optional; the website itself does not need Python. For that workflow, install Python 3.13+ and [uv](https://docs.astral.sh/uv/), then run `uv sync` and `uv run python python/data_prep.py`.
