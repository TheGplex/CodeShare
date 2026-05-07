import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canRead, canWrite } from "@/lib/snippet";
import { CodeViewer } from "@/components/code-viewer";
import { FileTabs } from "@/components/file-tabs";
import { CopyButton } from "@/components/copy-button";
import { ForkButton } from "@/components/fork-button";
import { ShareLink } from "@/components/share-link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/utils";
import { languageLabel } from "@/lib/language";
import {
  Calendar,
  Download,
  Edit,
  Eye,
  FileText,
  Globe,
  Lock,
  Link2,
  GitFork,
} from "lucide-react";

export const dynamic = "force-dynamic";

type Params = { shortId: string };

export async function generateMetadata({
  params,
}: {
  params: Params;
}) {
  const snippet = await prisma.snippet.findUnique({
    where: { shortId: params.shortId },
    select: { title: true, description: true, visibility: true },
  });
  if (!snippet || snippet.visibility === "PRIVATE") {
    return { title: "Snippet — codeshare" };
  }
  return {
    title: `${snippet.title} — codeshare`,
    description: snippet.description ?? undefined,
  };
}

export default async function SnippetPage({ params }: { params: Params }) {
  const session = await auth();
  const snippet = await prisma.snippet.findUnique({
    where: { shortId: params.shortId },
    include: {
      files: { orderBy: { position: "asc" } },
      user: { select: { username: true, avatarUrl: true, name: true } },
      forkOf: { select: { shortId: true, title: true, user: { select: { username: true } } } },
    },
  });

  if (!snippet) notFound();
  const viewerId = session?.user?.id ?? null;
  if (!canRead(snippet, viewerId)) notFound();

  const isOwner = canWrite(snippet, viewerId);

  // Fire-and-forget view increment (don't double-count owner)
  if (!isOwner) {
    prisma.snippet
      .update({
        where: { id: snippet.id },
        data: { views: { increment: 1 } },
      })
      .catch(() => {});
  }

  const VIcon =
    snippet.visibility === "PUBLIC"
      ? Globe
      : snippet.visibility === "UNLISTED"
        ? Link2
        : Lock;

  const allCode = snippet.files.map((f) => f.content).join("\n\n");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 fade-in">
      <header className="space-y-4 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold tracking-tight truncate">
                {snippet.title}
              </h1>
              <Badge
                variant={
                  snippet.visibility.toLowerCase() as
                    | "public"
                    | "unlisted"
                    | "private"
                }
              >
                <VIcon className="h-3 w-3" />
                {snippet.visibility.toLowerCase()}
              </Badge>
            </div>
            {snippet.description ? (
              <p className="mt-2 text-sm text-fg-muted whitespace-pre-wrap">
                {snippet.description}
              </p>
            ) : null}
            <div className="mt-3 flex items-center gap-4 flex-wrap text-xs text-fg-subtle">
              <Link
                href={`/u/${snippet.user.username}`}
                className="hover:text-fg transition-colors"
              >
                by{" "}
                <span className="text-fg-muted">{snippet.user.username}</span>
              </Link>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Updated {formatRelative(snippet.updatedAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {snippet.views} views
              </span>
              <span className="inline-flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {snippet.files.length} file{snippet.files.length === 1 ? "" : "s"}
              </span>
              {snippet.language ? (
                <span className="font-mono">
                  {languageLabel(snippet.language)}
                </span>
              ) : null}
              {snippet.forkOf ? (
                <Link
                  href={`/s/${snippet.forkOf.shortId}`}
                  className="inline-flex items-center gap-1 hover:text-fg"
                >
                  <GitFork className="h-3 w-3" />
                  forked from {snippet.forkOf.user.username}/{snippet.forkOf.title}
                </Link>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <CopyButton text={allCode} label="Copy all" />
            <Link href={`/api/snippets/${snippet.shortId}/download`}>
              <Button size="sm" variant="secondary">
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            </Link>
            {session?.user?.id && !isOwner ? (
              <ForkButton shortId={snippet.shortId} />
            ) : null}
            {isOwner ? (
              <Link href={`/s/${snippet.shortId}/edit`}>
                <Button size="sm" variant="default">
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </Link>
            ) : null}
          </div>
        </div>

        {snippet.visibility !== "PRIVATE" ? (
          <ShareLink shortId={snippet.shortId} />
        ) : null}
      </header>

      <FileTabs
        files={snippet.files.map((f) => ({
          id: f.id,
          filename: f.filename,
          language: f.language,
          size: f.size,
        }))}
      >
        {snippet.files.map((f) => (
          <div key={f.id}>
            <div className="flex items-center justify-between px-4 h-10 border-b border-border bg-bg-subtle">
              <div className="flex items-center gap-3 text-xs text-fg-subtle">
                <span className="font-mono">{f.filename}</span>
                {f.language ? (
                  <span className="text-fg-subtle">{languageLabel(f.language)}</span>
                ) : null}
              </div>
              <div className="flex items-center gap-1">
                <CopyButton text={f.content} variant="ghost" size="sm" />
                <Link
                  href={`/api/snippets/${snippet.shortId}/raw/${f.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button size="sm" variant="ghost">
                    Raw
                  </Button>
                </Link>
              </div>
            </div>
            <CodeViewer content={f.content} language={f.language} />
          </div>
        ))}
      </FileTabs>
    </div>
  );
}
