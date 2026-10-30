import Link from "next/link";
import { buttonVariants } from "@un-eosg/ui/components/button";
import type { Metadata } from "next";
import { typography } from "@un-eosg/ui/typography";
import { SiteShell } from "@/components/SiteShell";
import { siteConfig } from "@/lib/site-config";
export const metadata: Metadata = { title: "About" };
export default function About() {
  return (
    <SiteShell
      account={
        <Link href="/login" className={buttonVariants({ size: "sm" })}>
          Sign in
        </Link>
      }
    >
      <article className="max-w-2xl space-y-6">
        <h1 className={typography.pageTitle}>About {siteConfig.name}</h1>
        <p className={typography.prose}>{siteConfig.description}</p>
        <h2 className={typography.sectionTitle}>Our purpose</h2>
        <p className={typography.prose}>
          Explain who this website is for, what it helps them do, and who
          maintains it.
        </p>
        <h2 className={typography.sectionTitle}>Sources and methodology</h2>
        <p className={typography.prose}>
          Describe your sources, when they were last updated, and any
          limitations readers should understand.
        </p>
      </article>
    </SiteShell>
  );
}
