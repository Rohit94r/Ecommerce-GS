import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a Gargi Surgical & Healthcare customer account.",
};

export default function SignupPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-lg px-4 py-14 sm:px-6 lg:px-8">
        <AuthForm mode="signup" />
      </section>
    </SiteShell>
  );
}
