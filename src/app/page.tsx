import { redirect } from "next/navigation";
import { typography } from "@un-eosg/ui/typography";
import { EntityRef } from "@un-eosg/ui/components/concepts";
import { SiteShell } from "@/components/SiteShell";
import { BoilerplateShowcase } from "@/components/BoilerplateShowcase";
import { getCurrentUser } from "@/features/auth/service";
export const dynamic = "force-dynamic";
export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/about");
  return (
    <SiteShell>
      <BoilerplateShowcase />
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
