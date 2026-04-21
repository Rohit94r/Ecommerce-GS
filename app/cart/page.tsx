import type { Metadata } from "next";
import { CartClient } from "@/components/cart/CartClient";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your Gargi Surgical & Healthcare cart and medical equipment order total.",
};

export default function CartPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <CartClient />
      </section>
    </SiteShell>
  );
}
