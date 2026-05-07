import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="grid place-items-center min-h-[calc(100vh-56px)] py-20">
        <div className="text-center">
          <p className="text-sm uppercase tracking-wider text-accent">404</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Not found
          </h1>
          <p className="mt-3 text-fg-muted">
            That page or snippet doesn&apos;t exist — or it&apos;s private.
          </p>
          <Link href="/" className="inline-block mt-6">
            <Button variant="secondary">Back home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
