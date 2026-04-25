import Link from "next/link";
import { HeroBanner } from "@/components/home/HeroBanner";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SiteShell } from "@/components/layout/SiteShell";
import { ProductGrid } from "@/components/product/ProductGrid";
import { categories, partnerBrands, products, testimonials } from "@/lib/dummyData";

export default function Home() {
  const featuredProducts = products.slice(0, 3);

  return (
    <SiteShell>
      <HeroBanner />

      <section className="border-y border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 text-sm font-bold text-slate-700 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            ["Delivery", "Same Day / Next Day"],
            ["Support", "Home and Hospital"],
            ["Quality", "Checked Equipment"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#047068]/10 text-xs font-black text-[#047068]">
                {label.slice(0, 1)}
              </span>
              <span>
                <span className="block text-xs uppercase tracking-[0.14em] text-slate-400">{label}</span>
                <span className="block text-slate-800">{value}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="section-separator bg-white px-4 py-[4.5rem] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="Shop by healthcare need" description="Find the right support faster, whether you are setting up recovery at home or buying for a clinic." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((category) => (
              <Link key={category.name} href={`/products/${category.slug}`} className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/5 transition duration-300 ease-out hover:-translate-y-1 hover:border-[#047068]/25 hover:shadow-xl hover:shadow-[#047068]/10">
                <h3 className="text-[15px] font-black text-slate-950">{category.name}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Featured" title="Often requested in Mumbai" description="Practical essentials families and care teams ask for when comfort, safety and timing matter." />
          <ProductGrid products={featuredProducts} />
        </div>
      </section>

      <section className="section-separator bg-white px-4 py-[4.5rem] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="Trusted by Mumbai families" description="A little patience, clear guidance and dependable equipment can make a difficult week easier." />
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article key={testimonial.id} className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/5 transition duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-[#047068]/10">
                <p className="text-amber-500" aria-label={`${testimonial.rating} star rating`}>★★★★★</p>
                <p className="mt-4 leading-7 text-slate-700">“{testimonial.quote}”</p>
                <p className="mt-5 font-black text-slate-950">{testimonial.name}</p>
                <p className="text-sm text-slate-500">{testimonial.area}, Mumbai</p>
              </article>
            ))}
          </div>
          <div className="mt-14 rounded-2xl border border-slate-200 bg-slate-50/80 p-6 shadow-inner shadow-white">
            <p className="text-center text-sm font-black uppercase tracking-[0.18em] text-slate-500">Partner brands</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {partnerBrands.map((brand) => (
                <span key={brand} className="rounded-lg bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm shadow-slate-900/5">{brand}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
