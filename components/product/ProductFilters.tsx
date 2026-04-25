"use client";

import { useMemo, useState } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Input } from "@/components/ui/Input";
import { products, serviceCategories } from "@/lib/dummyData";
import type { ProductCategory } from "@/types";

export function ProductFilters() {
  const [category, setCategory] = useState<ProductCategory | "All">("All");
  const [maxPrice, setMaxPrice] = useState(50000);

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const categoryMatch = category === "All" || product.category === category;
        return categoryMatch && product.price <= maxPrice;
      }),
    [category, maxPrice],
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="h-fit rounded-md border border-[#047068]/15 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">Filters</h2>
        <label className="mt-5 block text-sm font-bold text-slate-700" htmlFor="category">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(event) => setCategory(event.target.value as ProductCategory | "All")}
          className="mt-2 w-full rounded-md border border-[#047068]/15 bg-white px-3 py-3 text-sm outline-none focus:border-[#047068]"
        >
          <option>All</option>
          {serviceCategories.map((item) => (
            <option key={item.name}>{item.name}</option>
          ))}
        </select>
        <label className="mt-5 block text-sm font-bold text-slate-700" htmlFor="price">
          Max price: ₹{maxPrice.toLocaleString("en-IN")}
        </label>
        <Input
          id="price"
          type="range"
          min={1000}
          max={50000}
          step={500}
          value={maxPrice}
          onChange={(event) => setMaxPrice(Number(event.target.value))}
          className="px-0"
        />
      </aside>
      <section>
        <p className="mb-4 text-sm font-semibold text-slate-500">{filtered.length} products found</p>
        <ProductGrid products={filtered} />
      </section>
    </div>
  );
}
