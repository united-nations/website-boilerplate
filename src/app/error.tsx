"use client";
import { useEffect } from "react";
import { Button } from "@un-eosg/ui/components/button";
import { typography } from "@un-eosg/ui/typography";
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main id="main-content" className="mx-auto max-w-xl space-y-4 p-8">
      <h1 className={typography.cardTitle}>Something went wrong</h1>
      <p className={typography.body}>
        Please try again. If the problem continues, contact the website
        administrator.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
