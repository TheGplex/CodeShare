import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Sign up — codeshare" };

export default async function RegisterPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  const hasGithub = Boolean(
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET,
  );
  const hasGoogle = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );

  return (
    <AuthForm mode="register" hasGithub={hasGithub} hasGoogle={hasGoogle} />
  );
}
