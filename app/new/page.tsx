import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SnippetForm } from "@/components/snippet-form";

export const metadata = { title: "New snippet — codeshare" };

export default async function NewSnippetPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/new");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">New snippet</h1>
        <p className="text-sm text-fg-muted mt-1">
          Paste, type or upload your code.
        </p>
      </div>
      <SnippetForm mode="create" />
    </div>
  );
}
