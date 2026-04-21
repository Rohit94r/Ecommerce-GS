import { AdminFormCard } from "@/components/dashboard/AdminFormCard";
import { AdminTable } from "@/components/dashboard/AdminTable";
import { products } from "@/lib/dummyData";
import { formatCurrency } from "@/lib/utils";

export default function AdminProductsPage() {
  return (
    <>
      <AdminTable
        title="Products"
        headers={["Name", "Category", "Price", "Stock", "Discount"]}
        rows={products.map((product) => [product.name, product.category, formatCurrency(product.price), product.stock, `${product.discount}%`])}
      />
      <AdminFormCard title="Product form UI" />
    </>
  );
}
