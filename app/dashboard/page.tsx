import { AdminTable } from "@/components/dashboard/AdminTable";
import { orders, products, rentals } from "@/lib/dummyData";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Products", products.length],
          ["Rental SKUs", rentals.length],
          ["Open Orders", orders.length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-[#047068]/15 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-black text-[#047068]">{value}</p>
          </div>
        ))}
      </div>
      <AdminTable
        title="Recent orders"
        headers={["Order", "Customer", "Total", "Status"]}
        rows={orders.map((order) => [order.id, order.customer_name, formatCurrency(order.total_price), order.status])}
      />
    </div>
  );
}
