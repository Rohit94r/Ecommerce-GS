import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your Gargi Surgical & Healthcare customer account.",
};

export default function LoginPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-lg px-4 py-14 sm:px-6 lg:px-8">
        <AuthForm mode="login" />
      </section>
    </SiteShell>
  );
}
