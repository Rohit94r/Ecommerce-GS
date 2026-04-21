"use client";

import Image from "next/image";
import Link from "next/link";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils";

export function CartClient() {
  const { items, removeItem, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-md border border-[#047068]/15 bg-white p-10 text-center shadow-sm">
        <h1 className="text-3xl font-black text-slate-950">Your cart is empty</h1>
        <p className="mt-3 text-slate-600">Add medical equipment, wellness products or mobility essentials to continue.</p>
        <LinkButton className="mt-6" href="/products">Browse products</LinkButton>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section className="space-y-4">
        {items.map((item) => (
          <article key={item.product.id} className="grid gap-4 rounded-md border border-[#047068]/15 bg-white p-4 shadow-sm sm:grid-cols-[120px_1fr_auto]">
            <div className="relative aspect-square overflow-hidden rounded-md bg-slate-100">
              <Image src={item.product.images[0]} alt={item.product.name} fill sizes="120px" className="object-cover" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-950">{item.product.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{item.product.category}</p>
              <p className="mt-3 font-black text-[#047068]">{formatCurrency(item.product.price)}</p>
            </div>
            <div className="flex items-center gap-3 sm:flex-col sm:items-end">
              <Input
                aria-label={`Quantity for ${item.product.name}`}
                className="w-24"
                min={1}
                type="number"
                value={item.quantity}
                onChange={(event) => updateQuantity(item.product.id, Number(event.target.value))}
              />
              <Button onClick={() => removeItem(item.product.id)} variant="ghost">
                Remove
              </Button>
            </div>
          </article>
        ))}
      </section>
      <aside className="h-fit rounded-md border border-[#047068]/15 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">Order summary</h2>
        <div className="mt-5 space-y-3 border-b border-[#047068]/15 pb-5 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(total)}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>Calculated on call</span></div>
        </div>
        <div className="mt-5 flex justify-between text-xl font-black">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <LinkButton className="mt-6 w-full" href="/checkout">Checkout</LinkButton>
        <Link href="/products" className="mt-4 block text-center text-sm font-bold text-[#047068]">
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
