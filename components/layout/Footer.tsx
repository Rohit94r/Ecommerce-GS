import Link from "next/link";
import { business, categories } from "@/lib/dummyData";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-black">{business.name}</h2>
          <p className="mt-3 max-w-md text-sm leading-7 text-slate-300">
            Trusted medical equipment, wheelchair on rent Mumbai services, oxygen cylinder Mumbai support and healthcare essentials for homes, clinics and hospitals.
          </p>
          <div className="relative mt-5 overflow-hidden rounded-md border border-white/10">
            <iframe title="Gargi Surgical & Healthcare map" src={business.mapsEmbed} className="h-52 w-full" loading="lazy" />
            <span className="absolute bottom-3 left-3 rounded-md bg-white px-3 py-2 text-xs font-black text-[#047068] shadow-sm">
              Open in Google Maps
            </span>
            <Link
              href={business.mapsUrl}
              target="_blank"
              className="absolute inset-0"
              aria-label="Open Gargi Surgical & Healthcare on Google Maps"
            />
          </div>
        </div>
        <div>
          <h3 className="font-bold">Services</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {categories.map((category) => (
              <li key={category.name}>
                <Link href={`/products/${category.slug}`} className="transition hover:text-white">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-bold">Contact</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>{business.address}</li>
            <li><Link href={`tel:${business.phone.replaceAll(" ", "")}`}>{business.phone}</Link></li>
            <li><Link href={`mailto:${business.email}`}>{business.email}</Link></li>
            <li>{business.hours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-slate-400">
        © 2026 Gargi Surgical & Healthcare. Same Day / Next Day Delivery Available.
      </div>
    </footer>
  );
}
