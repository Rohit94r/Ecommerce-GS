import Image from "next/image";
import Link from "next/link";
import type { CommerceCategory } from "@/types";

export function CategoryCard({ category, index }: { category: CommerceCategory; index: number }) {
  const productCount = category.subcategories.reduce((total, subcategory) => total + subcategory.products.length, 0);

  return (
    <Link
      href={`/products/${category.slug}`}
      className="group block overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5 transition duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:border-[#047068]/30 hover:shadow-2xl hover:shadow-[#047068]/10"
      style={{ marginTop: index % 2 === 1 ? "1.25rem" : index === 4 ? "0.5rem" : undefined }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          src={category.image}
          alt={`${category.name} category`}
          fill
          sizes="(max-width: 768px) 100vw, 20vw"
          className="object-cover transition duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
        <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-[#047068] shadow-sm">
          {category.subcategories.length} sections
        </span>
      </div>
      <div className="p-5">
        <h2 className="text-lg font-black text-slate-950 transition group-hover:text-[#047068]">{category.name}</h2>
        <p className="mt-3 min-h-18 text-sm leading-6 text-slate-600">{category.description}</p>
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
          <span className="font-semibold text-slate-500">{productCount > 0 ? `${productCount} products listed` : "Ask for availability"}</span>
          <span className="font-black text-[#047068]">Browse</span>
        </div>
      </div>
    </Link>
  );
}
