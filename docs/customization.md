# Customize your website

## Name, navigation and content

Start with `src/lib/site-config.ts`: `brand`, `name`, `description`, navigation and optional analytics are defined there. Keep secrets in environment variables, never in this file. `src/app/layout.tsx` derives the document title, description and Open Graph metadata from these settings.

Edit page content in `src/app/page.tsx` and `src/app/about/page.tsx`. To add a page, create `src/app/resources/page.tsx` and export a React component. Wrap it in `SiteShell`, use one `h1`, and add its URL to `siteConfig.navigation`. Set `requiresAuth: false` for public navigation items and `requiresAuth: true` for signed-in items. The auth branch shows public items to everyone and adds signed-in items after login; the static branch shows every item because it has no sign-in. On the auth branch, also decide whether the route should be public in `src/proxy.ts`: hiding a navigation item does not protect its URL. Protection is checked again by server operations that access private information.

`SiteChrome` supplies the shared skip link, header/footer, page width and main landmark without authentication or database access. Pages use the variant-specific `SiteShell` adapter: the static version renders the chrome directly; the auth version reads the current user, selects navigation, and always supplies either a sign-in button or the account avatar menu. Use `SiteShell` on every auth page, including public login and verification pages, without supplying account controls yourself. The auth header brand links to About while signed out and Home while signed in. `RootLayout` owns HTML, fonts and metadata. Match page margins to the chrome rather than creating a second width convention.

## Components and colours

Browse the [UI catalogue](https://un-eosg-analytics.github.io/ui/) before adding a component:

```tsx
import { Button } from "@un-eosg/ui/components/button";
import { typography } from "@un-eosg/ui/typography";

<h2 className={typography.sectionTitle}>Resources</h2>
<Button onClick={handleAction}>Continue</Button>
```

Use `buttonVariants` for an actual link, rather than putting a button inside a link. Use the shared `Modal` for dialogs. The auth branch uses `SignInCard`, `AccountMenu` and `EntitySelect`; the latter only displays supplied data and calls `onChange`.

`src/app/globals.css` imports the shared theme. Product semantics such as `--primary`, `--border` and `--muted` refer to those tokens. Use `bg-background`, `text-foreground`, `text-muted-foreground` and `text-un-blue-text`. Avoid copying the palette or inventing colours and text sizes. Roboto is loaded by the root layout. Shared header and footer logos are bundled by the UI dependency. The header places its emblem outside the main content width on wide screens and moves it inline on smaller screens. `BoilerplateShowcase` retains the UN80 palette using shared colour tokens. Official footer copy is selected centrally by locale in the UI library; applications do not need to supply labels.

The UI library intentionally leaves low-level shadcn primitives in applications when needed; prefer its shared compositions first. Do not copy a shared component into this repository to customize it: pass props, compose a wrapper, or contribute a reusable improvement to UI.

## Links, images and static data

`next/link` automatically handles the configured base path. Plain HTML `href`/`src` attributes and `fetch` do not. Use `withBasePath` from `src/lib/paths.ts`:

```tsx
<a href={withBasePath("/guide.pdf")}>Download guide</a>
```

```ts
const response = await fetch(withBasePath("/data/example.json"));
if (!response.ok) throw new Error("Could not load data");
const data = await response.json();
```

Put browser-readable data in `public/data/`. Include source, update date and limitations in your page or About page. Database calls belong in server code on the auth branch; never expose credentials in a client component.

## Analytics

Analytics is off by default. To use an Umami-compatible service, set both `NEXT_PUBLIC_ANALYTICS_SCRIPT_URL` and `NEXT_PUBLIC_ANALYTICS_WEBSITE_ID`. Rebuild after changing them. Remove or replace the small integration in the root layout if your service uses another API.
