import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SnippetUpdate, MAX_TOTAL_BYTES, totalBytes, canRead, canWrite } from "@/lib/snippet";
import { detectLanguage } from "@/lib/language";

type Params = { params: { shortId: string } };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  const snippet = await prisma.snippet.findUnique({
    where: { shortId: params.shortId },
    include: {
      files: { orderBy: { position: "asc" } },
      user: { select: { username: true, avatarUrl: true, name: true } },
    },
  });
  if (!snippet) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canRead(snippet, session?.user?.id ?? null)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(snippet);
}

export async function PUT(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snippet = await prisma.snippet.findUnique({
    where: { shortId: params.shortId },
    select: { id: true, userId: true },
  });
  if (!snippet) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canWrite(snippet, session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body;
  try {
    body = SnippetUpdate.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid input", details: (err as Error).message },
      { status: 400 },
    );
  }

  if (body.files) {
    if (totalBytes(body.files) > MAX_TOTAL_BYTES) {
      return NextResponse.json({ error: "Too large" }, { status: 413 });
    }
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
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (body.files) {
      await tx.file.deleteMany({ where: { snippetId: snippet.id } });
      await tx.file.createMany({
        data: body.files.map((f, i) => ({
          snippetId: snippet.id,
          filename: f.filename,
          content: f.content,
          language: f.language ?? detectLanguage(f.filename),
          size: Buffer.byteLength(f.content, "utf8"),
          position: i,
        })),
      });
    }
    return tx.snippet.update({
      where: { id: snippet.id },
      data: {
        title: body.title ?? undefined,
        description: body.description ?? undefined,
        visibility: body.visibility ?? undefined,
        language:
          body.files?.[0]
            ? body.files[0].language ?? detectLanguage(body.files[0].filename)
            : undefined,
      },
      select: { shortId: true, id: true },
    });
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const snippet = await prisma.snippet.findUnique({
    where: { shortId: params.shortId },
    select: { id: true, userId: true },
  });
  if (!snippet) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canWrite(snippet, session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.snippet.delete({ where: { id: snippet.id } });
  return NextResponse.json({ ok: true });
}
