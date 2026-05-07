import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Code2, Compass, Lock, Share2, Zap } from "lucide-react";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <section className="py-20 sm:py-32 text-center fade-in">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bg-muted border border-border text-xs text-fg-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Self-hosted code sharing
          </span>
          <h1 className="mt-6 text-4xl sm:text-6xl font-semibold tracking-tight">
            Share code,
            <br />
            <span className="text-accent">without the noise.</span>
          </h1>
          <p className="mt-6 text-lg text-fg-muted max-w-xl mx-auto">
            A clean, private place to store your snippets. Public when you want
            it, locked down when you don&apos;t. Works with everything you write.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            {session ? (
              <Link href="/new">
                <Button size="lg">
                  <Code2 className="h-4 w-4" />
                  New snippet
                </Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button size="lg">Get started</Button>
              </Link>
            )}
            <Link href="/discover">
              <Button size="lg" variant="secondary">
                <Compass className="h-4 w-4" />
                Discover
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 grid sm:grid-cols-3 gap-6 fade-in">
        <Feature
          icon={Lock}
          title="Private by default"
          body="Snippets are private until you decide otherwise. Owner-checked at every read."
        />
        <Feature
          icon={Share2}
          title="Sharable links"
          body="Short, copy-friendly URLs like /s/aB3xK9. Public, unlisted, or private."
        />
        <Feature
          icon={Zap}
          title="Fast & lean"
          body="Server-rendered, dark-only, no telemetry. Runs comfortably on a Raspberry Pi."
        />
      </section>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Code2;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-bg-card p-6 hover:border-border-strong transition-colors duration-150">
      <div className="grid place-items-center h-9 w-9 rounded-md bg-accent-muted text-accent mb-4">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="font-medium">{title}</h3>
      <p className="mt-1.5 text-sm text-fg-muted">{body}</p>
    </div>
  );
}
