import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountProfile } from "@/components/auth/AccountProfile";
import { OrderHistory } from "@/components/auth/OrderHistory";
import { SiteShell } from "@/components/layout/SiteShell";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "My Account",
  description: "Customer account for Gargi Surgical & Healthcare.",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, email, phone, address")
    .eq("id", user.id)
    .maybeSingle();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, customer_name, phone, address, total_price, status, created_at, order_items(product_name, unit_price, quantity)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <AccountProfile
          profile={{
            id: user.id,
            name: profile?.name || user.user_metadata?.name || user.user_metadata?.full_name || "",
            email: profile?.email || user.email || "",
            phone: profile?.phone || "",
            address: profile?.address || "",
          }}
        />
        <OrderHistory orders={orders ?? []} />
      </section>
    </SiteShell>
  );
}
