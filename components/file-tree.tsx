"use client";

import * as React from "react";
import { File as FileIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FileItem = {
  id?: string;
  filename: string;
  size?: number;
};

export function FileTree({
  files,
  activeIndex,
  onSelect,
  onRemove,
  onRename,
  editable = false,
}: {
  files: FileItem[];
  activeIndex: number;
  onSelect: (i: number) => void;
  onRemove?: (i: number) => void;
  onRename?: (i: number, name: string) => void;
  editable?: boolean;
}) {
  return (
    <ul className="flex flex-col">
      {files.map((f, i) => (
        <li key={i}>
          <div
            className={cn(
              "group flex items-center gap-2 px-3 h-9 cursor-pointer text-sm border-l-2 transition-colors",
              i === activeIndex
                ? "bg-bg-muted border-accent text-fg"
                : "border-transparent text-fg-muted hover:text-fg hover:bg-bg-subtle",
            )}
            onClick={() => onSelect(i)}
          >
            <FileIcon className="h-3.5 w-3.5 shrink-0 opacity-70" />
            {editable && onRename ? (
              <input
                value={f.filename}
                spellCheck={false}
                onChange={(e) => onRename(i, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 bg-transparent border-none outline-none font-mono text-sm focus:ring-0 focus:bg-bg"
              />
            ) : (
              <span className="flex-1 truncate font-mono">{f.filename}</span>
            )}
            {editable && onRemove && files.length > 1 ? (
              <button
                type="button"
                aria-label="Remove file"
                className="opacity-0 group-hover:opacity-100 text-fg-subtle hover:text-danger p-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(i);
                }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
