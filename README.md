# UN Website Boilerplate

A starting point for United Nations websites, with a shared header, footer, typography and colour palette from the [EOSG UI library](https://un-eosg-analytics.github.io/ui/).

## Choose your starting point

| Version              | Use it for                                                   | What you need to publish                        |
| -------------------- | ------------------------------------------------------------ | ----------------------------------------------- |
| `main`               | A public website                                             | GitHub Pages or another static web host         |
| `template-with-auth` | A website with email-link sign-in and organisation selection | A Node.js host, PostgreSQL and an email service |

You only need to develop the version you choose. The two branches are maintained together in the original boilerplate repository.

## Create your own repository

1. Sign in to GitHub and open [UN Website Boilerplate](https://github.com/united-nations/website-boilerplate).
2. Choose **Use this template → Create a new repository**. Choose an owner and repository name, such as `my-website`. For the authenticated version, enable **Include all branches**.
3. Install [Git](https://git-scm.com/downloads), [Node.js 24 LTS](https://nodejs.org/en/download), [pnpm 11.22.0](https://pnpm.io/installation), and a code editor such as [Visual Studio Code](https://code.visualstudio.com/). Node 22.18 or newer is also supported.
4. In your new repository, use **Code → HTTPS** to copy its clone URL. Open a terminal and run these commands, replacing the URL and folder name with your own:

   ```bash
   git clone https://github.com/YOUR-ORGANISATION/my-website.git
   cd my-website
   ```

5. For authentication, run `git switch template-with-auth`. In your new repository's **Settings → General → Default branch**, choose `template-with-auth` so future work opens on your chosen version. Leave the default branch as `main` for a public static website.
6. Open the cloned folder in your editor. Run the remaining commands in a terminal inside that folder. In VS Code, use **Terminal → New Terminal**.

GitHub creates a new history when you use a template. Your website does not need to merge between the two template branches. The [maintenance guide](docs/maintenance.md) distinguishes website maintenance from work on the original boilerplate.

## Start the website on your computer

1. Run `node --version` and `pnpm --version` to check your installations.
2. Run `pnpm install` to download dependencies. The first installation needs internet access, including access to GitHub.
3. Copy `.env.example` to `.env.local`. On macOS/Linux run `cp .env.example .env.local`; in PowerShell run `Copy-Item .env.example .env.local`. This file holds local settings and is excluded from Git. Keep passwords there, never in page files.
4. **For the authenticated version:** follow `docs/auth-setup.md` in your checkout to configure the database and email service before continuing.
5. Run `pnpm dev`. Keep the terminal open, then visit [localhost:3000](http://localhost:3000). If the terminal gives a different address, use that address.

This is a preview on your computer. Saving a file updates the preview; it does not publish the website. To stop it, click the terminal and press **Ctrl+C**. Restart it with `pnpm dev`.

## Make your first change

- Change the website name and description in `src/lib/site-config.ts`.
- Replace the example homepage content in `src/app/page.tsx`. The UN80 colour showcase is sample content you can keep or replace. In the authenticated version, keep the sign-in checks and account menu around your page content.
- Edit the About page in `src/app/about/page.tsx` to explain your website's purpose, sources and contact information.
- Keep the surrounding tags, quotes and brackets intact when editing text. See [Customization](docs/customization.md) for a complete new-page example, navigation, downloads and UI components.

Before sharing changes, run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

If a command fails, start with its first error and the named file. Save the correction and run the command again.

## Save and publish your changes

Git records changes in a **commit**; a **push** uploads your commits to GitHub. From the project folder:

```bash
git status
git add src/app/page.tsx src/app/about/page.tsx src/lib/site-config.ts
git commit -m "Customize website content"
git push
```

Only add files you intend to share. If you changed other files, add their paths too. If Git asks for your identity or GitHub sign-in, follow its instructions; [GitHub's Git setup guide](https://docs.github.com/en/get-started/git-basics/set-up-git) explains these steps.

For the public version, follow [Publish with GitHub Pages](docs/github-pages.md) to enable hosting in your new repository. Once enabled, pushes to `main` publish updates automatically. For authentication, use the deployment section of `docs/auth-setup.md` in that version.

## More guides

- [Customize content, pages and appearance](docs/customization.md)
- [Publish with GitHub Pages](docs/github-pages.md)
- [Prepare website data with Python](docs/data-preparation.md) — optional; Python is not needed to run the website
- [Maintain dependencies and run checks](docs/maintenance.md)

## Common problems

| Problem                                   | Try this                                                                                                                              |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm`, `node` or `git` is not recognised | Finish installation, then close and reopen your terminal.                                                                             |
| `package.json` cannot be found            | Open the terminal inside the cloned project folder.                                                                                   |
| Port 3000 is occupied                     | Use the address printed by `pnpm dev`, or stop the other preview.                                                                     |
| A change is not visible                   | Save the file and check that the preview is running. For the published site, check the latest deployment in GitHub's **Actions** tab. |
| Images or links fail on GitHub Pages      | Follow the base-path instructions in [Customization](docs/customization.md#links-images-and-downloads).                               |
| Sign-in fails or email does not arrive    | Use the troubleshooting table in `docs/auth-setup.md` on the authenticated version.                                                   |
