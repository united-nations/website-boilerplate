# Customize your website

## Find the right file

| What you want to change                              | File                                                         |
| ---------------------------------------------------- | ------------------------------------------------------------ |
| Website name, description and navigation             | `src/lib/site-config.ts`                                     |
| Homepage content, including the example UN80 palette | `src/app/page.tsx`                                           |
| About text, sources and contact information          | `src/app/about/page.tsx`                                     |
| Header options and account slot                      | `src/components/SiteHeader.tsx`                              |
| Footer options                                       | `src/components/SiteFooter.tsx`                              |
| Shared page width and spacing                        | `src/lib/site-config.ts` and `src/components/SiteChrome.tsx` |
| Theme imports and colour-token mappings              | `src/app/globals.css`                                        |
| Browser metadata and font loading                    | `src/app/layout.tsx`                                         |

The `name` setting controls the header descriptor and default browser title. `description` supplies default page metadata and the About introduction. Replace other example text directly in the page files. Keep secrets in `.env.local` or your hosting service's secret settings.

## Add a page

Create `src/app/resources/page.tsx` with this complete example:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@un-eosg/ui/components/button";
import { typography } from "@un-eosg/ui/typography";
import { SiteShell } from "@/components/SiteShell";

export const metadata: Metadata = { title: "Resources" };

export default function Resources() {
  return (
    <SiteShell>
      <h1 className={typography.pageTitle}>Resources</h1>
      <p className={`${typography.body} mt-4`}>Find out more about our work.</p>
      <Link href="/about" className={buttonVariants({ className: "mt-6" })}>
        About this website
      </Link>
    </SiteShell>
  );
}
```

Visit `/resources` in your preview. Add `{ href: "/resources", label: "Resources", requiresAuth: false }` to the `navigation` array in `src/lib/site-config.ts` to show it in the header.

`SiteShell` wraps the shared `SiteChrome`, which provides the skip link, header, footer and aligned main content area. The static version renders this directly; the authenticated version also loads the session, selects navigation and supplies sign-in or account controls. Use `SiteShell` on every page without adding account controls yourself. On the authenticated version, the header brand links to About while signed out and Home while signed in. Give each page one `h1`; use `h2` for its sections. The root layout supplies HTML, fonts and default metadata. A page's `metadata.title` appears with the website name in the browser tab.

On the authenticated version, new routes require sign-in by default. To make a page public, add its path to `PUBLIC_PATHS` in `src/proxy.ts`; a listed path also makes its child paths public. Set `requiresAuth: true` on navigation items intended for signed-in visitors and `false` on public items. The static version shows all items; the authenticated version adds restricted items after sign-in. Navigation visibility does not protect the route itself. Keep authorization checks in server operations that read private information.

## Use UI components and colours

Browse the [UI catalogue](https://un-eosg-analytics.github.io/ui/) before building a new component. Import components from `@un-eosg/ui/components/...` and typography from `@un-eosg/ui/typography`. For links styled as buttons, use `Link` with `buttonVariants` as above. For actions, use `Button`; for dialogs, use the shared `Modal`.

Pages are Server Components by default. Interactive controls with event handlers such as `onClick` belong in a separate component whose first line is `"use client"`. Import that component into your page. Database access and secrets belong in server code, never in a client component.

`globals.css` imports the shared theme. Use classes such as `bg-background`, `text-foreground`, `text-muted-foreground` and `text-un-blue-text`, and the typography styles in the example. The homepage lists UN80 colour tokens you can use elsewhere. Keep full class names in source files so Tailwind can discover them.

The UI library supplies header/footer logos and official footer text. Set shared-component options in the local header/footer wrappers. The header's `emblemPlacement="outboard"` places the emblem outside the content width on wide screens. Contribute reusable UI changes to the UI library; keep website-specific content in your application.

## Links, images and downloads

Put downloadable files and images in `public/`. For example, `public/guide.pdf` is served at `/guide.pdf`; do not include `public` in its URL.

`next/link` adds the configured base path automatically. For raw HTML links, image `src` attributes and browser `fetch` calls, use `withBasePath` so URLs also work at a GitHub project address such as `/my-website/`:

```tsx
import { withBasePath } from "@/lib/paths";

<a href={withBasePath("/guide.pdf")}>Download guide</a>;
```

Only pass site-relative paths beginning with `/` to this helper. Leave external URLs such as `https://www.un.org/` unchanged. On the authenticated version, files outside the public paths in `src/proxy.ts` also require sign-in; explicitly allow any downloads intended for signed-out visitors.

## Data and analytics

[Prepare website data with Python](data-preparation.md) walks through CSV conversion and displaying the result. The website can also use JSON you prepare without Python. Put browser-readable data in `public/data/`, and explain its source, update date and limitations on the page or About page.

Analytics is off by default. For a local build, set both `NEXT_PUBLIC_ANALYTICS_SCRIPT_URL` and `NEXT_PUBLIC_ANALYTICS_WEBSITE_ID` in `.env.local`, then rebuild. For GitHub Pages, configure repository variables as described in [the publishing guide](github-pages.md#analytics-and-other-build-settings). On a Node.js host, supply them at build time. The integration supports Umami-compatible services; adapt `src/app/layout.tsx` for other providers.
