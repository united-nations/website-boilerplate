import { redirect } from "next/navigation";
import { typography } from "@un-eosg/ui/typography";
import { EntityRef } from "@un-eosg/ui/components/concepts";
import { SiteShell } from "@/components/SiteShell";
import { siteConfig } from "@/lib/site-config";
import { getCurrentUser } from "@/features/auth/service";
// Complete class names keep Tailwind's source scanner and shared theme in sync.
const palette = [
  { name: "UN Blue", className: "bg-un-blue", token: "un-blue" },
  { name: "Faded Jade", className: "bg-faded-jade", token: "faded-jade" },
  {
    name: "Camouflage Green",
    className: "bg-camouflage-green",
    token: "camouflage-green",
  },
  {
    name: "Pale Oyster",
    className: "bg-un80-warm-gray",
    token: "un80-warm-gray",
  },
  { name: "Au Chico", className: "bg-au-chico", token: "au-chico" },
  { name: "Smoky", className: "bg-smoky", token: "smoky" },
  { name: "Shuttle Gray", className: "bg-shuttle-gray", token: "shuttle-gray" },
  { name: "Trout", className: "bg-trout", token: "trout" },
  { name: "Dusty Gray", className: "bg-dusty-gray", token: "dusty-gray" },
];

export const dynamic = "force-dynamic";
export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/about");
  return (
    <SiteShell>
      <div className="max-w-2xl space-y-6">
        <h1 className={typography.pageTitle}>UN {siteConfig.name}</h1>
        <p className={typography.lead}>
          A modern, responsive foundation for United Nations web applications.
        </p>
        <a
          className="text-un-blue-text underline underline-offset-4"
          href="https://github.com/united-nations/website-boilerplate"
        >
          View on GitHub
        </a>
      </div>
      <section className="mt-12" aria-labelledby="palette-heading">
        <h2 id="palette-heading" className={typography.sectionTitle}>
          UN80 colours
        </h2>
        <p className={`${typography.meta} mt-2`}>
          The boilerplate’s working palette, supplied by the shared UI theme.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3">
          {palette.map((colour) => (
            <div key={colour.token}>
              <div
                className={`h-20 rounded-lg ${colour.className}`}
                aria-hidden="true"
              />
              <p className={`${typography.body} mt-2 font-medium`}>
                {colour.name}
              </p>
              <p className={typography.caption}>{colour.token}</p>
            </div>
          ))}
        </div>
      </section>
      {user && (
        <section className="mt-12 space-y-4">
          <h2 className={typography.sectionTitle}>Welcome</h2>
          <p className={typography.body}>
            You are signed in. Use this space for your application’s content.
          </p>
          {user.entity && <EntityRef acronym={user.entity} />}
          <p className={typography.meta}>
            Update your organisational entity or sign out using the account
            menu.
          </p>
        </section>
      )}
    </SiteShell>
  );
}
