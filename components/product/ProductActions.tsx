"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/hooks/useCart";
import { business } from "@/lib/dummyData";
import { whatsappLink } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductActions({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <Button disabled={product.stock <= 0} onClick={() => addItem(product)} className="sm:flex-1">
        Add to Cart
      </Button>
      <Link
        href={whatsappLink(`Hi ${business.name}, I need a bulk order quote for ${product.name}.`)}
        target="_blank"
        className="inline-flex h-11 items-center justify-center rounded-md border border-[#047068]/20 bg-white px-4 text-sm font-bold text-[#047068] transition hover:bg-[#eef8f6] sm:flex-1"
      >
        Call for bulk order
      </Link>
    </div>
  );
}
