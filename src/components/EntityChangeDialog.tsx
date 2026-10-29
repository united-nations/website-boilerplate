"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@un-eosg/ui/components/modal";
import { Button } from "@un-eosg/ui/components/button";
import { typography } from "@un-eosg/ui/typography";
import { EntityPicker, type EntityOption } from "./EntityPicker";
import { updateEntity } from "@/features/auth/commands";
export function EntityChangeDialog({
  currentEntity,
  entities,
  onClose,
}: {
  currentEntity: string;
  entities: EntityOption[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState(currentEntity);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await updateEntity(value);
      if (!result.success) setError(result.error);
      else {
        onClose();
        router.refresh();
      }
    } catch {
      setError("Could not update your entity. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Update entity"
      description="Choose your organisational affiliation."
      closeLabel="Close entity dialog"
      size="sm"
    >
      <form onSubmit={submit} className="space-y-4">
        <EntityPicker
          value={value}
          onChange={setValue}
          entities={entities}
          disabled={busy}
        />
        {error && (
          <p role="alert" className={typography.body}>
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={busy || !value.trim()}>
            {busy ? "Updating…" : "Update"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
