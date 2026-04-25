"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

export function HomeProductScroller({ products }: { products: Product[] }) {
  const { addItem, items } = useCart();
  const visibleProducts = products.length > 0 ? products : [];
  const scrollingProducts = visibleProducts.length > 6 ? [...visibleProducts, ...visibleProducts] : visibleProducts;

  if (!visibleProducts.length) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="min-h-44 rounded-xl border border-dashed border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Homepage product</p>
            <p className="mt-4 text-sm leading-6 text-slate-500">Enable “Show on Homepage” from the product dashboard.</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className={`home-products-track grid grid-flow-col grid-rows-2 gap-4 overflow-x-auto pb-3 ${visibleProducts.length > 6 ? "w-max" : ""}`}>
        {scrollingProducts.map((product, index) => {
          const discountedPrice = Math.round(product.price - (product.price * product.discount) / 100);
          const cartQuantity = items.find((item) => item.product.id === product.id)?.quantity ?? 0;

          return (
            <article key={`${product.id}-${index}`} className="w-[230px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-900/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#047068]/10 sm:w-[250px]">
              <Link href="/products" className="block">
                <div className="relative aspect-[4/3] bg-slate-100">
                  <Image src={product.images[0]} alt={product.name} fill sizes="250px" className="object-cover" />
                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    {product.specialOffer ? <span className="rounded-full bg-[#047068] px-2.5 py-1 text-[11px] font-black text-white">Special Offer</span> : null}
                    {product.discount > 0 ? <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-black text-amber-700">{product.discount}% OFF</span> : null}
                  </div>
                </div>
              </Link>
              <div className="p-4">
                <h3 className="line-clamp-2 min-h-11 text-sm font-black leading-5 text-slate-950">{product.name}</h3>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-lg font-black text-slate-950">{formatCurrency(discountedPrice)}</p>
                    {product.discount > 0 ? <p className="text-xs text-slate-400 line-through">{formatCurrency(product.price)}</p> : null}
                  </div>
                  <Button className="h-9 px-3 text-xs" disabled={product.stock <= 0} onClick={() => addItem(product)}>
                    {cartQuantity > 0 ? `Add (${cartQuantity})` : "Add"}
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
