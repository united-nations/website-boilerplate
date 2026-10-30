import { redirect } from "next/navigation";
import { typography } from "@un-eosg/ui/typography";
import { EntityRef } from "@un-eosg/ui/components/concepts";
import { SiteShell } from "@/components/SiteShell";
import { BoilerplateShowcase } from "@/components/BoilerplateShowcase";
import { UserMenu } from "@/components/UserMenu";
import { getCurrentUser } from "@/features/auth/service";
import { fetchEntities } from "@/lib/data/entities";
export const dynamic = "force-dynamic";
export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/about");
  const entities = await fetchEntities();
  return (
    <SiteShell
      account={
        <UserMenu email={user.email} entity={user.entity} entities={entities} />
      }
    >
      <BoilerplateShowcase />
      <section className="mt-12 space-y-4">
        <h2 className={typography.sectionTitle}>Welcome</h2>
        <p className={typography.body}>
          You are signed in. Use this space for your application’s content.
        </p>
        {user.entity && <EntityRef acronym={user.entity} />}
        <p className={typography.meta}>
          Update your organisational entity or sign out using the account menu.
        </p>
      </section>
    </SiteShell>
  );
}
