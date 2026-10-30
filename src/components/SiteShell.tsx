import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { pageContainer } from "@/lib/site-config";
/** Shared page chrome: skip link, header, aligned main area and footer.
 * RootLayout owns the HTML/fonts/metadata; pages supply their content and optional
 * account control here. This wrapper has no authentication or database behavior.
 */
export function SiteShell({
  children,
  account,
}: {
  children: React.ReactNode;
  account?: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded focus:bg-background focus:p-3 focus:text-un-blue-text"
      >
        Skip to main content
      </a>
      <SiteHeader>{account}</SiteHeader>
      <main
        id="main-content"
        tabIndex={-1}
        className={`${pageContainer} flex-1 py-12`}
      >
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
