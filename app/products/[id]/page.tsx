import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { SiteShell } from "@/components/layout/SiteShell";
import { ProductActions } from "@/components/product/ProductActions";
import { getProduct } from "@/lib/dummyData";
import { formatCurrency } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = getProduct(id);
  return {
    title: product ? product.name : "Product",
    description: product?.description ?? "Medical equipment Mumbai product details.",
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  return (
    <SiteShell>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="grid gap-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-slate-100 shadow-sm">
            <Image src={product.images[0]} alt={product.name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {product.images.map((image) => (
              <div key={image} className="relative aspect-[4/3] overflow-hidden rounded-md bg-slate-100">
                <Image src={image} alt={`${product.name} gallery image`} fill sizes="25vw" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <Badge tone={product.stock > 0 ? "green" : "red"}>{product.stock > 0 ? "In Stock" : "Out of Stock"}</Badge>
          <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-[#047068]">{product.category}</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight text-slate-950">{product.name}</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">{product.description}</p>
          <div className="mt-6 flex items-end gap-3">
            <span className="text-4xl font-black text-slate-950">{formatCurrency(product.price)}</span>
            {product.discount ? <Badge tone="amber">{product.discount}% discount highlight</Badge> : null}
          </div>
          <ul className="mt-8 grid gap-3">
            {product.features.map((feature) => (
              <li key={feature} className="rounded-md border border-[#047068]/15 bg-white p-4 font-semibold text-slate-700 shadow-sm">{feature}</li>
            ))}
          </ul>
          <ProductActions product={product} />
        </div>
      </section>
    </SiteShell>
  );
}
