import { SiteChrome } from "./SiteChrome";
import { SiteAccount } from "./SiteAccount";
import { getCurrentUser } from "@/features/auth/service";
import { siteConfig } from "@/lib/site-config";

/** Every auth-variant page gets navigation and account controls for its session. */
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <SiteChrome
      navigation={siteConfig.navigation.filter(
        (item) => !item.requiresAuth || !!user,
      )}
      homeHref={user ? "/" : "/about"}
      account={<SiteAccount user={user} />}
    >
      {children}
    </SiteChrome>
  );
}
