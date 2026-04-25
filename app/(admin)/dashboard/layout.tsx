import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { isAdminEmail } from "@/lib/admin";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin UI for Gargi Surgical & Healthcare product, rental, order and blog management.",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!isAdminEmail(user.email)) redirect("/account");

  return <DashboardShell>{children}</DashboardShell>;
}
