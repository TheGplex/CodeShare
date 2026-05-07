import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canRead } from "@/lib/snippet";
import { newShortId } from "@/lib/short-id";

type Params = { params: { shortId: string } };

export async function POST(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const source = await prisma.snippet.findUnique({
    where: { shortId: params.shortId },
    include: { files: { orderBy: { position: "asc" } } },
  });
  if (!source) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canRead(source, session.user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let shortId = newShortId();
  for (let i = 0; i < 6; i++) {
    const exists = await prisma.snippet.findUnique({
      where: { shortId },
      select: { id: true },
    });
    if (!exists) break;
    shortId = newShortId();
  }

  const fork = await prisma.snippet.create({
    data: {
      shortId,
      userId: session.user.id,
      title: source.title,
      description: source.description,
      language: source.language,
      visibility: "PRIVATE",
      forkOfId: source.id,
      files: {
        create: source.files.map((f) => ({
          filename: f.filename,
          content: f.content,
          language: f.language,
          size: f.size,
          position: f.position,
        })),
      },
    },
    select: { shortId: true, id: true },
  });
  return NextResponse.json(fork, { status: 201 });
}
