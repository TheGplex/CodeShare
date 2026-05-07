import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Sign in — codeshare" };

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  const hasGithub = Boolean(
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET,
  );
  const hasGoogle = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );

  return <AuthForm mode="login" hasGithub={hasGithub} hasGoogle={hasGoogle} />;
}
