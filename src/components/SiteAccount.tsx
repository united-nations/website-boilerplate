import Link from "next/link";
import { buttonVariants } from "@un-eosg/ui/components/button";
import type { getCurrentUser } from "@/features/auth/service";
import { fetchEntities } from "@/lib/data/entities";
import { UserMenu } from "./UserMenu";

/** Load the entity directory only when there is an authenticated account. */
export async function SiteAccount({
  user,
}: {
  user: Awaited<ReturnType<typeof getCurrentUser>>;
}) {
  if (!user)
    return (
      <Link href="/login" className={buttonVariants({ size: "sm" })}>
        Sign in
      </Link>
    );
  return (
    <UserMenu
      email={user.email}
      entity={user.entity}
      entities={await fetchEntities()}
    />
  );
}
