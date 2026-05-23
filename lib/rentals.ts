import { unstable_cache } from "next/cache";
import { isDataUrl, productMediaRoute, rentalMediaRoute } from "@/lib/media";
import { cleanProductFeatures, getProductOptions } from "@/lib/productOptions";
import type { Product, ProductCategory, Rental } from "@/types";
import { createPublicClient } from "@/utils/supabase/public";

type RentalRow = {
  id: string;
  product_id: string | null;
  name: string;
  category?: string | null;
  price_per_day: number | string;
  price_per_week?: number | string | null;
  price_per_month?: number | string | null;
  availability: boolean;
  description: string | null;
  image_url: string | null;
  rental_images?: { image_url: string; sort_order: number | null }[] | null;
  products?: ProductJoin | ProductJoin[] | null;
};

type ProductJoin = {
    id: string;
    name: string;
    category: string;
    price: number | string;
    discount: number | string;
    stock: number;
    description: string | null;
    brand: string | null;
    features: string[] | null;
    product_options?: unknown;
    product_images?: { image_url?: string | null; sort_order: number | null; media_type?: string | null }[];
};

const defaultImage = "/media/Home-banner2.png";
const rentalsCache = {
  revalidate: 30,
  tags: ["rentals", "catalog"],
};

function mapRental(row: RentalRow): { product: Product; rental: Rental } {
  const productRow = Array.isArray(row.products) ? row.products[0] : row.products;
  const productImages = productRow?.product_images
    ?.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .flatMap((image, index) => (
      image.media_type === "video"
        ? []
        : [image.image_url && !isDataUrl(image.image_url) ? image.image_url : productMediaRoute(productRow.id, index)]
    )) ?? [];
  const rentalImages = (row.rental_images ?? [])
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((image, index) => (isDataUrl(image.image_url) ? rentalMediaRoute(row.id, index) : image.image_url))
    .filter(Boolean);
  const images = rentalImages.length ? rentalImages : productImages;
  const fallbackFeatures = ["Daily rental pricing", "Availability managed from dashboard", "Call support available"];
  const productFeatures = cleanProductFeatures(productRow?.features);

  const product: Product = {
    id: row.product_id ?? row.id,
    name: productRow?.name ?? row.name,
    price: productRow ? Number(productRow.price) : Number(row.price_per_day),
    category: (productRow?.category ?? row.category ?? "Mobility") as ProductCategory,
    images: images.length ? images : [row.image_url && isDataUrl(row.image_url) ? rentalMediaRoute(row.id, 0) : row.image_url ?? defaultImage],
    stock: productRow?.stock ?? (row.availability ? 1 : 0),
    discount: productRow ? Number(productRow.discount) : 0,
    isRental: true,
    description: productRow?.description ?? row.description ?? "",
    features: productFeatures.length ? productFeatures : fallbackFeatures,
    brand: productRow?.brand ?? "Gargi Care",
    options: getProductOptions(productRow?.product_options, productRow?.features),
  };

  return {
    product,
    rental: {
      id: row.id,
      product_id: product.id,
      price_per_day: Number(row.price_per_day),
      price_per_week: row.price_per_week ? Number(row.price_per_week) : undefined,
      price_per_month: row.price_per_month ? Number(row.price_per_month) : undefined,
      availability: row.availability,
      category: (productRow?.category ?? row.category ?? "Mobility") as ProductCategory,
    },
  };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function fetchActiveRentals() {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("rentals")
      .select("*, rental_images(image_url, sort_order), products(*, product_images(sort_order, media_type))")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      const fallback = await supabase
        .from("rentals")
        .select("*, products(*, product_images(sort_order, media_type))")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (fallback.error || !fallback.data) return [];
      return (fallback.data as unknown as RentalRow[]).map(mapRental);
    }

    if (!data) return [];
    return (data as unknown as RentalRow[]).map(mapRental);
  } catch {
    return [];
  }
}

async function fetchActiveRental(id: string) {
  if (!isUuid(id)) return null;

  try {
    const supabase = createPublicClient();
    const result = await supabase
      .from("rentals")
      .select("*, rental_images(image_url, sort_order), products(*, product_images(sort_order, media_type))")
      .eq("is_active", true)
      .or(`id.eq.${id},product_id.eq.${id}`)
      .limit(1)
      .maybeSingle();

    if (!result.error && result.data) return mapRental(result.data as unknown as RentalRow);

    const fallback = await supabase
      .from("rentals")
      .select("*, products(*, product_images(sort_order, media_type))")
      .eq("is_active", true)
      .or(`id.eq.${id},product_id.eq.${id}`)
      .limit(1)
      .maybeSingle();

    if (fallback.error || !fallback.data) return null;
    return mapRental(fallback.data as unknown as RentalRow);
  } catch {
    return null;
  }
}

export const getActiveRentals = unstable_cache(fetchActiveRentals, ["active-rentals"], rentalsCache);
export async function getActiveRental(id: string) {
  return fetchActiveRental(id);
}
