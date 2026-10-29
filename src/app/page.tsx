import Link from "next/link";
import { buttonVariants } from "@un-eosg/ui/components/button";
import { typography } from "@un-eosg/ui/typography";
import { SiteShell } from "@/components/SiteShell";
import { siteConfig } from "@/lib/site-config";
export default function Home() {
  return (
    <SiteShell>
      <div className="max-w-2xl space-y-6">
        <p className={typography.eyebrow}>{siteConfig.brand}</p>
        <h1 className={typography.pageTitle}>{siteConfig.name}</h1>
        <p className={typography.lead}>{siteConfig.description}</p>
        <p className={typography.prose}>
          Use this space to explain what your website offers and help visitors
          find what they need.
        </p>
        <Link href="/about" className={buttonVariants()}>
          About this website
        </Link>
      </div>
      <section className="mt-12 grid gap-6 sm:grid-cols-2" aria-label="Explore">
        {[
          {
            title: "A clear starting point",
            text: "Introduce your project, share useful resources, and guide visitors to their next step.",
          },
          {
            title: "A consistent experience",
            text: "Shared United Nations components keep navigation, typography, and interactions familiar.",
          },
        ].map((item) => (
          <article key={item.title} className="rounded-lg border bg-card p-6">
            <h2 className={typography.sectionTitle}>{item.title}</h2>
            <p className={`${typography.body} mt-3`}>{item.text}</p>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
