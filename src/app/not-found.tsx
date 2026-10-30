import Link from "next/link";
import { typography } from "@un-eosg/ui/typography";
import { buttonVariants } from "@un-eosg/ui/components/button";
import { SiteShell } from "@/components/SiteShell";
export default function NotFound() {
  return (
    <SiteShell>
      <div className="space-y-4">
        <h1 className={typography.cardTitle}>Page not found</h1>
        <p className={typography.body}>
          The page may have moved or the address may be incorrect.
        </p>
        <Link className={buttonVariants()} href="/">
          Go to home page
        </Link>
      </div>
    </SiteShell>
  );
}
