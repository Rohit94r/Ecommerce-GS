"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useCart } from "@/hooks/useCart";
import { business } from "@/lib/dummyData";
import { formatCurrency, whatsappLink } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

export function CheckoutClient() {
  const supabase = createClient();
  const { items, total, clearCart } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const summary = items.map((item) => `${item.quantity} x ${item.product.name}`).join(", ");
  const message = `Hi ${business.name}, I want to place a COD order. Name: ${form.name}. Phone: ${form.phone}. Address: ${form.address}. Items: ${summary}. Total: ${formatCurrency(total)}.`;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      const metadata = data.user?.user_metadata;
      setForm((current) => ({
        ...current,
        name: current.name || metadata?.name || metadata?.full_name || "",
      }));
    });
  }, [supabase.auth]);

  async function placeOrder() {
    setError("");
    if (!userId) {
      setError("Please login before checkout so your order history can be saved.");
      return;
    }
    if (items.length === 0 || !form.name || !form.phone || !form.address) return;

    setLoading(true);
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        customer_name: form.name,
        phone: form.phone,
        address: form.address,
        total_price: total,
        status: "pending",
        notes: "COD WhatsApp order",
      })
      .select("id")
      .single();

    if (orderError) {
      setLoading(false);
      setError(orderError.message);
      return;
    }

    const { error: itemError } = await supabase.from("order_items").insert(
      items.map((item) => ({
        order_id: order.id,
        product_id: /^[0-9a-f-]{36}$/i.test(item.product.id) ? item.product.id : null,
        product_name: item.product.name,
        unit_price: item.product.price,
        quantity: item.quantity,
      })),
    );

    setLoading(false);

    if (itemError) {
      setError(itemError.message);
      return;
    }

    clearCart();
    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
  }

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
        {error ? <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
        <Button disabled={loading || items.length === 0 || !form.name || !form.phone || !form.address} className="mt-6 w-full" onClick={placeOrder}>
          {loading ? "Saving order..." : "Save & WhatsApp order"}
        </Button>
      </aside>
    </div>
  );
}
