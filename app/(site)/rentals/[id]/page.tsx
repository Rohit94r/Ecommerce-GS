import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { SiteShell } from "@/components/layout/SiteShell";
import { ProductMediaGallery } from "@/components/product/catalog/ProductMediaGallery";
import { ProductOptionGroups } from "@/components/product/catalog/ProductOptionGroups";
import { RentalCalculator } from "@/components/rental/RentalCalculator";
import { getActiveRental } from "@/lib/rentals";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const item = await getActiveRental(id);
  return {
    title: item ? `${item.product.name} Rental` : "Rental",
    description: item ? `${item.product.name} rental in Mumbai with daily pricing.` : "Medical rental equipment in Mumbai.",
  };
}

export default async function RentalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const item = await getActiveRental(id);
  if (!item) notFound();
  const media = item.product.images.map((url) => ({ type: "image" as const, url }));

  return (
    <SiteShell>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
        <div>
          <ProductMediaGallery media={media} productName={item.product.name} inStock={item.rental.availability} />
          <p className="mt-8 text-sm font-black uppercase tracking-[0.18em] text-[#047068]">{item.product.category}</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight text-slate-950">{item.product.name}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{item.product.description}</p>
          <ProductOptionGroups groups={item.product.options} />
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {item.product.features.map((feature) => (
              <li key={feature} className="rounded-md border border-[#047068]/15 bg-white p-4 font-semibold text-slate-700 shadow-sm">{feature}</li>
            ))}
          </ul>
        </div>
        <RentalCalculator product={item.product} rental={item.rental} />
      </section>
    </SiteShell>
  );
}
