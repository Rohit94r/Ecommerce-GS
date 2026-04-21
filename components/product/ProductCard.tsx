"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const discountedPrice = product.price - Math.round((product.price * product.discount) / 100);

  return (
    <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
          <div className="absolute left-3 top-3 flex gap-2">
            {product.discount > 0 ? <Badge tone="amber">{product.discount}% OFF</Badge> : null}
            {product.stock <= 0 ? <Badge tone="red">Out of Stock</Badge> : <Badge>In Stock</Badge>}
          </div>
        </div>
      </Link>
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#047068]">{product.category}</p>
        <Link href={`/products/${product.id}`}>
          <h3 className="mt-2 text-lg font-bold text-slate-950 transition hover:text-[#047068]">{product.name}</h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{product.description}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xl font-black text-slate-950">{formatCurrency(discountedPrice)}</p>
            {product.discount > 0 ? <p className="text-sm text-slate-400 line-through">{formatCurrency(product.price)}</p> : null}
          </div>
          <Button disabled={product.stock <= 0} onClick={() => addItem(product)}>
            Add
          </Button>
        </div>
      </div>
    </article>
  );
}
