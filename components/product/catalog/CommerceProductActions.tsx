"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import { toCartProduct } from "@/lib/catalog";
import { business } from "@/lib/dummyData";
import type { CommerceCategory, CommerceProduct, CommerceSubcategory } from "@/types";

export function CommerceProductActions({
  category,
  subcategory,
  product,
}: {
  category: CommerceCategory;
  subcategory: CommerceSubcategory;
  product: CommerceProduct;
}) {
  const { addItem, items } = useCart();
  const cartQuantity = items.find((item) => item.product.id === product.id)?.quantity ?? 0;
  const cartProduct = toCartProduct(product, category, subcategory);

  return (
    <div className="mt-8 grid gap-3">
      {cartQuantity > 0 ? (
        <div className="rounded-lg border border-[#047068]/20 bg-[#047068]/10 px-4 py-3 text-sm font-black text-[#047068]">
          Added to cart: {cartQuantity} item{cartQuantity > 1 ? "s" : ""}
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
      <Button disabled={!product.stock} onClick={() => addItem(cartProduct)} className="w-full">
        {cartQuantity > 0 ? `Add More (${cartQuantity})` : "Add to Cart"}
      </Button>
      <Link
        href={`tel:${business.phone.replaceAll(" ", "")}`}
        className="inline-flex h-11 items-center justify-center rounded-lg border border-[#047068]/20 bg-white px-4 text-sm font-bold text-[#047068] shadow-sm shadow-slate-900/5 transition duration-300 ease-out hover:scale-[1.03] hover:bg-[#eef8f6]"
      >
        Call Now
      </Link>
      </div>
    </div>
  );
}
