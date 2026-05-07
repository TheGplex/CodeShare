"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CodeEditor } from "@/components/code-editor";
import { FileTree } from "@/components/file-tree";
import { detectLanguage } from "@/lib/language";
import { Plus, Upload, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Visibility = "PUBLIC" | "UNLISTED" | "PRIVATE";

export type SnippetFormFile = {
  filename: string;
  content: string;
  language?: string | null;
};

export type SnippetFormInitial = {
  title?: string;
  description?: string | null;
  visibility?: Visibility;
  files?: SnippetFormFile[];
  shortId?: string;
};

export function SnippetForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: SnippetFormInitial;
}) {
  const router = useRouter();
  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [description, setDescription] = React.useState(
    initial?.description ?? "",
  );
  const [visibility, setVisibility] = React.useState<Visibility>(
    initial?.visibility ?? "PRIVATE",
  );
  const [files, setFiles] = React.useState<SnippetFormFile[]>(
    initial?.files?.length
      ? initial.files
      : [{ filename: "snippet.txt", content: "", language: "plaintext" }],
  );
  const [active, setActive] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function updateFile(i: number, patch: Partial<SnippetFormFile>) {
    setFiles((prev) =>
      prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)),
    );
  }

  function addFile() {
    const base = "file";
    let n = files.length + 1;
    let name = `${base}${n}.txt`;
    while (files.some((f) => f.filename === name)) {
      n++;
      name = `${base}${n}.txt`;
    }
    setFiles((prev) => [
      ...prev,
      { filename: name, content: "", language: "plaintext" },
    ]);
    setActive(files.length);
  }

  function removeFile(i: number) {
    if (files.length <= 1) return;
    const next = files.filter((_, idx) => idx !== i);
    setFiles(next);
    setActive((a) => Math.max(0, Math.min(a, next.length - 1)));
  }

  function renameFile(i: number, name: string) {
    updateFile(i, { filename: name, language: detectLanguage(name) });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list) return;
    const incoming: SnippetFormFile[] = [];
    for (const f of Array.from(list)) {
      if (f.size > 500_000) {
        setError(`File "${f.name}" exceeds 500 KB`);
        continue;
      }
      const text = await f.text();
      incoming.push({
        filename: dedupName(f.name, [...files, ...incoming]),
        content: text,
        language: detectLanguage(f.name),
      });
    }
    if (incoming.length) {
      const merged =
        files.length === 1 && !files[0].content && files[0].filename === "snippet.txt"
          ? incoming
          : [...files, ...incoming];
      setFiles(merged);
      setActive(merged.length - 1);
    }
    e.target.value = "";
  }

  async function submit() {
    setError(null);
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (files.some((f) => !f.filename.trim())) {
      setError("Filenames cannot be empty");
      return;
    }
    const names = new Set<string>();
    for (const f of files) {
      if (names.has(f.filename)) {
        setError(`Duplicate filename: ${f.filename}`);
        return;
      }
      names.add(f.filename);
    }
    setSubmitting(true);
    try {
      const url =
        mode === "create"
          ? "/api/snippets"
          : `/api/snippets/${initial?.shortId}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          visibility,
          files: files.map((f) => ({
            filename: f.filename.trim(),
            content: f.content,
            language: f.language ?? detectLanguage(f.filename),
          })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `Request failed (${res.status})`);
        setSubmitting(false);
        return;
      }
      const data = await res.json();
      const shortId = data.shortId ?? initial?.shortId;
      router.push(`/s/${shortId}`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,300px]">
      <div className="space-y-4 order-2 lg:order-1">
        <div className="rounded-lg border border-border bg-bg-card overflow-hidden">
          <div className="grid lg:grid-cols-[220px,1fr] min-h-[60vh]">
            <div className="border-b lg:border-b-0 lg:border-r border-border bg-bg-subtle">
              <div className="flex items-center justify-between px-3 py-2 text-xs uppercase tracking-wide text-fg-subtle">
                <span>Files</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Upload files"
                    className="p-1 rounded hover:bg-bg-muted text-fg-muted hover:text-fg"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="New file"
                    className="p-1 rounded hover:bg-bg-muted text-fg-muted hover:text-fg"
                    onClick={addFile}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                onChange={handleUpload}
              />
              <FileTree
                files={files}
                activeIndex={active}
                onSelect={setActive}
                onRemove={removeFile}
                onRename={renameFile}
                editable
              />
            </div>
            <div className="p-3">
              <CodeEditor
                filename={files[active].filename}
                value={files[active].content}
                onChange={(v) => updateFile(active, { content: v })}
                language={
                  files[active].language ??
                  detectLanguage(files[active].filename)
                }
              />
            </div>
          </div>
        </div>
      </div>

      <aside className="space-y-4 order-1 lg:order-2">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My snippet"
            maxLength={140}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="desc">Description</Label>
          <Textarea
            id="desc"
            value={description ?? ""}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this for?"
            rows={4}
            maxLength={2000}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="visibility">Visibility</Label>
          <Select
            id="visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as Visibility)}
          >
            <option value="PRIVATE">Private — only you</option>
            <option value="UNLISTED">Unlisted — anyone with the link</option>
            <option value="PUBLIC">Public — listed in Discover</option>
          </Select>
          <p className="text-xs text-fg-subtle">
            {visibility === "PRIVATE" && "Only you can see this snippet."}
            {visibility === "UNLISTED" &&
              "Anyone with the share link can view, but it's not listed publicly."}
            {visibility === "PUBLIC" &&
              "Anyone can find this in the Discover feed."}
          </p>
        </div>

        {error ? (
          <div className="rounded-md border border-danger-muted bg-danger-muted text-danger px-3 py-2 text-sm">
            {error}
          </div>
        ) : null}

        <Button
          onClick={submit}
          disabled={submitting}
          className="w-full"
          size="lg"
        >
          <Save className="h-4 w-4" />
          {submitting
            ? "Saving…"
            : mode === "create"
              ? "Create snippet"
              : "Save changes"}
        </Button>

        {mode === "edit" && initial?.shortId ? (
          <DeleteButton shortId={initial.shortId} />
        ) : null}
      </aside>
    </div>
  );
}

function DeleteButton({ shortId }: { shortId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  async function onDelete() {
    setBusy(true);
    const res = await fetch(`/api/snippets/${shortId}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className={cn("rounded-md border border-border p-3 text-sm")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-medium">Delete snippet</div>
          <div className="text-xs text-fg-subtle mt-0.5">
            This action cannot be undone.
          </div>
        </div>
        {!confirming ? (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setConfirming(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={onDelete}
              disabled={busy}
            >
              {busy ? "Deleting…" : "Confirm"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function dedupName(name: string, list: SnippetFormFile[]): string {
  if (!list.some((f) => f.filename === name)) return name;
  const dot = name.lastIndexOf(".");
  const base = dot < 0 ? name : name.slice(0, dot);
  const ext = dot < 0 ? "" : name.slice(dot);
  let n = 1;
  let candidate = `${base}-${n}${ext}`;
  while (list.some((f) => f.filename === candidate)) {
    n++;
    candidate = `${base}-${n}${ext}`;
  }
  return candidate;
}
