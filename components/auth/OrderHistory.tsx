import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

type OrderItem = {
  product_name: string;
  unit_price: number | string;
  quantity: number;
};

type AccountOrder = {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  total_price: number | string;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  created_at: string;
  order_items?: OrderItem[];
};

function statusTone(status: AccountOrder["status"]) {
  if (status === "delivered") return "green";
  if (status === "cancelled") return "red";
  if (status === "confirmed") return "slate";
  return "amber";
}

export function OrderHistory({ orders }: { orders: AccountOrder[] }) {
  return (
    <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#047068]">Purchases</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">Order history</h2>
        </div>
        <p className="text-sm font-semibold text-slate-500">{orders.length} orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
          No orders yet. Your purchases will appear here after checkout.
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-lg border border-slate-200 p-4 transition hover:border-[#047068]/30 hover:shadow-md hover:shadow-[#047068]/10">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <p className="text-sm font-black text-slate-950">Order #{order.id.slice(0, 8)}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{new Date(order.created_at).toLocaleDateString("en-IN")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={statusTone(order.status)}>{order.status}</Badge>
                  <p className="text-lg font-black text-[#047068]">{formatCurrency(Number(order.total_price))}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 text-sm text-slate-600 md:grid-cols-[1fr_1fr]">
                <div>
                  <p className="font-bold text-slate-900">Delivery details</p>
                  <p className="mt-1">{order.customer_name}</p>
                  <p>{order.phone}</p>
                  <p>{order.address}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900">Products</p>
                  <div className="mt-1 grid gap-1">
                    {(order.order_items ?? []).map((item) => (
                      <div key={`${order.id}-${item.product_name}`} className="flex justify-between gap-3">
                        <span>{item.quantity} x {item.product_name}</span>
                        <span className="font-bold text-slate-800">{formatCurrency(Number(item.unit_price) * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
