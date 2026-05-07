import type { Visibility } from "@prisma/client";
import { z } from "zod";

export const MAX_FILES = 25;
export const MAX_FILE_BYTES = 500_000; // 500 KB per file
export const MAX_TOTAL_BYTES = 4_000_000; // 4 MB per snippet

export const FileInput = z.object({
  filename: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[^/\\:*?"<>|]+$/, "Invalid filename"),
  content: z.string().max(MAX_FILE_BYTES, "File too large"),
  language: z.string().max(40).optional().nullable(),
});

export const SnippetCreate = z.object({
  title: z.string().min(1).max(140),
  description: z.string().max(2000).optional().nullable(),
  visibility: z.enum(["PUBLIC", "UNLISTED", "PRIVATE"]),
  files: z.array(FileInput).min(1).max(MAX_FILES),
});

export const SnippetUpdate = SnippetCreate.partial().extend({
  files: z.array(FileInput).min(1).max(MAX_FILES).optional(),
});

export type SnippetCreateInput = z.infer<typeof SnippetCreate>;
export type SnippetUpdateInput = z.infer<typeof SnippetUpdate>;

export function totalBytes(files: { content: string }[]): number {
  return files.reduce((acc, f) => acc + Buffer.byteLength(f.content, "utf8"), 0);
}

export function canRead(
  snippet: { userId: string; visibility: Visibility },
  viewerId: string | null,
): boolean {
  if (snippet.visibility !== "PRIVATE") return true;
  return snippet.userId === viewerId;
}

export function canWrite(
  snippet: { userId: string },
  viewerId: string | null,
): boolean {
  return Boolean(viewerId) && snippet.userId === viewerId;
}
