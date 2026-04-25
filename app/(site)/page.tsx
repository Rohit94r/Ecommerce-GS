import { CategoryCarousel } from "@/components/home/CategoryCarousel";
import { HeroBanner } from "@/components/home/HeroBanner";
import { HomeProductScroller } from "@/components/home/HomeProductScroller";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SiteShell } from "@/components/layout/SiteShell";
import { getFeaturedGoogleReviews } from "@/lib/googleReviews";
import { getHomepageProducts } from "@/lib/homeProducts";
import { categories, partnerBrands } from "@/lib/dummyData";

export default async function Home() {
  const homepageProducts = await getHomepageProducts();
  const googleReviews = await getFeaturedGoogleReviews();
  const scrollingReviews = googleReviews.length > 3 ? [...googleReviews, ...googleReviews] : googleReviews;

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
          <SectionHeader eyebrow="Product Categories" title="Shop by healthcare need" description="Find the right support faster, whether you are setting up recovery at home or buying for a clinic." />
          <CategoryCarousel categories={categories} />
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Homepage Products" title="Quick picks for everyday care" description="Compact product highlights controlled from the admin dashboard." />
          <HomeProductScroller products={homepageProducts} />
        </div>
      </section>

      <section className="section-separator bg-white px-4 py-[4.5rem] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="Google reviews from customers" description="Recent feedback from families and care teams who bought or rented medical equipment." />
          <div className="overflow-hidden">
            {scrollingReviews.length ? (
              <div className={`flex gap-5 ${googleReviews.length > 3 ? "review-marquee-track w-max" : "snap-x overflow-x-auto pb-3"}`}>
                {scrollingReviews.map((review, index) => (
                  <article key={`${review.id}-${index}`} className="min-h-[230px] w-[82vw] shrink-0 snap-start rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/5 transition duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-[#047068]/10 sm:w-[360px]">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-amber-500" aria-label={`${review.rating} star rating`}>{"★".repeat(Math.round(review.rating))}</p>
                      <span className="rounded-full bg-[#047068]/10 px-3 py-1 text-xs font-black text-[#047068]">{review.source}</span>
                    </div>
                    <p className="mt-4 line-clamp-4 leading-7 text-slate-700">“{review.review}”</p>
                    <p className="mt-5 font-black text-slate-950">{review.reviewer_name}</p>
                    <p className="text-sm text-slate-500">{review.area}, Mumbai</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="min-h-[210px] rounded-xl border border-dashed border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
                    <p className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Google Review</p>
                    <p className="mt-5 text-sm leading-7 text-slate-500">Reviews added from the dashboard will appear here.</p>
                  </div>
                ))}
              </div>
            )}
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
