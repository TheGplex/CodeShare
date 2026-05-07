import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "codeshare",
  description: "Share, store and discover code snippets.",
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "codeshare",
    description: "Share, store and discover code snippets.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-bg text-fg font-sans antialiased">
        <Providers>
          <Navbar />
          <main className="min-h-[calc(100vh-56px)]">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
