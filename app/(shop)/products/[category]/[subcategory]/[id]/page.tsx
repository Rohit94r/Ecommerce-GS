import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Badge } from "@/components/ui/Badge";
import { CatalogBreadcrumbs } from "@/components/product/catalog/CatalogBreadcrumbs";
import { CommerceProductActions } from "@/components/product/catalog/CommerceProductActions";
import { ProductMediaGallery } from "@/components/product/catalog/ProductMediaGallery";
import { SiteShell } from "@/components/layout/SiteShell";
import { getCommerceProductDescription, getCommerceProductFeatures, getCommerceProductMedia, toCartProduct } from "@/lib/catalog";
import { getCatalogProduct } from "@/lib/catalog/data";
import { formatCurrency } from "@/lib/utils";

export function generateStaticParams(): { category: string; subcategory: string; id: string }[] {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; subcategory: string; id: string }> }): Promise<Metadata> {
  const { category, subcategory, id } = await params;
  const result = await getCatalogProduct(category, subcategory, id);

  return {
    title: result ? result.product.name : "Product",
    description: result ? getCommerceProductDescription(result.product) : "Medical product details.",
  };
}

export default async function CommerceProductDetailPage({ params }: { params: Promise<{ category: string; subcategory: string; id: string }> }) {
  await connection();
  const { category: categorySlug, subcategory: subcategorySlug, id } = await params;
  const result = await getCatalogProduct(categorySlug, subcategorySlug, id);
  if (!result) notFound();

  const { category, subcategory, product } = result;
  const discountedPrice = Math.round(product.price - (product.price * product.discount) / 100);
  const media = getCommerceProductMedia(product);
  const cartProduct = toCartProduct(product, category, subcategory);

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <CatalogBreadcrumbs
          crumbs={[
            { label: "Products", href: "/products" },
            { label: category.name, href: `/products/${category.slug}` },
            { label: subcategory.name, href: `/products/${category.slug}/${subcategory.slug}` },
            { label: product.name },
          ]}
        />

        <div className="mt-9 grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <ProductMediaGallery media={media} productName={product.name} />

          <div className="rounded-lg border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/5 lg:sticky lg:top-28">
            <div className="flex flex-wrap gap-2">
              <Badge tone={product.stock ? "green" : "red"}>{product.stock ? "In Stock" : "Out of Stock"}</Badge>
              {product.discount > 0 ? <Badge tone="amber">{product.discount}% OFF</Badge> : null}
              <Badge tone="slate">{subcategory.name}</Badge>
            </div>
            <h1 className="mt-5 text-4xl font-black leading-tight text-slate-950">{product.name}</h1>
            <p className="mt-4 whitespace-pre-line text-lg leading-8 text-slate-600">{getCommerceProductDescription(product)}</p>

            <div className="mt-6 flex flex-wrap items-end gap-3">
              <span className="text-4xl font-black text-slate-950">{formatCurrency(discountedPrice)}</span>
              {product.discount > 0 ? <span className="text-lg font-semibold text-slate-400 line-through">{formatCurrency(product.price)}</span> : null}
            </div>

            <div className="mt-7 rounded-lg bg-[#047068]/10 px-4 py-3 text-sm font-black text-[#047068]">
              Same Day / Next Day Delivery Available
            </div>

            <ul className="mt-7 grid gap-3">
              {getCommerceProductFeatures(product).map((feature) => (
                <li key={feature} className="rounded-lg border border-[#047068]/15 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700">
                  {feature}
                </li>
              ))}
            </ul>

            <CommerceProductActions cartProduct={cartProduct} inStock={product.stock} />
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">Product information</h2>
            <p className="mt-4 whitespace-pre-line leading-8 text-slate-600">{getCommerceProductDescription(product)}</p>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-4">
                <dt className="text-sm font-black text-slate-500">Brand</dt>
                <dd className="mt-1 font-bold text-slate-950">{product.brand || "Gargi Care"}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <dt className="text-sm font-black text-slate-500">Category</dt>
                <dd className="mt-1 font-bold text-slate-950">{category.name} / {subcategory.name}</dd>
              </div>
            </dl>
          </section>
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">Delivery support</h2>
            <ul className="mt-4 grid gap-3 text-sm font-semibold leading-6 text-slate-600">
              <li>Same Day / Next Day Delivery Available</li>
              <li>Availability confirmed before dispatch</li>
              <li>Phone support for product guidance</li>
            </ul>
          </section>
        </div>
      </section>
    </SiteShell>
  );
}
