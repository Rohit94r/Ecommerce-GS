"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useCart } from "@/hooks/useCart";
import { business } from "@/lib/dummyData";
import { formatCurrency, whatsappLink } from "@/lib/utils";

export function CheckoutClient() {
  const { items, total, clearCart } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const summary = items.map((item) => `${item.quantity} x ${item.product.name}`).join(", ");
  const message = `Hi ${business.name}, I want to place a COD order. Name: ${form.name}. Phone: ${form.phone}. Address: ${form.address}. Items: ${summary}. Total: ${formatCurrency(total)}.`;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <form className="rounded-md border border-[#047068]/15 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black text-slate-950">Checkout</h1>
        <p className="mt-2 text-slate-600">Cash on delivery available across Mumbai. Our team confirms availability before dispatch.</p>
        <div className="mt-6 grid gap-4">
          <label className="text-sm font-bold text-slate-700">Name<Input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label className="text-sm font-bold text-slate-700">Phone<Input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
          <label className="text-sm font-bold text-slate-700">Address<Textarea required value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label>
        </div>
      </form>
      <aside className="h-fit rounded-md border border-[#047068]/15 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-slate-950">COD order summary</h2>
        <div className="mt-5 space-y-3">
          {items.map((item) => (
            <div key={item.product.id} className="flex justify-between gap-3 text-sm">
              <span>{item.quantity} x {item.product.name}</span>
              <span className="font-bold">{formatCurrency(item.product.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 border-t border-[#047068]/15 pt-5 text-2xl font-black text-[#047068]">{formatCurrency(total)}</div>
        <a href={whatsappLink(message)} target="_blank" onClick={() => items.length > 0 && clearCart()}>
          <Button disabled={items.length === 0 || !form.name || !form.phone || !form.address} className="mt-6 w-full">
            WhatsApp order
          </Button>
        </a>
      </aside>
    </div>
  );
}
