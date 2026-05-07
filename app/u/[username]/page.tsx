import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SnippetCard } from "@/components/snippet-card";
import { Calendar } from "lucide-react";
import { formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}) {
  return { title: `${params.username} — codeshare` };
}

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { username: params.username },
  });
  if (!user) notFound();

  // We looked the user up by username, so it cannot actually be null here —
  // TS only sees `string | null` because the column is nullable in the schema.
  const username = user.username ?? params.username;
  const isSelf = session?.user?.id === user.id;
  const snippets = await prisma.snippet.findMany({
    where: {
      userId: user.id,
      ...(isSelf ? {} : { visibility: "PUBLIC" }),
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: {
      id: true,
      shortId: true,
      title: true,
      description: true,
      language: true,
      visibility: true,
      views: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { files: true } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 fade-in">
      <header className="flex items-center gap-5 pb-8 border-b border-border">
        <div className="grid place-items-center h-20 w-20 rounded-full bg-bg-muted border border-border text-2xl font-semibold text-fg-muted">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={username}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            username[0].toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight truncate">
            {user.name ?? username}
          </h1>
          <p className="text-fg-muted">@{username}</p>
          {user.bio ? (
            <p className="mt-2 text-sm text-fg-muted">{user.bio}</p>
          ) : null}
          <div className="mt-2 flex items-center gap-3 text-xs text-fg-subtle">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Joined {formatRelative(user.createdAt)}
            </span>
            <span>·</span>
            <span>
              {snippets.length} snippet{snippets.length === 1 ? "" : "s"}
              {isSelf ? "" : " (public)"}
            </span>
          </div>
        </div>
      </header>

      <section className="py-8">
        {snippets.length === 0 ? (
          <p className="text-center py-12 text-fg-muted">
            {isSelf
              ? "You haven't created any snippets yet."
              : "No public snippets yet."}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {snippets.map((s) => (
              <SnippetCard
                key={s.shortId}
                snippet={{
                  ...s,
                  createdAt: s.createdAt.toISOString(),
                  updatedAt: s.updatedAt.toISOString(),
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
