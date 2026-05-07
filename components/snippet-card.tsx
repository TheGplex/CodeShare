import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { File, Eye, Globe, Lock, Link2 } from "lucide-react";
import { formatRelative } from "@/lib/utils";
import { languageLabel } from "@/lib/language";

export type SnippetCardData = {
  id?: string;
  shortId: string;
  title: string;
  description?: string | null;
  language?: string | null;
  visibility: "PUBLIC" | "UNLISTED" | "PRIVATE";
  views: number;
  createdAt?: string | Date;
  updatedAt: string | Date;
  user?: { username: string; avatarUrl?: string | null };
  _count?: { files: number };
};

const VisibilityIcon = {
  PUBLIC: Globe,
  UNLISTED: Link2,
  PRIVATE: Lock,
};

export function SnippetCard({ snippet }: { snippet: SnippetCardData }) {
  const VIcon = VisibilityIcon[snippet.visibility];
  return (
    <Link href={`/s/${snippet.shortId}`} className="block group">
      <Card className="h-full hover:border-border-strong transition-colors duration-150">
        <CardContent className="p-5 pt-5 flex flex-col gap-3 h-full">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium truncate text-fg group-hover:text-accent transition-colors">
                {snippet.title}
              </h3>
              {snippet.description ? (
                <p className="mt-1 text-xs text-fg-muted line-clamp-2">
                  {snippet.description}
                </p>
              ) : null}
            </div>
            <Badge variant={snippet.visibility.toLowerCase() as "public" | "unlisted" | "private"}>
              <VIcon className="h-3 w-3" />
              {snippet.visibility.toLowerCase()}
            </Badge>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 text-xs text-fg-subtle">
            <div className="flex items-center gap-2">
              {snippet.language ? (
                <span className="font-mono">
                  {languageLabel(snippet.language)}
                </span>
              ) : null}
              {snippet._count?.files != null ? (
                <span className="inline-flex items-center gap-1">
                  <File className="h-3 w-3" />
                  {snippet._count.files}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {snippet.views}
              </span>
            </div>
            <span>{formatRelative(snippet.updatedAt)}</span>
          </div>

          {snippet.user ? (
            <div className="text-xs text-fg-subtle">
              by{" "}
              <span className="text-fg-muted">
                {snippet.user.username}
              </span>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
