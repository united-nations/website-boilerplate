# Publish with GitHub Pages

Use this guide for the public, static version of UN Website Boilerplate. GitHub Pages hosts the generated HTML, CSS, JavaScript and public files. The authenticated version needs a Node.js server; follow `docs/auth-setup.md` in that checkout instead.

## Enable hosting in your new repository

After creating your repository from the template and pushing your changes:

1. Open **your new repository** on GitHub, then **Settings → Pages**. You need permission to configure the repository. Pages availability depends on your GitHub plan and repository visibility.
2. Under **Build and deployment → Source**, choose **GitHub Actions**. The template already supplies `.github/workflows/nextjs.yml`; keep that workflow rather than adding a suggested one.
3. Open **Actions → Deploy static website to Pages → Run workflow**, select `main`, and run it. This lets you publish without making another edit. Future pushes to `main` trigger it automatically.
4. Open the run and wait for both `build` and `deploy` to succeed. Open the website link shown by the deployment, or return to **Settings → Pages** and choose **Visit site**.

For a repository named `my-website` owned by `my-organisation`, the usual address is `https://my-organisation.github.io/my-website/`. The workflow builds the site with the correct repository path and public origin automatically. You do not need to commit `out/` or create a `gh-pages` branch.

See [GitHub's publishing-source guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) for permissions and organization-specific restrictions. Files served by a Pages website should be suitable for public access, including files in `public/`.

## Publish an update

Make and preview your changes, run the checks in the README, then commit and push to `main`:

```bash
git status
git add src/app/page.tsx
git commit -m "Update homepage"
git push
```

Add any other changed files you want to publish as well. In **Actions**, open the latest **Deploy static website to Pages** run. A local preview updates immediately; a published update becomes available after deployment finishes. The separate **Check both template variants** workflow runs code checks and does not publish the website.

## Preview the production build locally

Stop `pnpm dev` first if it occupies port 3000. For a preview without a repository prefix, leave `BASE_PATH` empty in `.env.local`, then run:

```bash
pnpm build
pnpm start
```

Open `http://localhost:3000`. This local file server serves the site at its root, so keep `BASE_PATH` empty for this preview. The Pages workflow supplies the repository prefix during deployment. A local preview of a prefixed production build requires a web server that mounts `out/` at that prefix. Restart `pnpm dev` as well after changing `BASE_PATH`.

The build creates `out/`; `pnpm start` serves those generated files. Editing source files while this preview runs requires another build.

## Analytics and other build settings

Your local `.env.local` is not uploaded to GitHub and is not available to Actions. The workflow derives `BASE_PATH` and `NEXT_PUBLIC_SITE_URL` from Pages settings.

For optional Umami-compatible analytics, open **Settings → Secrets and variables → Actions → Variables** and create both repository variables:

- `NEXT_PUBLIC_ANALYTICS_SCRIPT_URL`: the service's script URL.
- `NEXT_PUBLIC_ANALYTICS_WEBSITE_ID`: your website's analytics identifier.

The supplied workflow passes these variables to the build. Run the deployment again after changing them. Both values are public in the generated website; use repository secrets for any future setting that contains a credential, and never expose a credential through a `NEXT_PUBLIC_*` value.

## Custom domains

Configure your domain in **Settings → Pages → Custom domain** and follow [GitHub's domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site). After DNS is configured, rebuild using **Run workflow** so the site uses the updated Pages origin and base path. Leave `BASE_PATH` empty for a local preview of a site served at a domain root.

## Troubleshooting

| Symptom                                   | What to check                                                                                                                |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| No **Pages** option                       | Ask the repository owner about permissions, plan and organization policy.                                                    |
| No deployment workflow listed             | Confirm your repository includes `.github/workflows/nextjs.yml` on `main` and Actions is enabled.                            |
| Deployment fails                          | Open the failed job in **Actions** and read its first error. Confirm Pages uses **GitHub Actions** as its source.            |
| The old site is still visible             | Check that you pushed to `main`, the deployment succeeded, and you opened the URL for your new repository. Refresh the page. |
| Homepage works, but images/downloads fail | Use `withBasePath` for raw asset URLs; see [Customization](customization.md#links-images-and-downloads).                     |
