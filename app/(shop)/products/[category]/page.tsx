import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CatalogBreadcrumbs } from "@/components/product/catalog/CatalogBreadcrumbs";
import { CategorySubcategoryRows } from "@/components/product/catalog/CategorySubcategoryRows";
import { SiteShell } from "@/components/layout/SiteShell";
import { getCatalogCategory } from "@/lib/catalog/data";
import { categories } from "@/lib/dummyData";

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = categories.find((item) => item.slug === categorySlug);

  return {
    title: category ? category.name : "Category",
    description: category?.description ?? "Browse medical product subcategories.",
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  await connection();
  const { category: categorySlug } = await params;
  const category = await getCatalogCategory(categorySlug);
  if (!category) notFound();

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
          <CategorySubcategoryRows category={category} />
        </div>
      </section>
    </SiteShell>
  );
}
