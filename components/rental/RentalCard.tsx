import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import type { Product, Rental } from "@/types";

export function RentalCard({ product, rental }: { product: Product; rental: Rental }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/rentals/${product.id}`}>
        <div className="relative aspect-[4/3] bg-slate-100">
          <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
          <div className="absolute left-3 top-3">
            <Badge tone={rental.availability ? "green" : "red"}>{rental.availability ? "Available" : "Unavailable"}</Badge>
          </div>
        </div>
      </Link>
      <div className="p-5">
        <p className="text-sm font-bold text-[#047068]">{product.category}</p>
        <h3 className="mt-2 text-lg font-bold text-slate-950">{product.name}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{product.description}</p>
        <div className="mt-5 flex items-center justify-between">
          <span className="font-black text-slate-950">{formatCurrency(rental.price_per_day)}/day</span>
          <Link className="text-sm font-bold text-[#047068]" href={`/rentals/${product.id}`}>
            View rental
          </Link>
        </div>
      </div>
    </article>
  );
}
