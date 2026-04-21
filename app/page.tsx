import Image from "next/image";
import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SiteShell } from "@/components/layout/SiteShell";
import { ProductGrid } from "@/components/product/ProductGrid";
import { business, categories, partnerBrands, products, testimonials } from "@/lib/dummyData";

export default function Home() {
  const featuredProducts = products.slice(0, 3);

  return (
    <SiteShell>
      <section className="medical-band">
        <div className="mx-auto grid min-h-[78vh] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#047068]">5.0 Google Rating | 50+ Customers</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Best Quality Healthcare Products in Mumbai
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Hospital equipment, mobility products, oxygen on rent, wellness and orthocare essentials delivered across Mumbai with calm, dependable support.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/products">Shop Now</LinkButton>
              <LinkButton href="/rentals" variant="secondary">Rent Equipment</LinkButton>
              <LinkButton href={`tel:${business.phone.replaceAll(" ", "")}`} variant="secondary">Call Now</LinkButton>
            </div>
            <div className="mt-8 grid gap-3 text-sm font-bold text-slate-700 sm:grid-cols-3">
              {["Same Day / Next Day Delivery Available", "Bulk order support", "Clean rental equipment"].map((item) => (
                <div key={item} className="rounded-lg border border-white/80 bg-white/70 p-3 shadow-sm">{item}</div>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-white shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1519494080410-f9aa8f52f1e2?auto=format&fit=crop&w=1200&q=85"
              alt="Hospital care equipment arranged for home recovery"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="Shop by healthcare need" description="Structured categories make this frontend ready for a Supabase catalog later." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((category) => (
              <Link key={category.name} href={`/products?category=${encodeURIComponent(category.name)}`} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <h3 className="font-black text-slate-950">{category.name}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Featured" title="Popular medical products" description="Fast-moving essentials for home care, clinics and hospital procurement." />
          <ProductGrid products={featuredProducts} />
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="Trusted by Mumbai families" description="Clear guidance, dependable delivery and clean equipment for critical moments." />
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article key={testimonial.id} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-amber-500" aria-label={`${testimonial.rating} star rating`}>★★★★★</p>
                <p className="mt-4 leading-7 text-slate-700">“{testimonial.quote}”</p>
                <p className="mt-5 font-black text-slate-950">{testimonial.name}</p>
                <p className="text-sm text-slate-500">{testimonial.area}, Mumbai</p>
              </article>
            ))}
          </div>
          <div className="mt-12 rounded-lg border border-slate-200 bg-slate-50 p-6">
            <p className="text-center text-sm font-black uppercase tracking-[0.2em] text-slate-500">Partner brands</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {partnerBrands.map((brand) => (
                <span key={brand} className="rounded-lg bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm">{brand}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
