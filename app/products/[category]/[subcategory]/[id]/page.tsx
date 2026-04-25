import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { CatalogBreadcrumbs } from "@/components/product/CatalogBreadcrumbs";
import { CommerceProductActions } from "@/components/product/CommerceProductActions";
import { SiteShell } from "@/components/layout/SiteShell";
import { getCommerceProduct, getCommerceProductDescription, getCommerceProductFeatures, getCommerceProductImages } from "@/lib/catalog";
import { categories } from "@/lib/dummyData";
import { formatCurrency } from "@/lib/utils";

export function generateStaticParams() {
  return categories.flatMap((category) =>
    category.subcategories.flatMap((subcategory) =>
      subcategory.products.map((product) => ({
        category: category.slug,
        subcategory: subcategory.slug,
        id: product.id,
      })),
    ),
  );
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; subcategory: string; id: string }> }): Promise<Metadata> {
  const { category, subcategory, id } = await params;
  const result = getCommerceProduct(category, subcategory, id);

  return {
    title: result ? result.product.name : "Product",
    description: result ? getCommerceProductDescription(result.product) : "Medical product details.",
  };
}

export default async function CommerceProductDetailPage({ params }: { params: Promise<{ category: string; subcategory: string; id: string }> }) {
  const { category: categorySlug, subcategory: subcategorySlug, id } = await params;
  const result = getCommerceProduct(categorySlug, subcategorySlug, id);
  if (!result) notFound();

  const { category, subcategory, product } = result;
  const discountedPrice = Math.round(product.price - (product.price * product.discount) / 100);
  const images = getCommerceProductImages(product);

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

        <div className="mt-9 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="grid gap-4">
            <div className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100 shadow-sm">
              <Image
                src={images[0]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 52vw"
                className="object-cover transition duration-500 ease-out group-hover:scale-105"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {images.map((image, index) => (
                <div key={image} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
                  <Image src={image} alt={`${product.name} gallery ${index + 1}`} fill sizes="25vw" className="object-cover transition duration-500 ease-out hover:scale-105" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/5">
            <div className="flex flex-wrap gap-2">
              <Badge tone={product.stock ? "green" : "red"}>{product.stock ? "In Stock" : "Out of Stock"}</Badge>
              {product.discount > 0 ? <Badge tone="amber">{product.discount}% OFF</Badge> : null}
              <Badge tone="slate">{subcategory.name}</Badge>
            </div>
            <h1 className="mt-5 text-4xl font-black leading-tight text-slate-950">{product.name}</h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">{getCommerceProductDescription(product)}</p>

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

            <CommerceProductActions category={category} subcategory={subcategory} product={product} />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
