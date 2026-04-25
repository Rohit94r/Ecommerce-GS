import { createClient } from "@/utils/supabase/server";
import type { Product, ProductCategory } from "@/types";

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
  product_images?: { image_url: string; sort_order: number | null }[];
};

const defaultImage = "/media/Home-banner2.png";

function toProduct(row: HomeProductRow): Product {
  const images = row.product_images?.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map((image) => image.image_url) ?? [];

  return {
    id: row.id,
    name: row.name,
    category: row.category as ProductCategory,
    price: Number(row.price),
    discount: Number(row.discount),
    stock: row.stock,
    images: images.length ? images : [defaultImage],
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
      .select("id, name, category, price, discount, stock, description, brand, features, is_rental, is_featured, show_on_homepage, is_special_offer, product_images(image_url, sort_order)")
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
