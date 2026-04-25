"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { CommerceProductCard } from "@/components/product/catalog/CommerceProductCard";
import type { CommerceCategory } from "@/types";

export function ProductSearchPanel({ categories }: { categories: CommerceCategory[] }) {
  const [query, setQuery] = useState("");
  const products = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    return categories
      .flatMap((category) =>
        category.subcategories.flatMap((subcategory) =>
          subcategory.products.map((product) => ({ category, subcategory, product })),
        ),
      )
      .filter(({ category, subcategory, product }) =>
        [category.name, subcategory.name, product.name].join(" ").toLowerCase().includes(normalized),
      );
  }, [categories, query]);

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products by name or category" aria-label="Search products" />
      {query ? (
        <div className="mt-5">
          <p className="mb-4 text-sm font-black text-slate-500">{products.length} result{products.length === 1 ? "" : "s"} found</p>
          {products.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map(({ category, subcategory, product }) => (
                <CommerceProductCard key={`${subcategory.slug}-${product.id}`} category={category} subcategory={subcategory} product={product} />
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-200 p-6 text-sm font-semibold text-slate-500">No matching products found.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
