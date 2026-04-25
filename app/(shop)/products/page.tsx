import type { Metadata } from "next";
import { CategoryCard } from "@/components/product/catalog/CategoryCard";
import { SiteShell } from "@/components/layout/SiteShell";
import { categories } from "@/lib/dummyData";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse medical products by category, subcategory and product from Gargi Surgical & Healthcare.",
};

export default function ProductsPage() {
  return (
    <SiteShell>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#047068]">Healthcare catalog</p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-slate-950 sm:text-5xl">Shop by medical need</h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Start with a category, narrow down to the right subcategory, then compare products with pricing, stock and delivery support.
            </p>
          </div>
          <div className="mt-8 inline-flex rounded-full border border-[#047068]/20 bg-[#047068]/10 px-4 py-2 text-sm font-black text-[#047068]">
            Same Day / Next Day Delivery Available
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((category, index) => (
              <CategoryCard key={category.slug} category={category} index={index} />
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
