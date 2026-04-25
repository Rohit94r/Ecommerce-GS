import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogBreadcrumbs } from "@/components/product/catalog/CatalogBreadcrumbs";
import { CommerceProductCard } from "@/components/product/catalog/CommerceProductCard";
import { SiteShell } from "@/components/layout/SiteShell";
import { getCategory } from "@/lib/catalog";
import { categories } from "@/lib/dummyData";

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = getCategory(categorySlug);

  return {
    title: category ? category.name : "Category",
    description: category?.description ?? "Browse medical product subcategories.",
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;
  const category = getCategory(categorySlug);
  if (!category) notFound();
  const availableProducts = category.subcategories.flatMap((subcategory) =>
    subcategory.products.map((product) => ({ product, subcategory })),
  );

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <CatalogBreadcrumbs crumbs={[{ label: "Products", href: "/products" }, { label: category.name }]} />
        <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#047068]">Available products</p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-slate-950 sm:text-5xl">{category.name}</h1>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">{category.description}</p>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-10">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#047068]">Shop now</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">All {category.name} products</h2>
            </div>
            <p className="max-w-md text-sm font-semibold leading-6 text-slate-600">
              Compare available products and add them directly to your cart.
            </p>
          </div>

          {availableProducts.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {availableProducts.map(({ product, subcategory }) => (
                <CommerceProductCard key={product.id} category={category} subcategory={subcategory} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-lg border border-dashed border-[#047068]/25 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-black text-slate-950">Products are being updated</h3>
              <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                This category is ready for backend inventory. Call or WhatsApp Gargi Surgical & Healthcare for current stock and delivery options.
              </p>
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
