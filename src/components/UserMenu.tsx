"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AccountMenu } from "@un-eosg/ui/components/account-menu";
import { EntityChangeDialog } from "./EntityChangeDialog";
import type { EntityOption } from "./EntityPicker";
export function UserMenu({
  email,
  entity,
  entities,
}: {
  email: string;
  entity?: string | null;
  entities: EntityOption[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      <AccountMenu
        email={email}
        entity={entity ? { label: "Entity", value: entity } : undefined}
        labels={{
          accountMenu: "Your account",
          signedInAs: "Signed in as",
          signOut: "Sign out",
          signingOut: "Signing out…",
          signOutError: "Could not sign out. Please try again.",
        }}
        actions={[
          {
            id: "entity",
            label: "Update entity",
            onSelect: () => setOpen(true),
          },
        ]}
        onSignOut={async () => {
          const response = await fetch("/api/auth/logout", { method: "POST" });
          if (!response.ok) throw new Error("Sign out failed");
          router.push("/");
          router.refresh();
        }}
      />
      {open && (
        <EntityChangeDialog
          currentEntity={entity || ""}
          entities={entities}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
