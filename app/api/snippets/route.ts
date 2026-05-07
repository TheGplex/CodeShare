import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { SnippetCreate, MAX_TOTAL_BYTES, totalBytes } from "@/lib/snippet";
import { newShortId } from "@/lib/short-id";
import { detectLanguage } from "@/lib/language";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = rateLimit(`create:${session.user.id}`, {
    windowMs: 60_000,
    max: 30,
  });
  if (!limit.ok) {
    return NextResponse.json({ error: "Slow down" }, { status: 429 });
  }

  let body;
  try {
    body = SnippetCreate.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid input", details: (err as Error).message },
      { status: 400 },
    );
  }

  if (totalBytes(body.files) > MAX_TOTAL_BYTES) {
    return NextResponse.json(
      { error: "Snippet exceeds 4 MB total size" },
      { status: 413 },
    );
  }

  // Files must have unique filenames
  const seen = new Set<string>();
  for (const f of body.files) {
    if (seen.has(f.filename)) {
      return NextResponse.json(
        { error: `Duplicate filename: ${f.filename}` },
        { status: 400 },
      );
    }
    seen.add(f.filename);
  }

  // Pick a short id
  const shortId = await reserveShortId();

  // Top-level snippet language = first file's language
  const primaryLang =
    body.files[0].language ?? detectLanguage(body.files[0].filename);

  const snippet = await prisma.snippet.create({
    data: {
      shortId,
      userId: session.user.id,
      title: body.title,
      description: body.description ?? null,
      language: primaryLang,
      visibility: body.visibility,
      files: {
        create: body.files.map((f, i) => ({
          filename: f.filename,
          content: f.content,
          language: f.language ?? detectLanguage(f.filename),
          size: Buffer.byteLength(f.content, "utf8"),
          position: i,
        })),
      },
    },
    select: { shortId: true, id: true },
  });

  return NextResponse.json(snippet, { status: 201 });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const scope = url.searchParams.get("scope") ?? "mine";
  const q = url.searchParams.get("q")?.trim() ?? "";
  const language = url.searchParams.get("language") ?? "";
  const visibility = url.searchParams.get("visibility") ?? "";
  const sort = url.searchParams.get("sort") ?? "updated";
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 100);
  const cursor = url.searchParams.get("cursor") ?? undefined;

  const session = await auth();

  if (scope === "mine") {
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const where: Prisma.SnippetWhereInput = {
      userId: session.user.id,
    };
    if (q) where.title = { contains: q, mode: "insensitive" };
    if (language) where.language = language;
    if (visibility) where.visibility = visibility as never;

    const items = await prisma.snippet.findMany({
      where,
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      orderBy:
        sort === "created"
          ? { createdAt: "desc" }
          : sort === "title"
            ? { title: "asc" }
            : { updatedAt: "desc" },
      select: snippetListSelect,
    });
    const next = items.length > limit ? items.pop()!.id : null;
    return NextResponse.json({ items, nextCursor: next });
  }

  // Discover (public)
  const where: Prisma.SnippetWhereInput = {
    visibility: "PUBLIC",
  };
  if (q) where.title = { contains: q, mode: "insensitive" };
  if (language) where.language = language;

  const items = await prisma.snippet.findMany({
    where,
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    orderBy: sort === "popular" ? { views: "desc" } : { createdAt: "desc" },
    select: snippetListSelect,
  });
  const next = items.length > limit ? items.pop()!.id : null;
  return NextResponse.json({ items, nextCursor: next });
}

const snippetListSelect = {
  id: true,
  shortId: true,
  title: true,
  description: true,
  language: true,
  visibility: true,
  views: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { username: true, avatarUrl: true } },
  _count: { select: { files: true } },
} as const;

async function reserveShortId(): Promise<string> {
  for (let i = 0; i < 6; i++) {
    const candidate = newShortId();
    const exists = await prisma.snippet.findUnique({
      where: { shortId: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
  }
  // Extremely unlikely; fall back to a longer id
  return `${newShortId()}${newShortId()}`;
}
