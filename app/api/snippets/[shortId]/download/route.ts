import JSZip from "jszip";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canRead } from "@/lib/snippet";

type Params = { params: { shortId: string } };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  const snippet = await prisma.snippet.findUnique({
    where: { shortId: params.shortId },
    include: { files: true },
  });
  if (!snippet) return new Response("Not found", { status: 404 });
  if (!canRead(snippet, session?.user?.id ?? null)) {
    return new Response("Not found", { status: 404 });
  }

  if (snippet.files.length === 1) {
    const f = snippet.files[0];
    return new Response(f.content, {
      status: 200,
      headers: {
        "content-type": "application/octet-stream",
        "content-disposition": `attachment; filename="${encodeURIComponent(
          f.filename,
        )}"`,
        "cache-control": "no-store",
      },
    });
  }

  const zip = new JSZip();
  for (const f of snippet.files) zip.file(f.filename, f.content);
  const buf = await zip.generateAsync({ type: "nodebuffer" });
  return new Response(buf, {
    status: 200,
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="${snippet.shortId}.zip"`,
      "cache-control": "no-store",
    },
  });
}
