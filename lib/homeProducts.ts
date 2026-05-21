import { createClient } from "@/utils/supabase/server";
import { isVideoMediaUrl } from "@/lib/catalog";
import { isDataUrl, productMediaRoute } from "@/lib/media";
import type { Product, ProductCategory, ProductMedia } from "@/types";

type HomeProductRow = {
  id: string;
  name: string;
  category: string;
  price: number | string;
  discount: number | string;
  stock: number;
  description: string | null;
  brand: string | null;
  features: string[] | null;
  is_rental: boolean | null;
  is_featured: boolean | null;
  show_on_homepage: boolean | null;
  is_special_offer: boolean | null;
  subcategory_id: string | null;
  subcategories?: {
    slug: string;
    categories?: { slug: string } | { slug: string }[] | null;
  } | {
    slug: string;
    categories?: { slug: string } | { slug: string }[] | null;
  }[] | null;
  product_images?: { image_url: string; sort_order: number | null; media_type?: string | null }[];
};

const defaultImage = "/media/Home-banner2.png";

function toProduct(row: HomeProductRow): Product {
  const media = toProductMedia(row.product_images ?? [], row.id);
  const images = media.filter((item) => item.type === "image").map((item) => item.url);
  const videos = media.filter((item) => item.type === "video").map((item) => item.url);
  const subcategory = Array.isArray(row.subcategories) ? row.subcategories[0] : row.subcategories;
  const category = Array.isArray(subcategory?.categories) ? subcategory?.categories[0] : subcategory?.categories;
  const detailHref = category?.slug && subcategory?.slug ? `/products/${category.slug}/${subcategory.slug}/${row.id}` : "/products";

  return {
    id: row.id,
    name: row.name,
    category: row.category as ProductCategory,
    price: Number(row.price),
    discount: Number(row.discount),
    stock: row.stock,
    images: images.length ? images : [defaultImage],
    videos,
    media: media.length ? media : [{ type: "image", url: defaultImage }],
    detailHref,
    description: row.description ?? "",
    features: row.features ?? [],
    brand: row.brand ?? "Gargi Care",
    isRental: Boolean(row.is_rental),
    featured: Boolean(row.is_featured),
    showOnHomepage: Boolean(row.show_on_homepage),
    specialOffer: Boolean(row.is_special_offer),
  };
}

export async function getHomepageProducts() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, subcategory_id, name, category, price, discount, stock, description, brand, features, is_rental, is_featured, show_on_homepage, is_special_offer, subcategories(slug, categories(slug)), product_images(*)")
      .eq("is_active", true)
      .eq("show_on_homepage", true)
      .order("is_special_offer", { ascending: false })
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(24);

    if (error || !data?.length) return [];

    return (data as HomeProductRow[]).map(toProduct);
  } catch {
    return [];
  }
}

function toProductMedia(rows: NonNullable<HomeProductRow["product_images"]>, productId: string): ProductMedia[] {
  return rows
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((row, index) => ({
      type: isVideoMediaUrl(row.image_url, row.media_type) ? ("video" as const) : ("image" as const),
      url: isDataUrl(row.image_url) ? productMediaRoute(productId, index) : row.image_url,
    }))
    .sort((a, b) => Number(a.type === "video") - Number(b.type === "video"));
}
