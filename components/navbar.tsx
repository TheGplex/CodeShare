"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Code2, Plus, Compass, LayoutGrid, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const navLink = (href: string, label: string, Icon?: typeof Code2) => {
    const active =
      pathname === href ||
      (href !== "/" && pathname?.startsWith(href + "/"));
    return (
      <Link
        href={href}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-sm transition-colors duration-150",
          active
            ? "text-fg bg-bg-muted"
            : "text-fg-muted hover:text-fg hover:bg-bg-muted",
        )}
      >
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-2 mr-2 group"
          >
            <span className="grid place-items-center h-7 w-7 rounded-md bg-accent-muted text-accent transition-colors group-hover:bg-accent group-hover:text-bg">
              <Code2 className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="font-semibold tracking-tight">codeshare</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-0.5">
            {navLink("/discover", "Discover", Compass)}
            {session ? navLink("/dashboard", "Dashboard", LayoutGrid) : null}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {status === "loading" ? null : session?.user ? (
            <>
              <Link href="/new" className="hidden sm:block">
                <Button size="sm" variant="default">
                  <Plus className="h-3.5 w-3.5" />
                  New
                </Button>
              </Link>
              <Link
                href={`/u/${session.user.username}`}
                className="inline-flex items-center gap-2 px-2 h-8 rounded-md text-sm text-fg-muted hover:text-fg hover:bg-bg-muted transition-colors"
              >
                <User className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{session.user.username}</span>
              </Link>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => signOut({ callbackUrl: "/" })}
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button size="sm" variant="ghost">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" variant="default">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
