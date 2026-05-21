import { unstable_cache } from "next/cache";
import { categories as defaultCategories } from "@/lib/dummyData";
import { isVideoMediaUrl } from "@/lib/catalog";
import { isDataUrl, productMediaRoute } from "@/lib/media";
import { slugify } from "@/lib/utils";
import { createPublicClient } from "@/utils/supabase/public";
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
  image_url?: string | null;
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
const catalogCache = {
  revalidate: 30,
  tags: ["catalog"],
};

function cloneDefaultCategories(): CommerceCategory[] {
  return defaultCategories.map((category) => ({
    ...category,
    subcategories: category.subcategories.map((subcategory) => ({
      ...subcategory,
      products: [],
    })),
  }));
}

function getDefaultCategory(slug: string) {
  return cloneDefaultCategories().find((category) => category.slug === slug) ?? null;
}

function mergeCategoryRow(row: CategoryRow, fallback?: CommerceCategory | null): CommerceCategory {
  const category: CommerceCategory = fallback
    ? {
        ...fallback,
        subcategories: fallback.subcategories.map((subcategory) => ({ ...subcategory, products: [] })),
      }
    : {
        name: row.name,
        slug: row.slug,
        description: row.description ?? "",
        image: row.image_url ?? defaultProductImage,
        subcategories: [],
      };

  category.name = row.name;
  category.description = row.description || category.description;
  category.image = row.image_url || category.image;

  const subcategoryRows = (row.subcategories ?? [])
    .filter((subcategory) => subcategory.is_active !== false)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  subcategoryRows.forEach((subcategoryRow) => {
    findOrCreateSubcategory(category, subcategoryRow.name, subcategoryRow.slug);
  });

  return category;
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

async function fetchCatalogCategories(): Promise<CommerceCategory[]> {
  const catalog = cloneDefaultCategories();
  const categoryBySlug = new Map(catalog.map((category) => [category.slug, category]));
  const subcategoryById = new Map<string, { category: CommerceCategory; subcategory: CommerceSubcategory }>();

  try {
    const supabase = createPublicClient();
    const [categoriesResult, productsResult] = await Promise.all([
      supabase
        .from("categories")
        .select("id, name, slug, description, image_url, sort_order, is_active, subcategories(id, category_id, name, slug, description, sort_order, is_active)")
        .eq("is_active", true),
      supabase
        .from("products")
        .select("id, subcategory_id, name, category, price, discount, stock, description, brand, features, is_active, product_images(sort_order, media_type)")
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

async function fetchCatalogCategory(slug: string) {
  const fallback = getDefaultCategory(slug);

  try {
    const supabase = createPublicClient();
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("id, name, slug, description, image_url, sort_order, is_active, subcategories(id, category_id, name, slug, description, sort_order, is_active)")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (categoryError) return fallback;
    if (!categoryData) return fallback;

    const row = categoryData as CategoryRow;
    const category = mergeCategoryRow(row, fallback);
    const subcategoryRows = (row.subcategories ?? []).filter((subcategory) => subcategory.is_active !== false);
    const subcategoryById = new Map<string, CommerceSubcategory>();

    subcategoryRows.forEach((subcategoryRow) => {
      const subcategory = findOrCreateSubcategory(category, subcategoryRow.name, subcategoryRow.slug);
      subcategoryById.set(subcategoryRow.id, subcategory);
    });

    const subcategoryIds = subcategoryRows.map((subcategory) => subcategory.id);
    const productQueries = [];

    if (subcategoryIds.length) {
      productQueries.push(
        supabase
          .from("products")
          .select("id, subcategory_id, name, category, price, discount, stock, description, brand, features, is_active, product_images(sort_order, media_type)")
          .eq("is_active", true)
          .in("subcategory_id", subcategoryIds),
      );
    }

    productQueries.push(
      supabase
        .from("products")
        .select("id, subcategory_id, name, category, price, discount, stock, description, brand, features, is_active, product_images(sort_order, media_type)")
        .eq("is_active", true)
        .is("subcategory_id", null)
        .eq("category", category.name),
    );

    const productsResults = await Promise.all(productQueries);

    productsResults.forEach((productsResult) => {
      if (productsResult.error) return;

      ((productsResult.data ?? []) as ProductRow[]).forEach((productRow) => {
        if (productRow.is_active === false) return;

        const product = mapProduct(productRow);
        const subcategory = productRow.subcategory_id ? subcategoryById.get(productRow.subcategory_id) : null;

        if (subcategory) {
          subcategory.products.push(product);
          return;
        }

        findOrCreateSubcategory(category, "Other Products", "other-products").products.push(product);
      });
    });

    return category;
  } catch {
    return fallback;
  }
}

async function fetchCatalogSubcategory(categorySlug: string, subcategorySlug: string) {
  const fallbackCategory = getDefaultCategory(categorySlug);

  try {
    const supabase = createPublicClient();
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("id, name, slug, description, image_url, sort_order, is_active, subcategories(id, category_id, name, slug, description, sort_order, is_active)")
      .eq("slug", categorySlug)
      .eq("is_active", true)
      .maybeSingle();

    if (categoryError) {
      const fallbackSubcategory = fallbackCategory?.subcategories.find((item) => item.slug === subcategorySlug);
      return fallbackCategory && fallbackSubcategory ? { category: fallbackCategory, subcategory: fallbackSubcategory } : null;
    }

    if (!categoryData) {
      const fallbackSubcategory = fallbackCategory?.subcategories.find((item) => item.slug === subcategorySlug);
      return fallbackCategory && fallbackSubcategory ? { category: fallbackCategory, subcategory: fallbackSubcategory } : null;
    }

    const categoryRow = categoryData as CategoryRow;
    const category = mergeCategoryRow(categoryRow, fallbackCategory);
    const subcategoryRow = (categoryRow.subcategories ?? []).find((item) => item.slug === subcategorySlug && item.is_active !== false);
    if (!subcategoryRow) return null;

    const subcategory = findOrCreateSubcategory(category, subcategoryRow.name, subcategoryRow.slug);
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("id, subcategory_id, name, category, price, discount, stock, description, brand, features, is_active, product_images(sort_order, media_type)")
      .eq("is_active", true)
      .eq("subcategory_id", subcategoryRow.id);

    if (!productsError) {
      subcategory.products = ((productsData ?? []) as ProductRow[])
        .filter((row) => row.is_active !== false)
        .map(mapProduct);
    }

    return { category, subcategory };
  } catch {
    const fallbackSubcategory = fallbackCategory?.subcategories.find((item) => item.slug === subcategorySlug);
    return fallbackCategory && fallbackSubcategory ? { category: fallbackCategory, subcategory: fallbackSubcategory } : null;
  }
}

async function fetchCatalogProduct(categorySlug: string, subcategorySlug: string, id: string) {
  try {
    const supabase = createPublicClient();
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("id, name, slug, description, image_url, sort_order, is_active")
      .eq("slug", categorySlug)
      .eq("is_active", true)
      .maybeSingle();

    if (categoryError || !categoryData) return null;

    const categoryRow = categoryData as CategoryRow;
    const { data: subcategoryData, error: subcategoryError } = await supabase
      .from("subcategories")
      .select("id, category_id, name, slug, description, sort_order, is_active")
      .eq("category_id", categoryRow.id)
      .eq("slug", subcategorySlug)
      .eq("is_active", true)
      .maybeSingle();

    if (subcategoryError || !subcategoryData) return null;

    const subcategoryRow = subcategoryData as SubcategoryRow;
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("id, subcategory_id, name, category, price, discount, stock, description, brand, features, is_active, product_images(sort_order, media_type)")
      .eq("id", id)
      .eq("subcategory_id", subcategoryRow.id)
      .eq("is_active", true)
      .maybeSingle();

    if (productError || !productData) return null;

    const fallbackCategory = getDefaultCategory(categorySlug);
    const category: CommerceCategory = {
      name: categoryRow.name,
      slug: categoryRow.slug,
      description: categoryRow.description ?? fallbackCategory?.description ?? "",
      image: categoryRow.image_url ?? fallbackCategory?.image ?? defaultProductImage,
      subcategories: [],
    };
    const subcategory: CommerceSubcategory = {
      name: subcategoryRow.name,
      slug: subcategoryRow.slug,
      products: [],
    };
    const product = mapProduct(productData as ProductRow);

    subcategory.products.push(product);
    category.subcategories.push(subcategory);

    return { category, subcategory, product };
  } catch {
    return null;
  }
}

function toProductMedia(rows: ProductImageRow[], productId: string): ProductMedia[] {
  return rows
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((row, index) => ({
      type: isVideoMediaUrl(row.image_url, row.media_type) ? ("video" as const) : ("image" as const),
      url: row.image_url && !isDataUrl(row.image_url) ? row.image_url : productMediaRoute(productId, index),
    }))
    .sort((a, b) => Number(a.type === "video") - Number(b.type === "video"));
}

export const getCatalogCategories = unstable_cache(fetchCatalogCategories, ["catalog-categories"], catalogCache);
export const getCatalogCategory = unstable_cache(fetchCatalogCategory, ["catalog-category"], catalogCache);
export const getCatalogSubcategory = unstable_cache(fetchCatalogSubcategory, ["catalog-subcategory"], catalogCache);
export const getCatalogProduct = unstable_cache(fetchCatalogProduct, ["catalog-product"], catalogCache);
