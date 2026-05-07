import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canWrite } from "@/lib/snippet";
import { SnippetForm } from "@/components/snippet-form";

export const metadata = { title: "Edit snippet — codeshare" };

export default async function EditSnippetPage({
  params,
}: {
  params: { shortId: string };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/s/${params.shortId}/edit`);
  }
  const snippet = await prisma.snippet.findUnique({
    where: { shortId: params.shortId },
    include: { files: { orderBy: { position: "asc" } } },
  });
  if (!snippet) notFound();
  if (!canWrite(snippet, session.user.id)) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit snippet
        </h1>
        <p className="text-sm text-fg-muted mt-1">
          Make your changes and save.
        </p>
      </div>
      <SnippetForm
        mode="edit"
        initial={{
          shortId: snippet.shortId,
          title: snippet.title,
          description: snippet.description,
          visibility: snippet.visibility,
          files: snippet.files.map((f) => ({
            filename: f.filename,
            content: f.content,
            language: f.language,
          })),
        }}
      />
    </div>
  );
}
