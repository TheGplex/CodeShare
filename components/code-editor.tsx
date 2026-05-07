"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { detectLanguage } from "@/lib/language";

const Monaco = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full grid place-items-center text-fg-subtle text-xs font-mono">
      Loading editor…
    </div>
  ),
});

export function CodeEditor({
  filename,
  value,
  onChange,
  language,
  height = "60vh",
}: {
  filename: string;
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string | number;
}) {
  const lang = language ?? detectLanguage(filename);
  return (
    <div className="rounded-md overflow-hidden border border-border bg-[#0d0d0e]">
      <Monaco
        height={height}
        language={lang}
        path={filename}
        value={value}
        theme="vs-dark"
        beforeMount={(monaco) => {
          monaco.editor.defineTheme("codeshare-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: {
              "editor.background": "#0d0d0e",
              "editor.foreground": "#ededee",
              "editor.lineHighlightBackground": "#161618",
              "editorLineNumber.foreground": "#3f3f44",
              "editorLineNumber.activeForeground": "#8b8b90",
              "editorCursor.foreground": "#a3e635",
              "editor.selectionBackground": "#a3e63540",
              "editor.inactiveSelectionBackground": "#a3e63522",
              "editorIndentGuide.background1": "#181819",
              "editorIndentGuide.activeBackground1": "#2a2a2e",
              "editorWidget.background": "#0f0f10",
              "editorWidget.border": "#1f1f22",
            },
          });
        }}
        onMount={(editor, monaco) => {
          monaco.editor.setTheme("codeshare-dark");
        }}
        onChange={(v) => onChange(v ?? "")}
        options={{
          fontFamily:
            "JetBrains Mono, Fira Code, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          fontSize: 13,
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          padding: { top: 12, bottom: 12 },
          tabSize: 2,
          wordWrap: "on",
          renderLineHighlight: "all",
          guides: {
            indentation: true,
          },
          overviewRulerBorder: false,
          overviewRulerLanes: 0,
          scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
        }}
      />
    </div>
  );
}
