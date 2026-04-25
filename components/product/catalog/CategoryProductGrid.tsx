"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { CommerceProductCard } from "@/components/product/catalog/CommerceProductCard";
import type { CommerceCategory, CommerceProduct, CommerceSubcategory } from "@/types";

export function CategoryProductGrid({
  category,
  products,
}: {
  category: CommerceCategory;
  products: { product: CommerceProduct; subcategory: CommerceSubcategory }[];
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter(({ product, subcategory }) =>
      [category.name, subcategory.name, product.name].join(" ").toLowerCase().includes(normalized),
    );
  }, [category.name, products, query]);

  return (
    <div className="mt-8">
      <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${category.name} products`} aria-label={`Search ${category.name} products`} />
      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ product, subcategory }) => (
            <CommerceProductCard key={product.id} category={category} subcategory={subcategory} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-lg border border-dashed border-[#047068]/25 bg-white p-8 shadow-sm">
          <h3 className="text-xl font-black text-slate-950">No matching products</h3>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">Try another search term or call us for current stock and delivery options.</p>
        </div>
      )}
    </div>
  );
}
