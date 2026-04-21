import { AdminFormCard } from "@/components/dashboard/AdminFormCard";
import { AdminTable } from "@/components/dashboard/AdminTable";
import { products, rentals } from "@/lib/dummyData";
import { formatCurrency } from "@/lib/utils";

export default function AdminRentalsPage() {
  return (
    <>
      <AdminTable
        title="Rentals"
        headers={["Product", "Price per day", "Availability"]}
        rows={rentals.map((rental) => {
          const product = products.find((item) => item.id === rental.product_id);
          return [product?.name ?? rental.product_id, formatCurrency(rental.price_per_day), rental.availability ? "Available" : "Unavailable"];
        })}
      />
      <AdminFormCard title="Rental form UI" />
    </>
  );
}
