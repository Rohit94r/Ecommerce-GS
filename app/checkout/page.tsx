import type { Metadata } from "next";
import { CheckoutClient } from "@/components/cart/CheckoutClient";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your COD checkout for medical equipment Mumbai delivery.",
};

export default function CheckoutPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <CheckoutClient />
      </section>
    </SiteShell>
  );
}
