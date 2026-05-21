import { categories as defaultCategories } from "@/lib/dummyData";
import { isVideoMediaUrl } from "@/lib/catalog";
import { isDataUrl, productMediaRoute } from "@/lib/media";
import { slugify } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";
import type { CommerceCategory, CommerceProduct, CommerceSubcategory, ProductMedia } from "@/types";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  subcategories?: SubcategoryRow[] | null;
};

type SubcategoryRow = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number | null;
  is_active: boolean | null;
};

type ProductImageRow = {
  image_url: string;
  sort_order: number | null;
  media_type?: string | null;
};

type ProductRow = {
  id: string;
  subcategory_id: string | null;
  name: string;
  category: string;
  price: number | string;
  discount: number | string;
  stock: number;
  description: string | null;
  brand: string | null;
  features: string[] | null;
  is_active: boolean | null;
  product_images?: ProductImageRow[] | null;
};

const defaultProductImage = "/media/Home-banner2.png";

function cloneDefaultCategories(): CommerceCategory[] {
  return defaultCategories.map((category) => ({
    ...category,
    subcategories: category.subcategories.map((subcategory) => ({
      ...subcategory,
      products: [],
    })),
  }));
}

function mapProduct(row: ProductRow): CommerceProduct {
  const media = toProductMedia(row.product_images ?? [], row.id);
  const images = media.filter((item) => item.type === "image").map((item) => item.url);
  const videos = media.filter((item) => item.type === "video").map((item) => item.url);

  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    discount: Number(row.discount),
    stock: row.stock > 0,
    image: images[0] ?? defaultProductImage,
    images: images.length ? images : [defaultProductImage],
    videos,
    media: media.length ? media : [{ type: "image", url: defaultProductImage }],
    description: row.description ?? "",
    features: row.features ?? [],
    brand: row.brand ?? "Gargi Care",
  };
}

function findOrCreateSubcategory(category: CommerceCategory, name: string, slug = slugify(name)) {
  let subcategory = category.subcategories.find((item) => item.slug === slug);

  if (!subcategory) {
    subcategory = { name, slug, products: [] };
    category.subcategories.push(subcategory);
  }

  return subcategory;
}

export async function getCatalogCategories(): Promise<CommerceCategory[]> {
  const catalog = cloneDefaultCategories();
  const categoryBySlug = new Map(catalog.map((category) => [category.slug, category]));
  const subcategoryById = new Map<string, { category: CommerceCategory; subcategory: CommerceSubcategory }>();

  try {
    const supabase = await createClient();
    const [categoriesResult, productsResult] = await Promise.all([
      supabase
        .from("categories")
        .select("id, name, slug, description, image_url, sort_order, is_active, subcategories(id, category_id, name, slug, description, sort_order, is_active)")
        .eq("is_active", true),
      supabase
        .from("products")
        .select("id, subcategory_id, name, category, price, discount, stock, description, brand, features, is_active, product_images(*)")
        .eq("is_active", true),
    ]);

    if (categoriesResult.error || productsResult.error) return catalog;

    const categoryRows = ((categoriesResult.data ?? []) as CategoryRow[]).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    categoryRows.forEach((row) => {
      let category = categoryBySlug.get(row.slug);

      if (!category) {
        category = {
          name: row.name,
          slug: row.slug,
          description: row.description ?? "",
          image: row.image_url ?? defaultProductImage,
          subcategories: [],
        };
        catalog.push(category);
        categoryBySlug.set(category.slug, category);
      } else {
        category.name = row.name;
        category.description = row.description || category.description;
        category.image = row.image_url || category.image;
      }

      const subcategoryRows = (row.subcategories ?? [])
        .filter((subcategory) => subcategory.is_active !== false)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

      subcategoryRows.forEach((subcategoryRow) => {
        const subcategory = findOrCreateSubcategory(category, subcategoryRow.name, subcategoryRow.slug);
        subcategoryById.set(subcategoryRow.id, { category, subcategory });
      });
    });

    ((productsResult.data ?? []) as ProductRow[]).forEach((row) => {
      if (row.is_active === false) return;

      const product = mapProduct(row);
      const assigned = row.subcategory_id ? subcategoryById.get(row.subcategory_id) : null;

      if (assigned) {
        assigned.subcategory.products.push(product);
        return;
      }

      const category = categoryBySlug.get(slugify(row.category)) ?? categoryBySlug.get("mobility") ?? catalog[0];
      findOrCreateSubcategory(category, "Other Products", "other-products").products.push(product);
    });

    return catalog;
  } catch {
    return catalog;
  }
}

export async function getCatalogCategory(slug: string) {
  const categories = await getCatalogCategories();
  return categories.find((category) => category.slug === slug);
}

export async function getCatalogSubcategory(categorySlug: string, subcategorySlug: string) {
  const category = await getCatalogCategory(categorySlug);
  const subcategory = category?.subcategories.find((item) => item.slug === subcategorySlug);
  return category && subcategory ? { category, subcategory } : null;
}

export async function getCatalogProduct(categorySlug: string, subcategorySlug: string, id: string) {
  const result = await getCatalogSubcategory(categorySlug, subcategorySlug);
  const product = result?.subcategory.products.find((item) => item.id === id);
  return result && product ? { ...result, product } : null;
}

function toProductMedia(rows: ProductImageRow[], productId: string): ProductMedia[] {
  return rows
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((row, index) => ({
      type: isVideoMediaUrl(row.image_url, row.media_type) ? ("video" as const) : ("image" as const),
      url: isDataUrl(row.image_url) ? productMediaRoute(productId, index) : row.image_url,
    }))
    .sort((a, b) => Number(a.type === "video") - Number(b.type === "video"));
}
