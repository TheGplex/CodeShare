"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthForm({
  mode,
  hasGithub,
  hasGoogle,
}: {
  mode: "login" | "register";
  hasGithub: boolean;
  hasGoogle: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "register") {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, username, password }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "Registration failed");
          setBusy(false);
          return;
        }
      }
      const r = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!r || r.error) {
        setError("Invalid credentials");
        setBusy(false);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "login" ? "Sign in" : "Create your account"}
        </h1>
        <p className="text-sm text-fg-muted">
          {mode === "login"
            ? "Welcome back. Sign in to continue."
            : "Free, takes ten seconds."}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {mode === "register" ? (
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              required
              minLength={3}
              maxLength={32}
              pattern="[a-zA-Z0-9_-]+"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        ) : null}
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            required
            minLength={mode === "register" ? 8 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error ? (
          <div className="rounded-md border border-danger-muted bg-danger-muted text-danger px-3 py-2 text-sm">
            {error}
          </div>
        ) : null}

        <Button type="submit" disabled={busy} className="w-full" size="lg">
          {busy
            ? "Working…"
            : mode === "login"
              ? "Sign in"
              : "Create account"}
        </Button>
      </form>

      {hasGithub || hasGoogle ? (
        <>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-fg-subtle">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="space-y-2">
            {hasGithub ? (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => signIn("github", { callbackUrl })}
              >
                Continue with GitHub
              </Button>
            ) : null}
            {hasGoogle ? (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => signIn("google", { callbackUrl })}
              >
                Continue with Google
              </Button>
            ) : null}
          </div>
        </>
      ) : null}

      <p className="text-sm text-fg-muted text-center">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/register" className="text-accent hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
