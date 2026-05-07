import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardList } from "@/components/dashboard-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const metadata = { title: "Dashboard — codeshare" };
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/dashboard");

  const items = await prisma.snippet.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 51,
    select: {
      id: true,
      shortId: true,
      title: true,
      description: true,
      language: true,
      visibility: true,
      views: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { files: true } },
    },
  });
  const next = items.length > 50 ? items.pop()!.id : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Your snippets
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            Hi {session.user.username} — manage your saved code.
          </p>
        </div>
        <Link href="/new">
          <Button>
            <Plus className="h-4 w-4" />
            New snippet
          </Button>
        </Link>
      </div>
      <DashboardList
        scope="mine"
        initialItems={items.map(serialize)}
        initialNextCursor={next}
      />
    </div>
  );
}

function serialize<T extends { createdAt: Date; updatedAt: Date }>(s: T) {
  return {
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}
