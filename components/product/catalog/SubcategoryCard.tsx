import Link from "next/link";
import type { CommerceCategory, CommerceSubcategory } from "@/types";

export function SubcategoryCard({ category, subcategory, index }: { category: CommerceCategory; subcategory: CommerceSubcategory; index: number }) {
  return (
    <Link
      href={`/products/${category.slug}/${subcategory.slug}`}
      className="group grid gap-4 rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5 transition duration-300 ease-out hover:-translate-y-0.5 hover:border-[#047068]/30 hover:shadow-xl hover:shadow-[#047068]/10 md:grid-cols-[1fr_auto] md:items-center"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#047068]">Section {index + 1} · {category.name}</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950 transition group-hover:text-[#047068]">{subcategory.name}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            {subcategory.products.length > 0
              ? "Compare available options, pricing and delivery support before adding to cart."
              : "This section is ready for inventory. Contact the team for current availability."}
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
          {subcategory.products.length ? `${subcategory.products.length} listed` : "On call"}
        </span>
      </div>
      <span className="inline-flex text-sm font-black text-[#047068] transition group-hover:translate-x-1 md:justify-self-end">
        View products
      </span>
    </Link>
  );
}
