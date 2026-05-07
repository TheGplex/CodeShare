import { prisma } from "@/lib/prisma";
import { DashboardList } from "@/components/dashboard-list";

export const metadata = { title: "Discover — codeshare" };
export const dynamic = "force-dynamic";

export default async function Discover() {
  const items = await prisma.snippet.findMany({
    where: { visibility: "PUBLIC" },
    orderBy: { createdAt: "desc" },
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
      user: { select: { username: true, avatarUrl: true } },
      _count: { select: { files: true } },
    },
  });
  const next = items.length > 50 ? items.pop()!.id : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Discover</h1>
        <p className="text-sm text-fg-muted mt-1">
          Public snippets from the community.
        </p>
      </div>
      <DashboardList
        scope="discover"
        initialItems={items.map((s) => ({
          ...s,
          user: { ...s.user, username: s.user.username ?? "anonymous" },
          createdAt: s.createdAt.toISOString(),
          updatedAt: s.updatedAt.toISOString(),
        }))}
        initialNextCursor={next}
      />
    </div>
  );
}