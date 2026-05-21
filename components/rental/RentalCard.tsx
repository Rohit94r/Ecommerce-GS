import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import type { Product, Rental } from "@/types";

export function RentalCard({ product, rental }: { product: Product; rental: Rental }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5 transition duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-[#047068]/10">
      <Link href={`/rentals/${product.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-50 p-3">
          <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain p-3 transition duration-500 ease-out group-hover:scale-105" />
          <div className="absolute left-3 top-3">
            <Badge tone={rental.availability ? "green" : "red"}>{rental.availability ? "Available" : "Unavailable"}</Badge>
          </div>
        </div>
      </Link>
      <div className="p-5">
        <p className="text-sm font-bold text-[#047068]">{product.category}</p>
        <h3 className="mt-2 text-lg font-bold text-slate-950">{product.name}</h3>
        <div className="mt-5 grid gap-1 text-sm">
          <span className="font-black text-slate-950">{formatCurrency(rental.price_per_day)}/day</span>
          <span className="font-semibold text-slate-600">{formatCurrency(rental.price_per_week ?? rental.price_per_day * 7)}/week</span>
          <span className="font-semibold text-slate-600">{formatCurrency(rental.price_per_month ?? rental.price_per_day * 30)}/month</span>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <Link className="text-sm font-bold text-[#047068]" href={`/rentals/${product.id}`}>
            View rental
          </Link>
        </div>
      </div>
    </article>
  );
}
