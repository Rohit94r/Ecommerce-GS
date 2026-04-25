"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/Input";
import { RentalCard } from "@/components/rental/RentalCard";
import type { Product, Rental } from "@/types";

export function RentalSearchGrid({ rentals, products }: { rentals: Rental[]; products: Product[] }) {
  const [query, setQuery] = useState("");
  const rentalProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return rentals
      .map((rental) => {
        const product = products.find((item) => item.id === rental.product_id);
        return product ? { rental, product } : null;
      })
      .filter((item): item is { rental: Rental; product: Product } => Boolean(item))
      .filter(({ product }) => !normalized || [product.name, product.category].join(" ").toLowerCase().includes(normalized));
  }, [products, query, rentals]);

  return (
    <div>
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search rentals by product or category" aria-label="Search rentals" />
      </div>
      {rentalProducts.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rentalProducts.map(({ rental, product }) => (
            <RentalCard key={rental.product_id} product={product} rental={rental} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-[#047068]/25 bg-white p-8 shadow-sm">
          <h3 className="text-xl font-black text-slate-950">No matching rentals</h3>
          <p className="mt-3 leading-7 text-slate-600">Try another search term or contact us for availability.</p>
        </div>
      )}
    </div>
  );
}
