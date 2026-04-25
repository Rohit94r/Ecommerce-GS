import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { RentalSearchGrid } from "@/components/rental/RentalSearchGrid";
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
        <RentalSearchGrid products={products} rentals={rentals} />
      </section>
    </SiteShell>
  );
}
