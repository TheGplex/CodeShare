"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GitFork } from "lucide-react";

export function ForkButton({ shortId }: { shortId: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function onClick() {
    setBusy(true);
    const res = await fetch(`/api/snippets/${shortId}/fork`, {
      method: "POST",
    });
    setBusy(false);
    if (res.ok) {
      const data = await res.json();
      router.push(`/s/${data.shortId}/edit`);
    }
  }

  return (
    <Button onClick={onClick} disabled={busy} variant="secondary" size="sm">
      <GitFork className="h-3.5 w-3.5" />
      {busy ? "Forking…" : "Fork"}
    </Button>
  );
}
