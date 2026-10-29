"use client";

import { usePathname } from "next/navigation";
import { SiteHeader as SharedHeader } from "@un-eosg/ui/components/site-header";
import { siteConfig } from "@/lib/site-config";
import { withBasePath } from "@/lib/paths";

export function SiteHeader({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <SharedHeader
      brand={siteConfig.brand}
      descriptor={siteConfig.name}
      href={withBasePath("/")}
      homeLabel={`${siteConfig.name} home`}
      navItems={siteConfig.navigation.map((item) => ({
        ...item,
        href: withBasePath(item.href),
      }))}
      activeHref={withBasePath(pathname.replace(/\/$/, "") || "/")}
      mobileMenuLabel="Open navigation menu"
      transparency="low"
      containerClassName="max-w-6xl px-6 sm:px-8 lg:px-16"
    >
      {children}
    </SharedHeader>
  );
}
