"use client";

import * as React from "react";
import { CopyButton } from "@/components/copy-button";

export function ShareLink({ shortId }: { shortId: string }) {
  const [url, setUrl] = React.useState(`/s/${shortId}`);
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(`${window.location.origin}/s/${shortId}`);
    }
  }, [shortId]);

  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-border bg-bg-subtle pl-3 h-9 text-sm">
      <span className="font-mono text-fg-muted truncate max-w-[280px]">
        {url}
      </span>
      <CopyButton text={url} variant="ghost" size="sm" label="" />
    </div>
  );
}
