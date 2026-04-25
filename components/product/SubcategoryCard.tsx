import Link from "next/link";
import type { CommerceCategory, CommerceSubcategory } from "@/types";

export function SubcategoryCard({ category, subcategory, index }: { category: CommerceCategory; subcategory: CommerceSubcategory; index: number }) {
  return (
    <Link
      href={`/products/${category.slug}/${subcategory.slug}`}
      className="group rounded-lg border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/5 transition duration-300 ease-out hover:-translate-y-1 hover:border-[#047068]/30 hover:shadow-xl hover:shadow-[#047068]/10"
      style={{ marginTop: index % 3 === 1 ? "0.75rem" : undefined }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#047068]">{category.name}</p>
          <h2 className="mt-3 text-2xl font-black text-slate-950 transition group-hover:text-[#047068]">{subcategory.name}</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
          {subcategory.products.length || "On call"}
        </span>
      </div>
      <p className="mt-5 max-w-sm text-sm leading-6 text-slate-600">
        {subcategory.products.length > 0
          ? "Compare available options, pricing and delivery support before adding to cart."
          : "This section is ready for backend inventory. Contact the team for current availability."}
      </p>
      <span className="mt-6 inline-flex text-sm font-black text-[#047068] transition group-hover:translate-x-1">
        View products
      </span>
    </Link>
  );
}
