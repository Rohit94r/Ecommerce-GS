"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import { business } from "@/lib/dummyData";
import { whatsappLink } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductActions({ product }: { product: Product }) {
  const { addItem, items } = useCart();
  const cartQuantity = items.find((item) => item.product.id === product.id)?.quantity ?? 0;

  return (
    <div className="mt-8 grid gap-3">
      {cartQuantity > 0 ? (
        <div className="rounded-lg border border-[#047068]/20 bg-[#047068]/10 px-4 py-3 text-sm font-black text-[#047068]">
          Added to cart: {cartQuantity} item{cartQuantity > 1 ? "s" : ""}
        </div>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button disabled={product.stock <= 0} onClick={() => addItem(product)} className="sm:flex-1">
          {cartQuantity > 0 ? `Add More (${cartQuantity})` : "Add to Cart"}
        </Button>
        {cartQuantity > 0 ? (
          <Link
            href="/checkout"
            className="inline-flex h-11 items-center justify-center rounded-md bg-[#047068] px-4 text-sm font-black text-white transition hover:bg-[#035d57] sm:flex-1"
          >
            Purchase Now
          </Link>
        ) : (
          <Link
            href={whatsappLink(`Hi ${business.name}, I need a bulk order quote for ${product.name}.`)}
            target="_blank"
            className="inline-flex h-11 items-center justify-center rounded-md border border-[#047068]/20 bg-white px-4 text-sm font-bold text-[#047068] transition hover:bg-[#eef8f6] sm:flex-1"
          >
            Call for bulk order
          </Link>
        )}
      </div>
      {cartQuantity > 0 ? (
        <Link href="/cart" className="inline-flex h-11 items-center justify-center rounded-md border border-[#047068]/20 bg-white px-4 text-sm font-black text-[#047068] transition hover:bg-[#eef8f6]">
          View Cart
        </Link>
      ) : null}
    </div>
  );
}
