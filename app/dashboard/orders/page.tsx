import { AdminTable } from "@/components/dashboard/AdminTable";
import { orders } from "@/lib/dummyData";
import { formatCurrency } from "@/lib/utils";

export default function AdminOrdersPage() {
  return (
    <AdminTable
      title="Orders"
      headers={["Order", "Customer", "Phone", "Address", "Total", "Status"]}
      rows={orders.map((order) => [order.id, order.customer_name, order.phone, order.address, formatCurrency(order.total_price), order.status])}
    />
  );
}
