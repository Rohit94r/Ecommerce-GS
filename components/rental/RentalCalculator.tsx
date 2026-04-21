"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { business } from "@/lib/dummyData";
import { formatCurrency, whatsappLink } from "@/lib/utils";
import type { Product, Rental } from "@/types";

export function RentalCalculator({ product, rental }: { product: Product; rental: Rental }) {
  const [days, setDays] = useState(7);
  const total = days * rental.price_per_day;

  return (
    <div className="rounded-md border border-[#047068]/15 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-950">Rental estimate</h2>
        <Badge tone={rental.availability ? "green" : "red"}>{rental.availability ? "Available" : "Unavailable"}</Badge>
      </div>
      <p className="mt-4 text-3xl font-black text-slate-950">{formatCurrency(rental.price_per_day)} <span className="text-base font-semibold text-slate-500">per day</span></p>
      <label htmlFor="days" className="mt-6 block text-sm font-bold text-slate-700">
        Number of days
      </label>
      <Input id="days" min={1} type="number" value={days} onChange={(event) => setDays(Math.max(1, Number(event.target.value)))} />
      <div className="mt-6 rounded-md bg-[#047068]/10 p-4">
        <p className="text-sm font-semibold text-slate-600">Estimated total</p>
        <p className="text-3xl font-black text-[#047068]">{formatCurrency(total)}</p>
      </div>
      <Link href={whatsappLink(`Hi ${business.name}, I want to rent ${product.name} for ${days} days. Estimated total: ${formatCurrency(total)}.`)} target="_blank">
        <Button disabled={!rental.availability} className="mt-5 w-full">
          Request rental
        </Button>
      </Link>
      <p className="mt-3 text-center text-xs font-semibold text-slate-500">Same Day / Next Day Delivery Available</p>
    </div>
  );
}
