import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { RentalCard } from "@/components/rental/RentalCard";
import { products, rentals } from "@/lib/dummyData";

export const metadata: Metadata = {
  title: "Rentals",
  description: "Wheelchair on rent Mumbai, oxygen concentrator rentals and hospital bed rental options.",
};

export default function RentalsPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#047068]">Rental equipment</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight text-slate-950">Medical equipment on rent in Mumbai</h1>
          <p className="mt-3 max-w-2xl text-slate-600">Transparent per-day estimates for oxygen on rent, wheelchair rentals and home-care hospital beds.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rentals.map((rental) => {
            const product = products.find((item) => item.id === rental.product_id);
            return product ? <RentalCard key={rental.product_id} product={product} rental={rental} /> : null;
          })}
        </div>
      </section>
    </SiteShell>
  );
}
