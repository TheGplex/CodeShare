"use client";

import * as React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SnippetCard, type SnippetCardData } from "@/components/snippet-card";
import { Search, Plus } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/lib/language";

export function DashboardList({
  initialItems,
  initialNextCursor,
  scope,
}: {
  initialItems: SnippetCardData[];
  initialNextCursor: string | null;
  scope: "mine" | "discover";
}) {
  const [items, setItems] = React.useState(initialItems);
  const [cursor, setCursor] = React.useState(initialNextCursor);
  const [q, setQ] = React.useState("");
  const [language, setLanguage] = React.useState("");
  const [visibility, setVisibility] = React.useState("");
  const [sort, setSort] = React.useState(scope === "mine" ? "updated" : "created");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => fetchPage(true), 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, language, visibility, sort]);

  async function fetchPage(reset: boolean) {
    setLoading(true);
    const url = new URL("/api/snippets", window.location.origin);
    url.searchParams.set("scope", scope);
    if (q) url.searchParams.set("q", q);
    if (language) url.searchParams.set("language", language);
    if (visibility) url.searchParams.set("visibility", visibility);
    if (sort) url.searchParams.set("sort", sort);
    if (!reset && cursor) url.searchParams.set("cursor", cursor);
    const res = await fetch(url.toString());
    setLoading(false);
    if (!res.ok) return;
    const data = await res.json();
    setItems((prev) => (reset ? data.items : [...prev, ...data.items]));
    setCursor(data.nextCursor);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-subtle pointer-events-none" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title…"
            className="pl-9"
          />
        </div>
        <div className="flex gap-3">
          <Select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-40"
          >
            <option value="">All languages</option>
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </Select>
          {scope === "mine" ? (
            <Select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-36"
            >
              <option value="">All</option>
              <option value="PUBLIC">Public</option>
              <option value="UNLISTED">Unlisted</option>
              <option value="PRIVATE">Private</option>
            </Select>
          ) : null}
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-36"
          >
            {scope === "mine" ? (
              <>
                <option value="updated">Updated</option>
                <option value="created">Created</option>
                <option value="title">Title</option>
              </>
            ) : (
              <>
                <option value="created">Newest</option>
                <option value="popular">Popular</option>
              </>
            )}
          </Select>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState scope={scope} loading={loading} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 fade-in">
          {items.map((s) => (
            <SnippetCard key={s.shortId} snippet={s} />
          ))}
        </div>
      )}

      {cursor ? (
        <div className="grid place-items-center pt-4">
          <Button
            variant="secondary"
            onClick={() => fetchPage(false)}
            disabled={loading}
          >
            {loading ? "Loading…" : "Load more"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function EmptyState({
  scope,
  loading,
}: {
  scope: "mine" | "discover";
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="text-center py-20 text-fg-subtle text-sm">Loading…</div>
    );
  }
  return (
    <div className="text-center py-20 border border-dashed border-border rounded-lg">
      <p className="text-fg-muted">
        {scope === "mine"
          ? "You don't have any snippets yet."
          : "Nothing to discover yet."}
      </p>
      {scope === "mine" ? (
        <Link href="/new" className="inline-block mt-4">
          <Button>
            <Plus className="h-4 w-4" />
            Create your first snippet
          </Button>
        </Link>
      ) : null}
    </div>
  );
}
