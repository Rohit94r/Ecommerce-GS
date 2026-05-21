import Image from "next/image";
import Link from "next/link";
import { OutOfStockWatermark } from "@/components/product/catalog/OutOfStockWatermark";
import { getCommerceProductImages } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";
import type { CommerceCategory, CommerceProduct, CommerceSubcategory } from "@/types";

function CompactProductCard({
  category,
  subcategory,
  product,
}: {
  category: CommerceCategory;
  subcategory: CommerceSubcategory;
  product: CommerceProduct;
}) {
  const images = getCommerceProductImages(product);
  const discountedPrice = Math.round(product.price - (product.price * product.discount) / 100);

  return (
    <Link href={`/products/${category.slug}/${subcategory.slug}/${product.id}`} className="group block min-w-0">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm">
        <OutOfStockWatermark show={!product.stock} />
        <Image
          src={images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 46vw, (max-width: 1024px) 24vw, 190px"
          className="object-contain p-2 transition duration-300 ease-out group-hover:scale-[1.03]"
        />
        {!product.stock ? (
          <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2 py-1 text-[11px] font-black text-white">
            Out
          </span>
        ) : null}
      </div>
      <h3 className="mt-2 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-800 transition group-hover:text-[#047068]">
        {product.name}
      </h3>
      <div className="mt-1 flex flex-wrap items-baseline gap-2">
        <p className="text-sm font-bold text-slate-600">{formatCurrency(discountedPrice)}</p>
        {product.discount > 0 ? <p className="text-xs text-slate-400 line-through">{formatCurrency(product.price)}</p> : null}
      </div>
    </Link>
  );
}

export function CategorySubcategoryRows({ category }: { category: CommerceCategory }) {
  return (
    <div className="mt-10 space-y-12">
      {category.subcategories.map((subcategory) => (
        <section key={subcategory.slug} className="border-t border-slate-200 pt-8 first:border-t-0 first:pt-0">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-slate-800">{subcategory.name}</h2>
            {subcategory.products.length > 0 ? (
              <Link href={`/products/${category.slug}/${subcategory.slug}`} className="shrink-0 text-sm font-black text-[#047068]">
                View more
              </Link>
            ) : null}
          </div>

          {subcategory.products.length > 0 ? (
            <div className="mt-5 grid grid-flow-col auto-cols-[minmax(150px,46vw)] gap-3 overflow-x-auto pb-4 sm:auto-cols-[190px] md:auto-cols-[200px] lg:auto-cols-[210px]">
              {subcategory.products.map((product) => (
                <CompactProductCard key={product.id} category={category} subcategory={subcategory} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-[#047068]/25 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold leading-6 text-slate-600">
                Product photos, names and prices will appear here soon. Call us for current availability.
              </p>
              <Link href="/contact" className="mt-3 inline-flex text-sm font-black text-[#047068]">
                Ask for availability
              </Link>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
