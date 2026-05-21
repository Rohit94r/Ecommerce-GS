"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import { business } from "@/lib/dummyData";
import type { Product } from "@/types";

export function CommerceProductActions({
  cartProduct,
  inStock,
}: {
  cartProduct: Product;
  inStock: boolean;
}) {
  const { addItem, items } = useCart();
  const cartQuantity = items.find((item) => item.product.id === cartProduct.id)?.quantity ?? 0;

  return (
    <div className="mt-8 grid gap-3">
      {cartQuantity > 0 ? (
        <div className="rounded-lg border border-[#047068]/20 bg-[#047068]/10 px-4 py-3 text-sm font-black text-[#047068]">
          Added to cart: {cartQuantity} item{cartQuantity > 1 ? "s" : ""}
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button disabled={!inStock} onClick={() => addItem(cartProduct)} className="w-full">
          {cartQuantity > 0 ? `Add More (${cartQuantity})` : "Add to Cart"}
        </Button>
        {cartQuantity > 0 ? (
          <Link
            href="/checkout"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#047068] px-4 text-sm font-black text-white shadow-sm shadow-[#047068]/20 transition duration-300 ease-out hover:scale-[1.03] hover:bg-[#035d57]"
          >
            Purchase Now
          </Link>
        ) : (
          <Link
            href={`tel:${business.phone.replaceAll(" ", "")}`}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[#047068]/20 bg-white px-4 text-sm font-bold text-[#047068] shadow-sm shadow-slate-900/5 transition duration-300 ease-out hover:scale-[1.03] hover:bg-[#eef8f6]"
          >
            Call Now
          </Link>
        )}
      </div>
      {cartQuantity > 0 ? (
        <Link href="/cart" className="inline-flex h-11 items-center justify-center rounded-lg border border-[#047068]/20 bg-white px-4 text-sm font-black text-[#047068] shadow-sm shadow-slate-900/5 transition duration-300 ease-out hover:scale-[1.03] hover:bg-[#eef8f6]">
          View Cart
        </Link>
      ) : null}
    </div>
  );
}
