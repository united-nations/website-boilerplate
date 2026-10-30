"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@un-eosg/ui/components/button";
import { typography } from "@un-eosg/ui/typography";
import { EntityPicker, type EntityOption } from "@/components/EntityPicker";
import { checkEntityForToken, verifyMagicToken } from "../commands";
export function VerifyForm({
  token,
  entities,
}: {
  token: string;
  entities: EntityOption[];
}) {
  const router = useRouter();
  const [info, setInfo] = useState<{
    email: string;
    hasEntity: boolean;
    entity: string | null;
  } | null>(null);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let cancelled = false;
    checkEntityForToken(token)
      .then((result) => {
        if (cancelled) return;
        if (!result.success) setError(result.error);
        else if (result.data) setInfo(result.data);
      })
      .catch(() => {
        if (!cancelled)
          setError("Could not check this link. Please try again.");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await verifyMagicToken(
        token,
        info?.hasEntity ? undefined : selected,
      );
      if (!result.success) setError(result.error);
      else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Could not sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-6">
      {error && (
        <p role="alert" className={typography.body}>
          {error}
        </p>
      )}
      {!info && !error && (
        <p role="status" className={typography.meta}>
          Checking your link…
        </p>
      )}
      {info && (
        <>
          <p className={typography.body}>
            Signing in as <bdi>{info.email}</bdi>
          </p>
          {info.hasEntity ? (
            <p className={typography.meta}>Entity: {info.entity}</p>
          ) : (
            <EntityPicker
              value={selected}
              onChange={setSelected}
              entities={entities}
              disabled={busy}
            />
          )}
          <Button
            className="w-full"
            disabled={busy || (!info.hasEntity && !selected)}
          >
            {busy ? "Signing in…" : "Complete sign-in"}
          </Button>
        </>
      )}
    </form>
  );
}
