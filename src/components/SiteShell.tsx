import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { pageContainer } from "@/lib/site-config";
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
