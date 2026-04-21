import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { ProductFilters } from "@/components/product/ProductFilters";

export const metadata: Metadata = {
  title: "Products",
  description: "Shop medical equipment Mumbai, wellness, mobility and orthocare products from Gargi Surgical & Healthcare.",
};

export default function ProductsPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#047068]">Sales catalog</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight text-slate-950">Medical products for sale</h1>
          <p className="mt-3 max-w-2xl text-slate-600">Filter hospital equipment, mobility products, wellness devices and orthocare essentials.</p>
        </div>
        <ProductFilters />
      </section>
    </SiteShell>
  );
}
