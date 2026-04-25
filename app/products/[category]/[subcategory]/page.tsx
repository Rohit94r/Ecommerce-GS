import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogBreadcrumbs } from "@/components/product/CatalogBreadcrumbs";
import { CommerceProductCard } from "@/components/product/CommerceProductCard";
import { SiteShell } from "@/components/layout/SiteShell";
import { getSubcategory } from "@/lib/catalog";
import { categories } from "@/lib/dummyData";

export function generateStaticParams() {
  return categories.flatMap((category) =>
    category.subcategories.map((subcategory) => ({
      category: category.slug,
      subcategory: subcategory.slug,
    })),
  );
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; subcategory: string }> }): Promise<Metadata> {
  const { category, subcategory } = await params;
  const result = getSubcategory(category, subcategory);

  return {
    title: result ? result.subcategory.name : "Products",
    description: result ? `Shop ${result.subcategory.name} from Gargi Surgical & Healthcare.` : "Browse medical products.",
  };
}

export default async function SubcategoryPage({ params }: { params: Promise<{ category: string; subcategory: string }> }) {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;
  const result = getSubcategory(categorySlug, subcategorySlug);
  if (!result) notFound();

  const { category, subcategory } = result;

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <CatalogBreadcrumbs
          crumbs={[
            { label: "Products", href: "/products" },
            { label: category.name, href: `/products/${category.slug}` },
            { label: subcategory.name },
          ]}
        />
        <div className="mt-8 flex flex-col justify-between gap-5 border-b border-slate-200 pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#047068]">{category.name}</p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-slate-950 sm:text-5xl">{subcategory.name}</h1>
          </div>
          <div className="rounded-lg border border-[#047068]/15 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm">
            Same Day / Next Day Delivery Available
          </div>
        </div>

        {subcategory.products.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {subcategory.products.map((product) => (
              <CommerceProductCard key={product.id} category={category} subcategory={subcategory} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-lg border border-dashed border-[#047068]/25 bg-white p-10 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">Products are being updated</h2>
            <p className="mt-3 max-w-xl leading-7 text-slate-600">
              This subcategory is ready for inventory integration. Call the team for current stock, delivery timing and product options.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-[#047068] px-4 text-sm font-bold text-white shadow-sm shadow-[#047068]/20 transition duration-300 ease-out hover:scale-[1.03] hover:bg-[#035d57]"
            >
              Ask for availability
            </Link>
          </div>
        )}
      </section>
    </SiteShell>
  );
}
