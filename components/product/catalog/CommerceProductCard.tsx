"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import { getCommerceProductImages, toCartProduct } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";
import type { CommerceCategory, CommerceProduct, CommerceSubcategory } from "@/types";

export function CommerceProductCard({
  category,
  subcategory,
  product,
}: {
  category: CommerceCategory;
  subcategory: CommerceSubcategory;
  product: CommerceProduct;
}) {
  const { addItem, items } = useCart();
  const discountedPrice = Math.round(product.price - (product.price * product.discount) / 100);
  const href = `/products/${category.slug}/${subcategory.slug}/${product.id}`;
  const cartQuantity = items.find((item) => item.product.id === product.id)?.quantity ?? 0;
  const cartProduct = toCartProduct(product, category, subcategory);

  return (
    <article className={`group overflow-hidden rounded-lg border bg-white shadow-sm shadow-slate-900/5 transition duration-300 ease-out hover:-translate-y-1 hover:border-[#047068]/25 hover:shadow-xl hover:shadow-[#047068]/10 ${cartQuantity > 0 ? "border-[#047068] ring-2 ring-[#047068]/15" : "border-slate-200/80"}`}>
      <Link href={href} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <Image
            src={getCommerceProductImages(product)[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 ease-out group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {product.discount > 0 ? <Badge tone="amber">{product.discount}% OFF</Badge> : null}
            <Badge tone={product.stock ? "green" : "red"}>{product.stock ? "In Stock" : "Out of Stock"}</Badge>
          </div>
          {cartQuantity > 0 ? (
            <div className="absolute right-3 top-3 rounded-full bg-[#047068] px-3 py-1 text-xs font-black text-white shadow-md">
              {cartQuantity} in cart
            </div>
          ) : null}
        </div>
      </Link>
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#047068]">{subcategory.name}</p>
        <Link href={href}>
          <h2 className="mt-2 text-lg font-black text-slate-950 transition hover:text-[#047068]">{product.name}</h2>
        </Link>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-black text-slate-950">{formatCurrency(discountedPrice)}</p>
            {product.discount > 0 ? <p className="text-sm text-slate-400 line-through">{formatCurrency(product.price)}</p> : null}
          </div>
          <Button disabled={!product.stock} onClick={() => addItem(cartProduct)}>
            {cartQuantity > 0 ? `Add More (${cartQuantity})` : "Add to Cart"}
          </Button>
        </div>
      </div>
    </article>
  );
}
