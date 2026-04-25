import { createClient } from "@/utils/supabase/server";
import type { Product, ProductCategory, Rental } from "@/types";

type RentalRow = {
  id: string;
  product_id: string | null;
  name: string;
  price_per_day: number | string;
  availability: boolean;
  description: string | null;
  image_url: string | null;
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
    product_images?: { image_url: string; sort_order: number | null }[];
};

const defaultImage = "/media/Home-banner2.png";

function mapRental(row: RentalRow): { product: Product; rental: Rental } {
  const productRow = Array.isArray(row.products) ? row.products[0] : row.products;
  const images = productRow?.product_images?.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map((image) => image.image_url) ?? [];

  const product: Product = {
    id: row.product_id ?? row.id,
    name: productRow?.name ?? row.name,
    price: productRow ? Number(productRow.price) : Number(row.price_per_day),
    category: (productRow?.category ?? "Hospital Equipment") as ProductCategory,
    images: images.length ? images : [row.image_url ?? defaultImage],
    stock: productRow?.stock ?? (row.availability ? 1 : 0),
    discount: productRow ? Number(productRow.discount) : 0,
    isRental: true,
    description: productRow?.description ?? row.description ?? "",
    features: productRow?.features ?? ["Daily rental pricing", "Availability managed from dashboard", "Call support available"],
    brand: productRow?.brand ?? "Gargi Care",
  };

  return {
    product,
    rental: {
      product_id: product.id,
      price_per_day: Number(row.price_per_day),
      availability: row.availability,
    },
  };
}

export async function getActiveRentals() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("rentals")
      .select("id, product_id, name, price_per_day, availability, description, image_url, products(id, name, category, price, discount, stock, description, brand, features, product_images(image_url, sort_order))")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return (data as unknown as RentalRow[]).map(mapRental);
  } catch {
    return [];
  }
}

export async function getActiveRental(id: string) {
  const rentals = await getActiveRentals();
  return rentals.find((item) => item.product.id === id || item.rental.product_id === id) ?? null;
}
