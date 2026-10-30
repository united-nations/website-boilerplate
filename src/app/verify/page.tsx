import { typography } from "@un-eosg/ui/typography";
import { SiteShell } from "@/components/SiteShell";
import { VerifyForm } from "@/features/auth/ui/VerifyForm";
import { fetchEntities } from "@/lib/data/entities";
import { validToken } from "@/features/auth/validation";
export const dynamic = "force-dynamic";
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <SiteShell>
      <div className="mx-auto max-w-sm space-y-6">
        <h1 className={typography.cardTitle}>Complete sign-in</h1>
        {validToken(token) ? (
          <VerifyForm token={token} entities={await fetchEntities()} />
        ) : (
          <p role="alert" className={typography.body}>
            Missing or invalid verification token. Request a new sign-in link.
          </p>
        )}
      </div>
    </SiteShell>
  );
}
