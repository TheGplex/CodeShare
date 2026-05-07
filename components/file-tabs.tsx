"use client";

import * as React from "react";
import { File as FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type FileTabsItem = {
  id: string;
  filename: string;
  language?: string | null;
  size: number;
};

export function FileTabs({
  files,
  children,
}: {
  files: FileTabsItem[];
  children: React.ReactNode[];
}) {
  const [active, setActive] = React.useState(0);
  return (
    <div className="rounded-lg border border-border bg-bg-card overflow-hidden">
      <div className="grid lg:grid-cols-[260px,1fr]">
        <aside className="border-b lg:border-b-0 lg:border-r border-border bg-bg-subtle min-h-[40px]">
          <div className="px-3 py-2 text-xs uppercase tracking-wide text-fg-subtle border-b border-border">
            Files · {files.length}
          </div>
          <ul className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible">
            {files.map((f, i) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 h-9 text-left text-sm border-l-2 transition-colors",
                    i === active
                      ? "bg-bg-muted border-accent text-fg"
                      : "border-transparent text-fg-muted hover:text-fg hover:bg-bg",
                  )}
                >
                  <FileIcon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  <span className="flex-1 truncate font-mono">
                    {f.filename}
                  </span>
                  <span className="text-[10px] text-fg-subtle shrink-0">
                    {formatBytes(f.size)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <div className="overflow-x-auto">
          {children.map((child, i) => (
            <div key={i} className={cn(i === active ? "block" : "hidden")}>
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  return `${(n / 1024).toFixed(1)} KB`;
}
