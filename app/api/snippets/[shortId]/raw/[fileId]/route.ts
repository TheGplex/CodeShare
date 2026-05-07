import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canRead } from "@/lib/snippet";

type Params = { params: { shortId: string; fileId: string } };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  const snippet = await prisma.snippet.findUnique({
    where: { shortId: params.shortId },
    select: { id: true, userId: true, visibility: true },
  });
  if (!snippet) return new Response("Not found", { status: 404 });
  if (!canRead(snippet, session?.user?.id ?? null)) {
    return new Response("Not found", { status: 404 });
  }

  const file = await prisma.file.findFirst({
    where: { id: params.fileId, snippetId: snippet.id },
    select: { content: true, filename: true },
  });
  if (!file) return new Response("Not found", { status: 404 });

  return new Response(file.content, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "content-disposition": `inline; filename="${encodeURIComponent(
        file.filename,
      )}"`,
    },
  });
}
