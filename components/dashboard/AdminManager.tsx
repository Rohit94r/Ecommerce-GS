"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { createClient } from "@/utils/supabase/client";
import { cn, formatCurrency, slugify } from "@/lib/utils";
import { categories as catalogCategories } from "@/lib/dummyData";
import { appendProductOptionsFeature, cleanProductFeatures, getProductOptions, normalizeProductOptions, PRODUCT_OPTION_PRESETS } from "@/lib/productOptions";
import type { Blog, GoogleReview, Order, Product, ProductCategory, ProductMedia, ProductOptionGroup, Rental } from "@/types";

type Toast = { message: string; tone: "success" | "error" };
type SortDirection = "asc" | "desc";
type ProductImageRow = { image_url: string; sort_order: number | null; media_type?: string | null };
type ProductSubcategoryRow = {
  id: string;
  name: string;
  slug: string;
  category_id: string;
};
type ProductRow = {
  id: string;
  subcategory_id: string | null;
  name: string;
  slug: string;
  category: ProductCategory;
  price: number | string;
  discount: number | string;
  stock: number;
  description: string;
  brand: string | null;
  features: string[] | null;
  product_options?: unknown;
  is_featured: boolean;
  show_on_homepage: boolean | null;
  is_special_offer: boolean | null;
  is_rental: boolean;
  is_active: boolean | null;
  subcategories?: ProductSubcategoryRow | ProductSubcategoryRow[] | null;
  product_images?: ProductImageRow[];
};
type SubcategoryOption = {
  id?: string;
  name: string;
  slug: string;
  sortOrder: number;
};
type CategoryOption = {
  id?: string;
  name: ProductCategory;
  slug: string;
  description: string;
  image: string;
  sortOrder: number;
  subcategories: SubcategoryOption[];
};
type CategoryRow = {
  id: string;
  name: ProductCategory;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  subcategories?: {
    id: string;
    name: string;
    slug: string;
    sort_order: number | null;
    is_active: boolean | null;
  }[] | null;
};
type BlogRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  created_at: string;
  blog_images?: BlogImageRow[] | null;
};
type BlogImageRow = {
  image_url: string;
  sort_order: number | null;
};
type RentalRow = {
  id: string;
  product_id: string | null;
  name: string;
  slug: string;
  category?: ProductCategory | null;
  price_per_day: number | string;
  price_per_week?: number | string | null;
  price_per_month?: number | string | null;
  availability: boolean;
  description: string;
  image_url: string | null;
  rental_images?: { image_url: string; sort_order: number | null }[] | null;
};
type GoogleReviewRow = {
  id: string;
  reviewer_name: string;
  area: string | null;
  rating: number | string;
  review: string;
  source: string | null;
  is_featured: boolean | null;
  created_at: string;
};
type OrderItemRow = {
  product_id: string | null;
  product_name: string;
  unit_price: number | string;
  quantity: number;
};
type OrderRow = {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  total_price: number | string;
  status: Order["status"];
  order_items?: OrderItemRow[];
};
type AdminProduct = Product & { featured?: boolean; showOnHomepage?: boolean; specialOffer?: boolean; active?: boolean; subcategoryId?: string | null; subcategoryName?: string | null; subcategorySlug?: string | null };
type AdminRental = Rental & { id?: string; name: string; description: string; image: string; images: string[] };
type DraftProduct = {
  id?: string;
  name: string;
  category: ProductCategory;
  categorySlug: string;
  subcategoryId: string;
  subcategoryMode: "existing" | "new";
  newSubcategoryName: string;
  price: number;
  discount: number;
  stock: number;
  images: string[];
  videos: string[];
  videoUrl: string;
  description: string;
  optionGroups: ProductOptionGroup[];
  featured?: boolean;
  showOnHomepage?: boolean;
  specialOffer?: boolean;
  active?: boolean;
};

const defaultCategoryOptions: CategoryOption[] = catalogCategories.map((category, index) => ({
  name: category.name as ProductCategory,
  slug: category.slug,
  description: category.description,
  image: category.image,
  sortOrder: index,
  subcategories: category.subcategories.map((subcategory, subcategoryIndex) => ({
    name: subcategory.name,
    slug: subcategory.slug,
    sortOrder: subcategoryIndex,
  })),
}));
const defaultImage = "/media/hero-care.svg";
const supabase = createClient();

function ToastView({ toast }: { toast: Toast | null }) {
  if (!toast) return null;
  return (
    <div className={cn("fixed right-4 top-4 z-[70] rounded-lg px-4 py-3 text-sm font-bold text-white shadow-xl", toast.tone === "success" ? "bg-[#047068]" : "bg-red-600")}>
      {toast.message}
    </div>
  );
}

function useToast() {
  const [toast, setToast] = useState<Toast | null>(null);

  const show = useCallback((message: string, tone: Toast["tone"] = "success") => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  return { toast, show };
}

function cleanError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) return String(error.message);
  return "Something went wrong";
}

function SectionHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="text-3xl font-black text-slate-950">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {action}
    </div>
  );
}

function TableShell({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm shadow-slate-900/5">{children}</div>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-slate-200 bg-white p-10 text-center font-semibold text-slate-500">{text}</div>;
}

function readFiles(files: FileList | null, onLoad: (images: string[]) => void) {
  if (!files?.length) return;
  Promise.all(
    Array.from(files).map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.readAsDataURL(file);
        }),
    ),
  ).then(onLoad);
}

function uniqueImages(images: string[]) {
  return Array.from(new Set(images.filter(Boolean)));
}

function isVideoMediaUrl(url: string, type?: string | null) {
  const normalized = url.toLowerCase();
  return type === "video" || normalized.startsWith("data:video/") || /\.(mp4|webm|ogg|mov)(\?|#|$)/.test(normalized);
}

function toAdminMedia(images: string[], videos: string[]): ProductMedia[] {
  return [
    ...images.map((url) => ({ type: "image" as const, url })),
    ...videos.map((url) => ({ type: "video" as const, url })),
  ];
}

function isDefaultRentalCategory(category: string | undefined) {
  return defaultCategoryOptions.some((option) => option.name === category);
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(nextIndex, 0, item);
  return next;
}

function ConfirmModal({ open, title, message, onCancel, onConfirm }: { open: boolean; title: string; message: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-sm leading-6 text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}>Delete</Button>
      </div>
    </Modal>
  );
}

function mapProduct(row: ProductRow): AdminProduct {
  const mediaRows = row.product_images?.slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)) ?? [];
  const images = mediaRows.filter((item) => !isVideoMediaUrl(item.image_url, item.media_type)).map((image) => image.image_url);
  const videos = mediaRows.filter((item) => isVideoMediaUrl(item.image_url, item.media_type)).map((video) => video.image_url);
  const subcategory = Array.isArray(row.subcategories) ? row.subcategories[0] : row.subcategories;
  const media = toAdminMedia(images.length ? images : [defaultImage], videos);

  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    category: row.category,
    images: images.length ? images : [defaultImage],
    videos,
    media,
    stock: row.stock,
    discount: Number(row.discount),
    isRental: row.is_rental,
    description: row.description,
    features: cleanProductFeatures(row.features),
    brand: row.brand ?? "Gargi Care",
    options: getProductOptions(row.product_options, row.features),
    featured: row.is_featured,
    showOnHomepage: Boolean(row.show_on_homepage),
    specialOffer: Boolean(row.is_special_offer),
    active: row.is_active !== false,
    subcategoryId: row.subcategory_id ?? subcategory?.id ?? null,
    subcategoryName: subcategory?.name ?? null,
    subcategorySlug: subcategory?.slug ?? null,
  };
}

function mapRental(row: RentalRow): AdminRental {
  const images = (row.rental_images ?? [])
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((image) => image.image_url)
    .filter(Boolean);
  const primaryImage = images[0] ?? row.image_url ?? defaultImage;

  return {
    id: row.id,
    product_id: row.product_id ?? row.id,
    name: row.name,
    category: row.category ?? "Mobility",
    price_per_day: Number(row.price_per_day),
    price_per_week: row.price_per_week ? Number(row.price_per_week) : undefined,
    price_per_month: row.price_per_month ? Number(row.price_per_month) : undefined,
    availability: row.availability,
    description: row.description,
    image: primaryImage,
    images: images.length ? images : [primaryImage],
  };
}

function mapOrder(row: OrderRow): Order {
  const items = row.order_items?.map((item) => ({
    product: {
      id: item.product_id ?? item.product_name,
      name: item.product_name,
      price: Number(item.unit_price),
      category: "Mobility" as ProductCategory,
      images: [defaultImage],
      stock: 1,
      discount: 0,
      isRental: false,
      description: "",
      features: [],
      brand: "Gargi Care",
    },
    quantity: item.quantity,
  })) ?? [];

  return {
    id: row.id,
    customer_name: row.customer_name,
    phone: row.phone,
    address: row.address,
    total_price: Number(row.total_price),
    status: row.status,
    items,
  };
}

function mapBlog(row: BlogRow): Blog {
  const images = (row.blog_images ?? [])
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((image) => image.image_url)
    .filter(Boolean);
  const fallbackImage = row.image_url ?? defaultImage;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    image: images[0] ?? fallbackImage,
    images: images.length ? images : [fallbackImage],
    created_at: row.created_at.slice(0, 10),
  };
}

function mapGoogleReview(row: GoogleReviewRow): GoogleReview {
  return {
    id: row.id,
    reviewer_name: row.reviewer_name,
    area: row.area ?? "Mumbai",
    rating: Number(row.rating),
    review: row.review,
    source: row.source ?? "Google",
    is_featured: Boolean(row.is_featured),
    created_at: row.created_at.slice(0, 10),
  };
}

function toCategoryOptions(rows: CategoryRow[]): CategoryOption[] {
  const rowOptions = rows
    .filter((row) => row.is_active !== false)
    .map((row, index) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description ?? "",
      image: row.image_url ?? defaultImage,
      sortOrder: row.sort_order ?? index,
      subcategories: (row.subcategories ?? [])
        .filter((subcategory) => subcategory.is_active !== false)
        .map((subcategory, subcategoryIndex) => ({
          id: subcategory.id,
          name: subcategory.name,
          slug: subcategory.slug,
          sortOrder: subcategory.sort_order ?? subcategoryIndex,
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return defaultCategoryOptions.map((defaultCategory) => {
    const rowCategory = rowOptions.find((item) => item.slug === defaultCategory.slug);
    if (!rowCategory) return defaultCategory;

    const subcategories = [...defaultCategory.subcategories];
    rowCategory.subcategories.forEach((subcategory) => {
      const existingIndex = subcategories.findIndex((item) => item.slug === subcategory.slug);
      if (existingIndex >= 0) subcategories[existingIndex] = { ...subcategories[existingIndex], ...subcategory };
      else subcategories.push(subcategory);
    });

    return { ...defaultCategory, ...rowCategory, subcategories };
  });
}

async function ensureDefaultCatalog() {
  const { data: categoryRows, error: categoryError } = await supabase
    .from("categories")
    .upsert(
      defaultCategoryOptions.map((category) => ({
        name: category.name,
        slug: category.slug,
        description: category.description,
        image_url: category.image,
        sort_order: category.sortOrder,
        is_active: true,
      })),
      { onConflict: "slug" },
    )
    .select("id, slug");

  if (categoryError) throw categoryError;

  const categoryIds = new Map((categoryRows ?? []).map((category) => [String(category.slug), String(category.id)]));
  const subcategoryRows = defaultCategoryOptions.flatMap((category) => {
    const categoryId = categoryIds.get(category.slug);
    if (!categoryId) return [];

    return category.subcategories.map((subcategory) => ({
      category_id: categoryId,
      name: subcategory.name,
      slug: subcategory.slug,
      description: "",
      sort_order: subcategory.sortOrder,
      is_active: true,
    }));
  });

  if (subcategoryRows.length) {
    const { error } = await supabase.from("subcategories").upsert(subcategoryRows, { onConflict: "category_id,slug" });
    if (error) throw error;
  }
}

export function OverviewAdmin() {
  const [stats, setStats] = useState({
    products: 0,
    stock: 0,
    lowStock: 0,
    rentals: 0,
    orders: 0,
    pending: 0,
    delivered: 0,
    revenue: 0,
    rentalDaily: 0,
    reviews: 0,
    averageRating: 0,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<{ name: string; stock: number; category: string }[]>([]);
  const [categoryMix, setCategoryMix] = useState<{ category: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast, show } = useToast();

  const loadOverview = useCallback(async () => {
    setLoading(true);
    const [productsResult, rentalsResult, ordersResult, reviewsResult] = await Promise.all([
      supabase.from("products").select("name, category, stock, price, discount"),
      supabase.from("rentals").select("price_per_day"),
      supabase.from("orders").select("*, order_items(product_id, product_name, unit_price, quantity)").order("created_at", { ascending: false }),
      supabase.from("google_reviews").select("rating, is_featured"),
    ]);

    if (productsResult.error || rentalsResult.error || ordersResult.error || reviewsResult.error) {
      show(cleanError(productsResult.error ?? rentalsResult.error ?? ordersResult.error ?? reviewsResult.error), "error");
    } else {
      const productRows = productsResult.data ?? [];
      const rentalRows = rentalsResult.data ?? [];
      const orderRows = ((ordersResult.data ?? []) as OrderRow[]).map(mapOrder);
      const reviewRows = reviewsResult.data ?? [];
      const categoryCounts = productRows.reduce<Record<string, number>>((counts, product) => {
        counts[String(product.category)] = (counts[String(product.category)] ?? 0) + 1;
        return counts;
      }, {});

      setStats({
        products: productRows.length,
        stock: productRows.reduce((sum, product) => sum + Number(product.stock), 0),
        lowStock: productRows.filter((product) => Number(product.stock) <= 3).length,
        rentals: rentalRows.length,
        orders: orderRows.length,
        pending: orderRows.filter((order) => order.status === "pending").length,
        delivered: orderRows.filter((order) => order.status === "delivered").length,
        revenue: orderRows.reduce((sum, order) => sum + order.total_price, 0),
        rentalDaily: rentalRows.reduce((sum, rental) => sum + Number(rental.price_per_day), 0),
        reviews: reviewRows.length,
        averageRating: reviewRows.length ? reviewRows.reduce((sum, review) => sum + Number(review.rating), 0) / reviewRows.length : 0,
      });
      setOrders(orderRows.slice(0, 6));
      setLowStockProducts(productRows.filter((product) => Number(product.stock) <= 3).slice(0, 5).map((product) => ({ name: String(product.name), stock: Number(product.stock), category: String(product.category) })));
      setCategoryMix(Object.entries(categoryCounts).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count));
    }
    setLoading(false);
  }, [show]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOverview();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadOverview]);

  return (
    <div className="space-y-6">
      <ToastView toast={toast} />
      <SectionHeader
        title="Overview"
        description="Live business snapshot from Supabase: products, stock health, rental value, orders and Google reviews."
        action={<div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={loadOverview}>Refresh</Button></div>}
      />
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {[
          ["Products", stats.products],
          ["Stock Units", stats.stock],
          ["Low Stock", stats.lowStock],
          ["Orders", stats.orders],
          ["Revenue", formatCurrency(stats.revenue)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-black text-[#047068]">{loading ? "..." : value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {[
          ["Pending orders", stats.pending],
          ["Delivered orders", stats.delivered],
          ["Rental SKUs", stats.rentals],
          ["Google reviews", stats.reviews],
          ["Google rating", stats.averageRating ? `${stats.averageRating.toFixed(1)} / 5` : "No reviews"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
            <p className="mt-2 text-xl font-black text-slate-950">{loading ? "..." : value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <TableShell>
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-xl font-black text-slate-950">Recent orders</h2>
          </div>
          {orders.length ? (
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
                <tr><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Phone</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-bold text-slate-800">{order.customer_name}</td>
                    <td className="px-5 py-4">{order.phone}</td>
                    <td className="px-5 py-4">{formatCurrency(order.total_price)}</td>
                    <td className="px-5 py-4"><Badge tone={order.status === "delivered" ? "green" : "amber"}>{order.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <EmptyState text={loading ? "Loading orders..." : "No orders in Supabase yet."} />}
        </TableShell>
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">Quick actions</h2>
            <div className="mt-4 grid gap-2">
              <a href="/dashboard/products" className="rounded-lg bg-[#047068] px-4 py-3 text-sm font-black text-white transition hover:scale-[1.01]">Add or edit products</a>
              <a href="/dashboard/orders" className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50">Manage order status</a>
              <a href="/dashboard/reviews" className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50">Update Google reviews</a>
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">Rental pricing</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Current daily rental base from Supabase rental SKUs.</p>
            <p className="mt-6 text-3xl font-black text-[#047068]">{loading ? "..." : `${formatCurrency(stats.rentalDaily)}/day`}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Low stock watchlist</h2>
          <div className="mt-4 grid gap-3">
            {lowStockProducts.length ? lowStockProducts.map((product) => (
              <div key={product.name} className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 px-4 py-3">
                <span>
                  <span className="block font-bold text-slate-900">{product.name}</span>
                  <span className="text-xs font-semibold text-slate-500">{product.category}</span>
                </span>
                <Badge tone={product.stock > 0 ? "amber" : "red"}>{product.stock} left</Badge>
              </div>
            )) : <p className="text-sm font-semibold text-slate-500">{loading ? "Checking stock..." : "No low stock products."}</p>}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Category mix</h2>
          <div className="mt-4 grid gap-3">
            {categoryMix.length ? categoryMix.map((item) => (
              <div key={item.category}>
                <div className="mb-1 flex justify-between text-sm font-bold text-slate-700"><span>{item.category}</span><span>{item.count}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-[#047068]" style={{ width: `${Math.max(8, (item.count / Math.max(stats.products, 1)) * 100)}%` }} /></div>
              </div>
            )) : <p className="text-sm font-semibold text-slate-500">{loading ? "Loading categories..." : "No product categories yet."}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductsAdmin() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [catalogOptions, setCatalogOptions] = useState<CategoryOption[]>(defaultCategoryOptions);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<keyof Pick<Product, "name" | "price" | "stock" | "discount">>("name");
  const [direction, setDirection] = useState<SortDirection>("asc");
  const [draft, setDraft] = useState<DraftProduct | null>(null);
  const [viewing, setViewing] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);
  const [actionMenu, setActionMenu] = useState<{ product: AdminProduct; top: number; left: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast, show } = useToast();

  const loadCategoryOptions = useCallback(async () => {
    try {
      await ensureDefaultCatalog();
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, description, image_url, sort_order, is_active, subcategories(id, name, slug, sort_order, is_active)")
        .eq("is_active", true);

      if (error) throw error;
      setCatalogOptions(toCategoryOptions((data ?? []) as CategoryRow[]));
    } catch (error) {
      setCatalogOptions(defaultCategoryOptions);
      show(cleanError(error), "error");
    }
  }, [show]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    let { data, error } = await supabase.from("products").select("*, subcategories(id, name, slug, category_id), product_images(*)").order("created_at", { ascending: false });

    if (error) {
      const fallback = await supabase.from("products").select("*").order("created_at", { ascending: false });
      data = fallback.data as typeof data;
      error = fallback.error;
    }

    if (error) show(cleanError(error), "error");
    else setItems(((data ?? []) as ProductRow[]).map(mapProduct));
    setLoading(false);
  }, [show]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCategoryOptions();
      void loadProducts();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadCategoryOptions, loadProducts]);

  const filtered = useMemo(() => {
    return items
      .filter((item) => (category === "All" || item.category === category) && item.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        const aValue = a[sort];
        const bValue = b[sort];
        const result = typeof aValue === "number" && typeof bValue === "number" ? aValue - bValue : String(aValue).localeCompare(String(bValue));
        return direction === "asc" ? result : -result;
      });
  }, [category, direction, items, query, sort]);

  function firstSubcategoryFor(categoryOption: CategoryOption) {
    return categoryOption.subcategories.find((subcategory) => subcategory.id) ?? categoryOption.subcategories[0];
  }

  function setDraftCategory(categorySlug: string) {
    if (!draft) return;
    const nextCategory = catalogOptions.find((option) => option.slug === categorySlug) ?? catalogOptions[0];
    const nextSubcategory = firstSubcategoryFor(nextCategory);

    setDraft({
      ...draft,
      category: nextCategory.name,
      categorySlug: nextCategory.slug,
      subcategoryId: nextSubcategory?.id ?? "",
      subcategoryMode: nextSubcategory?.id ? "existing" : "new",
      newSubcategoryName: nextSubcategory?.id ? "" : nextSubcategory?.name ?? "",
    });
  }

  function addOptionGroup(group: ProductOptionGroup = { name: "Custom Option", values: [{ label: "", available: true }] }) {
    if (!draft) return;
    setDraft({ ...draft, optionGroups: [...draft.optionGroups, group] });
  }

  function updateOptionGroup(groupIndex: number, nextGroup: ProductOptionGroup) {
    if (!draft) return;
    setDraft({
      ...draft,
      optionGroups: draft.optionGroups.map((group, index) => (index === groupIndex ? nextGroup : group)),
    });
  }

  function removeOptionGroup(groupIndex: number) {
    if (!draft) return;
    setDraft({ ...draft, optionGroups: draft.optionGroups.filter((_, index) => index !== groupIndex) });
  }

  function openAdd() {
    const firstCategory = catalogOptions[0] ?? defaultCategoryOptions[0];
    const firstSubcategory = firstSubcategoryFor(firstCategory);

    setDraft({
      name: "",
      category: firstCategory.name,
      categorySlug: firstCategory.slug,
      subcategoryId: firstSubcategory?.id ?? "",
      subcategoryMode: firstSubcategory?.id ? "existing" : "new",
      newSubcategoryName: firstSubcategory?.id ? "" : firstSubcategory?.name ?? "",
      price: 0,
      discount: 0,
      stock: 0,
      images: [],
      videos: [],
      videoUrl: "",
      description: "",
      optionGroups: [],
      featured: false,
      showOnHomepage: false,
      specialOffer: false,
      active: true,
    });
  }

  function openEdit(product: AdminProduct) {
    const categoryOption = catalogOptions.find((option) => option.name === product.category) ?? catalogOptions.find((option) => option.slug === slugify(product.category)) ?? catalogOptions[0] ?? defaultCategoryOptions[0];
    const subcategory = categoryOption?.subcategories.find((option) => option.id === product.subcategoryId) ?? firstSubcategoryFor(categoryOption);

    setDraft({
      id: product.id,
      name: product.name,
      category: categoryOption?.name ?? product.category,
      categorySlug: categoryOption?.slug ?? slugify(product.category),
      subcategoryId: product.subcategoryId ?? subcategory?.id ?? "",
      subcategoryMode: product.subcategoryId ? "existing" : "new",
      newSubcategoryName: product.subcategoryId ? "" : product.subcategoryName ?? "",
      price: product.price,
      discount: product.discount,
      stock: product.stock,
      images: product.images,
      videos: product.videos ?? [],
      videoUrl: "",
      description: product.description,
      optionGroups: normalizeProductOptions(product.options),
      featured: product.featured,
      showOnHomepage: product.showOnHomepage,
      specialOffer: product.specialOffer,
      active: product.active,
    });
  }

  async function resolveSubcategoryId(currentDraft: DraftProduct) {
    await ensureDefaultCatalog();

    const { data: categoryRow, error: categoryError } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("slug", currentDraft.categorySlug)
      .single();

    if (categoryError || !categoryRow) throw categoryError ?? new Error("Select a main category.");

    if (currentDraft.subcategoryMode === "existing") {
      if (!currentDraft.subcategoryId) throw new Error("Select a subcategory or add a new one.");
      return { categoryName: String(categoryRow.name) as ProductCategory, subcategoryId: currentDraft.subcategoryId };
    }

    const subcategoryName = currentDraft.newSubcategoryName.trim();
    if (!subcategoryName) throw new Error("Subcategory name is required.");

    const { data: subcategoryRow, error } = await supabase
      .from("subcategories")
      .upsert(
        {
          category_id: String(categoryRow.id),
          name: subcategoryName,
          slug: slugify(subcategoryName),
          description: "",
          is_active: true,
        },
        { onConflict: "category_id,slug" },
      )
      .select("id")
      .single();

    if (error || !subcategoryRow) throw error ?? new Error("Could not save subcategory.");

    return { categoryName: String(categoryRow.name) as ProductCategory, subcategoryId: String(subcategoryRow.id) };
  }

  async function saveProduct() {
    if (!draft?.name.trim()) return show("Product name is required", "error");
    if (!Number.isFinite(draft.price) || draft.price <= 0) return show("Price must be greater than 0", "error");
    if (draft.price > 999999999999) return show("Price is too high", "error");
    if (!Number.isFinite(draft.discount) || draft.discount < 0 || draft.discount > 100) return show("Discount must be between 0 and 100", "error");
    if (draft.stock < 0) return show("Stock cannot be negative", "error");
    setLoading(true);
    const slug = slugify(draft.name);
    let categoryName = draft.category;
    let subcategoryId = draft.subcategoryId;

    try {
      const resolved = await resolveSubcategoryId(draft);
      categoryName = resolved.categoryName;
      subcategoryId = resolved.subcategoryId;
    } catch (error) {
      setLoading(false);
      return show(cleanError(error), "error");
    }

    const optionGroups = normalizeProductOptions(draft.optionGroups);
    const payload = {
      name: draft.name,
      slug,
      category: categoryName,
      subcategory_id: subcategoryId,
      price: Number(draft.price.toFixed(2)),
      discount: Number(draft.discount.toFixed(2)),
      stock: draft.stock,
      description: draft.description,
      brand: "Gargi Care",
      features: ["Admin managed product"],
      product_options: optionGroups,
      is_featured: Boolean(draft.featured),
      show_on_homepage: Boolean(draft.active && draft.showOnHomepage),
      is_special_offer: Boolean(draft.specialOffer),
      is_rental: false,
      is_active: draft.active !== false,
    };
    let savedWithoutProductOptions = false;
    let result = draft.id
      ? await supabase.from("products").update(payload).eq("id", draft.id).select("id").single()
      : await supabase.from("products").insert(payload).select("id").single();

    if (result.error && cleanError(result.error).toLowerCase().includes("product_options")) {
      const legacyPayload: Omit<typeof payload, "product_options"> = {
        name: payload.name,
        slug: payload.slug,
        category: payload.category,
        subcategory_id: payload.subcategory_id,
        price: payload.price,
        discount: payload.discount,
        stock: payload.stock,
        description: payload.description,
        brand: payload.brand,
        features: appendProductOptionsFeature(payload.features, optionGroups),
        is_featured: payload.is_featured,
        show_on_homepage: payload.show_on_homepage,
        is_special_offer: payload.is_special_offer,
        is_rental: payload.is_rental,
        is_active: payload.is_active,
      };
      result = draft.id
        ? await supabase.from("products").update(legacyPayload).eq("id", draft.id).select("id").single()
        : await supabase.from("products").insert(legacyPayload).select("id").single();
      savedWithoutProductOptions = !result.error;
    }

    if (result.error) {
      setLoading(false);
      return show(cleanError(result.error), "error");
    }

    const productId = result.data.id as string;
    await supabase.from("product_images").delete().eq("product_id", productId);
    const mediaRows = toAdminMedia(draft.images.length ? draft.images : [defaultImage], draft.videos).map((item, index) => ({
      product_id: productId,
      image_url: item.url,
      alt_text: draft.name,
      sort_order: index,
      media_type: item.type,
    }));
    let imageResult = await supabase.from("product_images").insert(mediaRows);
    if (imageResult.error && cleanError(imageResult.error).toLowerCase().includes("media_type")) {
      imageResult = await supabase.from("product_images").insert(mediaRows.map((row) => ({
        product_id: row.product_id,
        image_url: row.image_url,
        alt_text: row.alt_text,
        sort_order: row.sort_order,
      })));
    }
    if (imageResult.error) show(cleanError(imageResult.error), "error");
    else show(savedWithoutProductOptions ? "Product saved in Supabase with option backup storage." : "Product saved in Supabase");
    setDraft(null);
    await loadCategoryOptions();
    await loadProducts();
    setLoading(false);
  }

  async function deleteProduct() {
    if (!deleting) return;
    const { error } = await supabase.from("products").delete().eq("id", deleting.id);
    if (error) show(cleanError(error), "error");
    else {
      show("Product deleted from Supabase");
      setDeleting(null);
      await loadProducts();
    }
  }

  async function toggleProductFlag(product: AdminProduct, field: "show_on_homepage" | "is_special_offer" | "is_active") {
    const currentValue = field === "show_on_homepage" ? Boolean(product.showOnHomepage) : field === "is_special_offer" ? Boolean(product.specialOffer) : product.active !== false;
    const payload = field === "is_active" && currentValue
      ? { is_active: false, show_on_homepage: false }
      : { [field]: !currentValue };
    const { error } = await supabase.from("products").update(payload).eq("id", product.id);
    if (error) show(cleanError(error), "error");
    else {
      show(field === "show_on_homepage" ? "Homepage visibility updated" : field === "is_special_offer" ? "Special offer updated" : "Product visibility updated");
      setActionMenu(null);
      await loadProducts();
    }
  }

  function openActionMenu(product: AdminProduct, event: React.MouseEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 240;
    setActionMenu({
      product,
      top: rect.bottom + 8,
      left: Math.max(12, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 12)),
    });
  }

  const selectedDraftCategory = draft ? catalogOptions.find((option) => option.slug === draft.categorySlug) ?? catalogOptions[0] : null;
  const selectedDraftSubcategories = selectedDraftCategory?.subcategories ?? [];

  return (
    <div>
      <ToastView toast={toast} />
      <SectionHeader title="Products" description="Live Supabase product listings, stock, pricing, discounts and images." action={<Button onClick={openAdd}>Add Product</Button>} />
      <div className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_180px_140px]">
        <Input placeholder="Search products" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-3 text-sm">
          <option>All</option>
          {catalogOptions.map((option) => <option key={option.slug}>{option.name}</option>)}
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="rounded-lg border border-slate-200 px-3 py-3 text-sm">
          <option value="name">Sort by name</option>
          <option value="price">Sort by price</option>
          <option value="stock">Sort by stock</option>
          <option value="discount">Sort by discount</option>
        </select>
        <Button variant="secondary" onClick={() => setDirection((value) => (value === "asc" ? "desc" : "asc"))}>{direction === "asc" ? "Ascending" : "Descending"}</Button>
      </div>
      {filtered.length ? (
        <TableShell>
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
              <tr>{["Name", "Category / Subcategory", "Price", "Stock", "Flags", "Actions"].map((header) => <th key={header} className="px-5 py-3">{header}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((product) => (
                <tr key={product.id} className={cn("hover:bg-slate-50", product.active === false && "bg-slate-50/70 opacity-75")}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-md bg-slate-100">
                        <Image src={product.images[0] ?? defaultImage} alt={product.name} fill className="object-contain p-1" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">{product.name}</span>
                        {product.options?.length ? (
                          <span className="mt-1 block text-xs font-semibold text-slate-500">
                            Options: {product.options.map((group) => group.name).join(", ")}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="block font-bold text-slate-800">{product.category}</span>
                    <span className="mt-1 block text-xs font-semibold text-slate-500">{product.subcategoryName ?? "No subcategory selected"}</span>
                  </td>
                  <td className="px-5 py-4">{formatCurrency(product.price)}</td>
                  <td className="px-5 py-4"><Badge tone={product.stock > 0 ? "green" : "red"}>{product.stock}</Badge></td>
                  <td className="px-5 py-4"><div className="flex flex-wrap gap-2">{product.active === false ? <Badge tone="red">Hidden</Badge> : null}{product.discount > 0 ? <Badge tone="amber">{product.discount}% OFF</Badge> : null}{product.featured ? <Badge tone="amber">Featured</Badge> : null}{product.showOnHomepage ? <Badge tone="green">Homepage</Badge> : null}{product.specialOffer ? <Badge tone="green">Special Offer</Badge> : null}</div></td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-black text-slate-600 shadow-sm transition hover:bg-slate-50"
                      onClick={(event) => openActionMenu(product, event)}
                      aria-label={`Open actions for ${product.name}`}
                    >
                      ⋯
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      ) : <EmptyState text={loading ? "Loading products from Supabase..." : "No Supabase products yet. Add your first product."} />}
      <Modal open={Boolean(draft)} title={draft?.id ? "Edit Product" : "Add Product"} onClose={() => setDraft(null)}>
        {draft ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">Name<Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
            <label className="text-sm font-bold text-slate-700">Main Category<select value={draft.categorySlug} onChange={(event) => setDraftCategory(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm">{catalogOptions.map((option) => <option key={option.slug} value={option.slug}>{option.name}</option>)}</select></label>
            <label className="text-sm font-bold text-slate-700">Subcategory<select value={draft.subcategoryMode === "new" ? "__new" : draft.subcategoryId} onChange={(event) => {
              const value = event.target.value;
              setDraft(value === "__new" ? { ...draft, subcategoryMode: "new", subcategoryId: "", newSubcategoryName: "" } : { ...draft, subcategoryMode: "existing", subcategoryId: value, newSubcategoryName: "" });
            }} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm">
              {selectedDraftSubcategories.filter((option) => option.id).map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
              <option value="__new">+ Add new subcategory</option>
            </select></label>
            {draft.subcategoryMode === "new" ? (
              <label className="text-sm font-bold text-slate-700">New Subcategory<Input value={draft.newSubcategoryName} onChange={(event) => setDraft({ ...draft, newSubcategoryName: event.target.value })} placeholder="Example: Wheelchairs" /></label>
            ) : null}
            <label className="text-sm font-bold text-slate-700">Price<Input type="number" min={1} step={0.01} value={draft.price} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} /></label>
            <label className="text-sm font-bold text-slate-700">Discount<Input type="number" min={0} max={100} step={0.01} value={draft.discount} onChange={(event) => setDraft({ ...draft, discount: Number(event.target.value) })} /></label>
            <label className="text-sm font-bold text-slate-700">Stock<Input type="number" min={0} step={1} value={draft.stock} onChange={(event) => setDraft({ ...draft, stock: Number(event.target.value) })} /><span className="mt-1 block text-xs font-semibold text-slate-500">Set 0 to keep product visible with an out-of-stock watermark.</span></label>
            <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:col-span-2 md:grid-cols-4">
              <label className="flex items-center gap-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={draft.active !== false} onChange={(event) => setDraft({ ...draft, active: event.target.checked, showOnHomepage: event.target.checked ? draft.showOnHomepage : false })} /> Publish product</label>
              <label className="flex items-center gap-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={Boolean(draft.showOnHomepage)} onChange={(event) => setDraft({ ...draft, showOnHomepage: event.target.checked })} /> Show on Homepage</label>
              <label className="flex items-center gap-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={Boolean(draft.specialOffer)} onChange={(event) => setDraft({ ...draft, specialOffer: event.target.checked })} /> Special Offer</label>
              <label className="flex items-center gap-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={Boolean(draft.featured)} onChange={(event) => setDraft({ ...draft, featured: event.target.checked })} /> Featured</label>
            </div>
            <label className="text-sm font-bold text-slate-700 md:col-span-2">Description<Textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
            <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:col-span-2">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <p className="text-sm font-black text-slate-800">Size, dimensions and custom options</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">Add any option section, then tick which values are available for customers.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_OPTION_PRESETS.map((preset) => (
                    <Button
                      key={preset.name}
                      type="button"
                      variant="secondary"
                      className="h-9 px-3 text-xs"
                      onClick={() => addOptionGroup({ name: preset.name, values: preset.values.map((value) => ({ ...value })) })}
                    >
                      + {preset.name}
                    </Button>
                  ))}
                  <Button type="button" variant="ghost" className="h-9 px-3 text-xs" onClick={() => addOptionGroup()}>
                    + Custom
                  </Button>
                </div>
              </div>
              {draft.optionGroups.length ? (
                <div className="grid gap-3">
                  {draft.optionGroups.map((group, groupIndex) => (
                    <div key={`${group.name}-${groupIndex}`} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                        <Input
                          value={group.name}
                          onChange={(event) => updateOptionGroup(groupIndex, { ...group, name: event.target.value })}
                          placeholder="Section name, e.g. Size or Chair Dimensions"
                        />
                        <Button type="button" variant="danger" className="h-11" onClick={() => removeOptionGroup(groupIndex)}>Remove Section</Button>
                      </div>
                      <div className="grid gap-2">
                        {group.values.map((value, valueIndex) => (
                          <div key={`${value.label}-${valueIndex}`} className="grid gap-2 sm:grid-cols-[1fr_150px_auto] sm:items-center">
                            <Input
                              value={value.label}
                              onChange={(event) => {
                                const values = group.values.map((item, index) => (index === valueIndex ? { ...item, label: event.target.value } : item));
                                updateOptionGroup(groupIndex, { ...group, values });
                              }}
                              placeholder={group.name.toLowerCase().includes("dimension") ? "Example: Seat width 46 cm" : "Example: XL"}
                            />
                            <label className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700">
                              <input
                                type="checkbox"
                                checked={value.available !== false}
                                onChange={(event) => {
                                  const values = group.values.map((item, index) => (index === valueIndex ? { ...item, available: event.target.checked } : item));
                                  updateOptionGroup(groupIndex, { ...group, values });
                                }}
                              />
                              Available
                            </label>
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-11"
                              onClick={() => updateOptionGroup(groupIndex, { ...group, values: group.values.filter((_, index) => index !== valueIndex) })}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-10 justify-self-start px-3 text-xs"
                        onClick={() => updateOptionGroup(groupIndex, { ...group, values: [...group.values, { label: "", available: true }] })}
                      >
                        + Add option value
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-slate-200 p-4 text-sm font-semibold text-slate-500">No size or dimension options added yet.</p>
              )}
            </div>
            <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:col-span-2">
              <div>
                <p className="text-sm font-black text-slate-800">Media</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">Recommended product photos: 1200 x 900 px, 4:3 ratio, white or transparent background. Product is shown fully with no crop. Videos are saved after photos and autoplay on the detail page.</p>
              </div>
              <label className="text-sm font-bold text-slate-700">Product photos<Input type="file" accept="image/*" multiple onChange={(event) => readFiles(event.target.files, (images) => setDraft({ ...draft, images: [...draft.images, ...images] }))} /></label>
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <Input value={draft.videoUrl} onChange={(event) => setDraft({ ...draft, videoUrl: event.target.value })} placeholder="Video URL: https://...mp4 or YouTube-hosted direct video" />
                <Button type="button" variant="secondary" onClick={() => {
                  const videoUrl = draft.videoUrl.trim();
                  if (!videoUrl) return;
                  setDraft({ ...draft, videos: [...draft.videos, videoUrl], videoUrl: "" });
                }}>Add Video</Button>
              </div>
              {(draft.images.length || draft.videos.length) ? (
                <div className="grid gap-3">
                  {draft.images.map((image, index) => (
                    <div key={`${image}-${index}`} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[80px_1fr_auto] sm:items-center">
                      <div className="relative h-20 w-20 overflow-hidden rounded-md bg-white">
                        <Image src={image} alt="Product preview" fill className="object-contain p-2" />
                      </div>
                      <p className="text-sm font-bold text-slate-700">Photo {index + 1}</p>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="ghost" onClick={() => setDraft({ ...draft, images: moveItem(draft.images, index, -1) })}>Up</Button>
                        <Button type="button" variant="ghost" onClick={() => setDraft({ ...draft, images: moveItem(draft.images, index, 1) })}>Down</Button>
                        <Button type="button" variant="danger" onClick={() => setDraft({ ...draft, images: draft.images.filter((_, itemIndex) => itemIndex !== index) })}>Remove</Button>
                      </div>
                    </div>
                  ))}
                  {draft.videos.map((video, index) => (
                    <div key={`${video}-${index}`} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[80px_1fr_auto] sm:items-center">
                      <video src={video} muted playsInline preload="metadata" className="h-20 w-20 rounded-md bg-slate-950 object-cover" />
                      <p className="truncate text-sm font-bold text-slate-700">Video {index + 1} <span className="font-semibold text-slate-500">(shown after photos)</span></p>
                      <Button type="button" variant="danger" onClick={() => setDraft({ ...draft, videos: draft.videos.filter((_, itemIndex) => itemIndex !== index) })}>Remove</Button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex justify-end gap-3 md:col-span-2"><Button variant="ghost" onClick={() => setDraft(null)}>Cancel</Button><Button onClick={saveProduct} disabled={loading}>{loading ? "Saving..." : "Save Product"}</Button></div>
          </div>
        ) : null}
      </Modal>
      <Modal open={Boolean(viewing)} title="Product Details" onClose={() => setViewing(null)}>{viewing ? <div className="space-y-3 text-sm text-slate-700"><p><b>Name:</b> {viewing.name}</p><p><b>Category:</b> {viewing.category}</p><p><b>Subcategory:</b> {viewing.subcategoryName ?? "No subcategory selected"}</p><p><b>Description:</b> {viewing.description}</p><p><b>Price:</b> {formatCurrency(viewing.price)}</p>{viewing.options?.length ? <div><b>Options:</b><div className="mt-2 grid gap-2">{viewing.options.map((group) => <div key={group.name} className="rounded-lg bg-slate-50 p-3"><p className="font-black text-slate-900">{group.name}</p><p className="mt-1 text-xs font-semibold text-slate-500">{group.values.map((value) => `${value.label}${value.available ? "" : " (out)"}`).join(", ")}</p></div>)}</div></div> : null}</div> : null}</Modal>
      <ConfirmModal open={Boolean(deleting)} title="Delete product?" message={`Delete ${deleting?.name ?? "this product"} from Supabase?`} onCancel={() => setDeleting(null)} onConfirm={deleteProduct} />
      {actionMenu ? (
        <>
          <button className="fixed inset-0 z-[75] cursor-default" aria-label="Close product actions" onClick={() => setActionMenu(null)} />
          <div
            className="fixed z-[80] grid w-60 gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/15"
            style={{ top: actionMenu.top, left: actionMenu.left }}
          >
            <button className="rounded-md px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={() => { setViewing(actionMenu.product); setActionMenu(null); }}>View</button>
            <button className="rounded-md px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={() => { openEdit(actionMenu.product); setActionMenu(null); }}>Edit</button>
            <button className="rounded-md px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={() => toggleProductFlag(actionMenu.product, "is_active")}>{actionMenu.product.active === false ? "Publish Product" : "Hide Product"}</button>
            <button className="rounded-md px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50" disabled={actionMenu.product.active === false} onClick={() => toggleProductFlag(actionMenu.product, "show_on_homepage")}>{actionMenu.product.showOnHomepage ? "Hide from Homepage" : "Show on Homepage"}</button>
            <button className="rounded-md px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={() => toggleProductFlag(actionMenu.product, "is_special_offer")}>{actionMenu.product.specialOffer ? "Unmark Special Offer" : "Mark Special Offer"}</button>
            <button className="rounded-md px-3 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50" onClick={() => { setDeleting(actionMenu.product); setActionMenu(null); }}>Delete</button>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function RentalsAdmin() {
  const [items, setItems] = useState<AdminRental[]>([]);
  const [draft, setDraft] = useState<AdminRental | null>(null);
  const [deleting, setDeleting] = useState<AdminRental | null>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const { toast, show } = useToast();

  const loadRentals = useCallback(async () => {
    setLoading(true);
    let { data, error } = await supabase.from("rentals").select("*, rental_images(image_url, sort_order)").order("created_at", { ascending: false });

    if (error) {
      const fallback = await supabase.from("rentals").select("*").order("created_at", { ascending: false });
      data = fallback.data as typeof data;
      error = fallback.error;
    }

    if (error) show(cleanError(error), "error");
    else setItems(((data ?? []) as RentalRow[]).map(mapRental));
    setLoading(false);
  }, [show]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadRentals();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadRentals]);

  async function saveRental() {
    if (!draft?.name.trim()) return show("Rental name is required", "error");
    if (draft.price_per_day <= 0) return show("Price per day is required", "error");
    if ((draft.price_per_week ?? 0) < 0 || (draft.price_per_month ?? 0) < 0) return show("Rental prices cannot be negative", "error");
    setLoading(true);
    const images = uniqueImages(draft.images?.length ? draft.images : [draft.image || defaultImage]);
    const payload = {
      name: draft.name,
      slug: slugify(draft.name),
      category: draft.category ?? "Mobility",
      price_per_day: draft.price_per_day,
      price_per_week: draft.price_per_week || null,
      price_per_month: draft.price_per_month || null,
      availability: draft.availability,
      description: draft.description,
      image_url: images[0] ?? defaultImage,
      is_active: true,
    };
    const result = draft.id
      ? await supabase.from("rentals").update(payload).eq("id", draft.id).select("id").single()
      : await supabase.from("rentals").insert(payload).select("id").single();
    if (result.error) show(cleanError(result.error), "error");
    else {
      const rentalId = String(result.data.id);
      let galleryError = "";
      const deleteImages = await supabase.from("rental_images").delete().eq("rental_id", rentalId);

      if (deleteImages.error) {
        galleryError = cleanError(deleteImages.error);
      } else {
        const imageRows = images.map((image, index) => ({
          rental_id: rentalId,
          image_url: image,
          alt_text: draft.name,
          sort_order: index,
        }));
        const insertImages = await supabase.from("rental_images").insert(imageRows);
        if (insertImages.error) galleryError = cleanError(insertImages.error);
      }

      setDraft(null);
      show(galleryError ? `Rental saved, but photos did not save: ${galleryError}` : `Rental saved with ${images.length} photo${images.length === 1 ? "" : "s"}.`, galleryError ? "error" : "success");
      await loadRentals();
    }
    setLoading(false);
  }

  async function deleteRental() {
    if (!deleting?.id) return;
    const { error } = await supabase.from("rentals").delete().eq("id", deleting.id);
    if (error) show(cleanError(error), "error");
    else {
      setDeleting(null);
      show("Rental deleted from Supabase");
      await loadRentals();
    }
  }

  return (
    <div>
      <ToastView toast={toast} />
      <SectionHeader title="Rentals" description="Live Supabase rentals with day, week and month pricing." action={<Button onClick={() => setDraft({ product_id: "", name: "", category: "Mobility", price_per_day: 0, price_per_week: 0, price_per_month: 0, availability: true, description: "", image: defaultImage, images: [] })}>Add Rental</Button>} />
      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <label className="text-sm font-bold text-slate-700">Rental calculator<Input className="mt-2 max-w-xs" type="number" min={1} value={days} onChange={(event) => setDays(Number(event.target.value))} /></label>
      </div>
      {items.length ? (
        <TableShell>
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500"><tr>{["Product", "Photos", "Category", "Day / Week / Month", "Availability", `${days} day estimate`, "Actions"].map((header) => <th key={header} className="px-5 py-3">{header}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((rental) => (
                <tr key={rental.id ?? rental.product_id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-bold text-slate-900">{rental.name}</td>
                  <td className="px-5 py-4 font-bold text-slate-600">{rental.images.length}</td>
                  <td className="px-5 py-4">{rental.category}</td>
                  <td className="px-5 py-4">
                    <span className="block font-bold">{formatCurrency(rental.price_per_day)}/day</span>
                    <span className="block text-xs text-slate-500">{formatCurrency(rental.price_per_week ?? rental.price_per_day * 7)}/week</span>
                    <span className="block text-xs text-slate-500">{formatCurrency(rental.price_per_month ?? rental.price_per_day * 30)}/month</span>
                  </td>
                  <td className="px-5 py-4"><Badge tone={rental.availability ? "green" : "red"}>{rental.availability ? "Available" : "Unavailable"}</Badge></td>
                  <td className="px-5 py-4 font-bold text-[#047068]">{formatCurrency(days * rental.price_per_day)}</td>
                  <td className="px-5 py-4"><div className="flex gap-2"><Button variant="secondary" onClick={() => setDraft(rental)}>Edit</Button><Button variant="danger" onClick={() => setDeleting(rental)}>Delete</Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      ) : <EmptyState text={loading ? "Loading rentals from Supabase..." : "No rentals in Supabase yet."} />}
      <Modal open={Boolean(draft)} title="Rental Form" onClose={() => setDraft(null)}>
        {draft ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">Name<Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
            <label className="text-sm font-bold text-slate-700">Category<select value={isDefaultRentalCategory(draft.category) ? draft.category : "__new"} onChange={(event) => setDraft({ ...draft, category: event.target.value === "__new" ? "" : event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm">{defaultCategoryOptions.map((option) => <option key={option.slug} value={option.name}>{option.name}</option>)}<option value="__new">+ Add new category</option></select></label>
            {!isDefaultRentalCategory(draft.category) ? <label className="text-sm font-bold text-slate-700">New category<Input value={draft.category ?? ""} onChange={(event) => setDraft({ ...draft, category: event.target.value })} placeholder="Example: ICU Bed Rentals" /></label> : null}
            <label className="text-sm font-bold text-slate-700">Price per day<Input type="number" value={draft.price_per_day} onChange={(event) => setDraft({ ...draft, price_per_day: Number(event.target.value) })} /></label>
            <label className="text-sm font-bold text-slate-700">Price per week<Input type="number" value={draft.price_per_week ?? 0} onChange={(event) => setDraft({ ...draft, price_per_week: Number(event.target.value) })} /></label>
            <label className="text-sm font-bold text-slate-700">Price per month<Input type="number" value={draft.price_per_month ?? 0} onChange={(event) => setDraft({ ...draft, price_per_month: Number(event.target.value) })} /></label>
            <label className="flex items-center gap-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={draft.availability} onChange={(event) => setDraft({ ...draft, availability: event.target.checked })} /> Available</label>
            <label className="text-sm font-bold text-slate-700 md:col-span-2">Description<Textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
            <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:col-span-2">
              <div>
                <p className="text-sm font-black text-slate-800">Rental Photos</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">First photo is primary. Add multiple photos and arrange them for the rental detail page.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {(draft.images ?? []).map((image, index) => (
                  <div key={`${image}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-white">
                      <Image src={image} alt={`Rental preview ${index + 1}`} fill className="object-contain p-2" />
                    </div>
                    <p className="mt-2 text-xs font-black text-slate-700">Photo {index + 1}{index === 0 ? " · Primary" : ""}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button type="button" variant="ghost" className="h-8 px-2 text-xs" onClick={() => setDraft({ ...draft, images: moveItem(draft.images ?? [], index, -1) })}>Up</Button>
                      <Button type="button" variant="ghost" className="h-8 px-2 text-xs" onClick={() => setDraft({ ...draft, images: moveItem(draft.images ?? [], index, 1) })}>Down</Button>
                      <Button type="button" variant="danger" className="h-8 px-2 text-xs" onClick={() => {
                        const nextImages = (draft.images ?? []).filter((_, itemIndex) => itemIndex !== index);
                        setDraft({ ...draft, images: nextImages, image: nextImages[0] ?? defaultImage });
                      }}>Remove</Button>
                    </div>
                  </div>
                ))}
                <label className="grid min-h-36 cursor-pointer place-items-center rounded-lg border border-dashed border-[#047068]/35 bg-[#047068]/5 p-4 text-center text-sm font-black text-[#047068] transition hover:bg-[#047068]/10">
                  <span className="text-3xl leading-none">+</span>
                  <span>Add photos</span>
                  <Input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => {
                    readFiles(event.target.files, (images) => {
                      setDraft((current) => {
                        if (!current) return current;
                        const nextImages = uniqueImages([...(current.images ?? []), ...images]);
                        return { ...current, images: nextImages, image: nextImages[0] ?? current.image };
                      });
                    });
                    event.currentTarget.value = "";
                  }} />
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 md:col-span-2"><Button variant="ghost" onClick={() => setDraft(null)}>Cancel</Button><Button onClick={saveRental} disabled={loading}>{loading ? "Saving..." : "Save Rental"}</Button></div>
          </div>
        ) : null}
      </Modal>
      <ConfirmModal open={Boolean(deleting)} title="Delete rental?" message={`Delete ${deleting?.name ?? "this rental"} from Supabase?`} onCancel={() => setDeleting(null)} onConfirm={deleteRental} />
    </div>
  );
}

export function OrdersAdmin() {
  const [items, setItems] = useState<Order[]>([]);
  const [viewing, setViewing] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast, show } = useToast();

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("orders").select("*, order_items(product_id, product_name, unit_price, quantity)").order("created_at", { ascending: false });
    if (error) show(cleanError(error), "error");
    else setItems(((data ?? []) as OrderRow[]).map(mapOrder));
    setLoading(false);
  }, [show]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOrders();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadOrders]);

  async function updateStatus(id: string, status: Order["status"]) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) show(cleanError(error), "error");
    else {
      setItems((current) => current.map((order) => (order.id === id ? { ...order, status } : order)));
      show("Order status updated in Supabase");
    }
  }

  return (
    <div>
      <ToastView toast={toast} />
      <SectionHeader title="Orders" description="Live Supabase orders, customer call actions and fulfillment status." />
      {items.length ? <TableShell><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500"><tr>{["Customer name", "Phone", "Address", "Product", "Quantity", "Status", "Actions"].map((header) => <th key={header} className="px-5 py-3">{header}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{items.map((order) => <tr key={order.id} className="hover:bg-slate-50"><td className="px-5 py-4 font-bold">{order.customer_name}</td><td className="px-5 py-4">{order.phone}</td><td className="px-5 py-4">{order.address}</td><td className="px-5 py-4">{order.items[0]?.product.name ?? "No items"}</td><td className="px-5 py-4">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td><td className="px-5 py-4"><select value={order.status} onChange={(event) => updateStatus(order.id, event.target.value as Order["status"])} className="rounded-md border border-slate-200 px-3 py-2 text-sm"><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></td><td className="px-5 py-4"><div className="flex gap-2"><Button variant="secondary" onClick={() => setViewing(order)}>View details</Button><a href={`tel:${order.phone.replaceAll(" ", "")}`}><Button>Call customer</Button></a></div></td></tr>)}</tbody></table></TableShell> : <EmptyState text={loading ? "Loading orders from Supabase..." : "No orders in Supabase yet."} />}
      <Modal open={Boolean(viewing)} title="Order Details" onClose={() => setViewing(null)}>{viewing ? <div className="space-y-3 text-sm text-slate-700"><p><b>Customer:</b> {viewing.customer_name}</p><p><b>Phone:</b> {viewing.phone}</p><p><b>Address:</b> {viewing.address}</p><p><b>Total:</b> {formatCurrency(viewing.total_price)}</p>{viewing.items.map((item) => <p key={item.product.id}><b>Item:</b> {item.quantity} x {item.product.name}</p>)}</div> : null}</Modal>
    </div>
  );
}

export function BlogsAdmin() {
  const [items, setItems] = useState<Blog[]>([]);
  const [draft, setDraft] = useState<Blog | null>(null);
  const [deleting, setDeleting] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast, show } = useToast();

  const loadBlogs = useCallback(async () => {
    setLoading(true);
    let { data, error } = await supabase
      .from("blogs")
      .select("*, blog_images(image_url, sort_order)")
      .order("created_at", { ascending: false });

    if (error) {
      const fallback = await supabase.from("blogs").select("*").order("created_at", { ascending: false });
      data = fallback.data;
      error = fallback.error;
    }

    if (error) show(cleanError(error), "error");
    else setItems(((data ?? []) as BlogRow[]).map(mapBlog));
    setLoading(false);
  }, [show]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadBlogs();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadBlogs]);

  async function saveBlog() {
    if (!draft?.title.trim()) return show("Blog title is required", "error");
    setLoading(true);
    const images = draft.images?.length ? draft.images : [draft.image || defaultImage];
    const payload = {
      title: draft.title,
      slug: draft.slug || slugify(draft.title),
      excerpt: draft.excerpt,
      content: draft.content,
      image_url: images[0] ?? defaultImage,
      is_published: true,
      published_at: new Date().toISOString(),
    };
    const result = draft.id
      ? await supabase.from("blogs").update(payload).eq("id", draft.id).select("id").single()
      : await supabase.from("blogs").insert(payload).select("id").single();

    if (result.error) {
      show(cleanError(result.error), "error");
      setLoading(false);
      return;
    }

    const blogId = String(result.data.id);
    let savedGallery = true;
    const deleteImages = await supabase.from("blog_images").delete().eq("blog_id", blogId);

    if (deleteImages.error) {
      savedGallery = false;
    } else {
      const imageRows = images.map((image, index) => ({
        blog_id: blogId,
        image_url: image,
        alt_text: draft.title,
        sort_order: index,
      }));
      const insertImages = await supabase.from("blog_images").insert(imageRows);
      savedGallery = !insertImages.error;
    }

    setDraft(null);
    show(savedGallery ? "Blog saved in Supabase" : "Blog saved. Run latest Supabase schema to enable multiple blog photos.", savedGallery ? "success" : "error");
    await loadBlogs();
    setLoading(false);
  }

  async function deleteBlog() {
    if (!deleting) return;
    const { error } = await supabase.from("blogs").delete().eq("id", deleting.id);
    if (error) show(cleanError(error), "error");
    else {
      setDeleting(null);
      show("Blog deleted from Supabase");
      await loadBlogs();
    }
  }

  return (
    <div>
      <ToastView toast={toast} />
      <SectionHeader title="Blogs" description="Live Supabase educational content with ordered photo galleries." action={<Button onClick={() => setDraft({ id: "", title: "", slug: "", excerpt: "", content: "", image: defaultImage, images: [], created_at: new Date().toISOString().slice(0, 10) })}>Add Blog</Button>} />
      {items.length ? (
        <TableShell>
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
              <tr>{["Title", "Photos", "Date", "Actions"].map((header) => <th key={header} className="px-5 py-3">{header}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((blog) => (
                <tr key={blog.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 overflow-hidden rounded-md bg-slate-100">
                        <Image src={blog.images?.[0] ?? blog.image} alt={blog.title} fill unoptimized={(blog.images?.[0] ?? blog.image).startsWith("data:")} className="object-cover" />
                      </div>
                      <span className="font-bold text-slate-900">{blog.title}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-600">{blog.images?.length ?? 1}</td>
                  <td className="px-5 py-4">{blog.created_at}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => setDraft({ ...blog, images: blog.images ?? [blog.image] })}>Edit</Button>
                      <Button variant="danger" onClick={() => setDeleting(blog)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      ) : <EmptyState text={loading ? "Loading blogs from Supabase..." : "No blogs in Supabase yet."} />}
      <Modal open={Boolean(draft)} title="Blog Form" onClose={() => setDraft(null)}>
        {draft ? (
          <div className="grid gap-4">
            <label className="text-sm font-bold text-slate-700">
              Title
              <Input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value, slug: slugify(event.target.value) })} />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Short Description
              <Textarea value={draft.excerpt} onChange={(event) => setDraft({ ...draft, excerpt: event.target.value })} className="min-h-24" />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Full Blog Content
              <Textarea value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} className="min-h-56" />
            </label>
            <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4">
              <div>
                <p className="text-sm font-black text-slate-800">Blog Photos</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">First photo is primary. Use Up and Down to arrange priority.</p>
              </div>
              {draft.images?.length ? (
                <div className="grid gap-3">
                  {draft.images.map((image, index) => (
                    <div key={`${image}-${index}`} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[96px_1fr_auto] sm:items-center">
                      <div className="relative h-20 w-24 overflow-hidden rounded-md bg-white">
                        <Image src={image} alt={`Blog preview ${index + 1}`} fill unoptimized={image.startsWith("data:")} className="object-cover" />
                      </div>
                      <p className="text-sm font-bold text-slate-700">Photo {index + 1}{index === 0 ? " · Primary" : ""}</p>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="ghost" onClick={() => setDraft({ ...draft, images: moveItem(draft.images ?? [], index, -1) })}>Up</Button>
                        <Button type="button" variant="ghost" onClick={() => setDraft({ ...draft, images: moveItem(draft.images ?? [], index, 1) })}>Down</Button>
                        <Button type="button" variant="danger" onClick={() => {
                          const nextImages = (draft.images ?? []).filter((_, itemIndex) => itemIndex !== index);
                          setDraft({ ...draft, images: nextImages, image: nextImages[0] ?? defaultImage });
                        }}>Remove</Button>
                      </div>
                    </div>
                  ))}
                  <label className="grid min-h-24 cursor-pointer place-items-center rounded-lg border border-dashed border-[#047068]/35 bg-[#047068]/5 p-4 text-center text-sm font-black text-[#047068] transition hover:bg-[#047068]/10">
                    <span className="text-3xl leading-none">+</span>
                    <span>Add more photos</span>
                    <Input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => readFiles(event.target.files, (images) => setDraft({ ...draft, images: [...(draft.images ?? []), ...images], image: draft.images?.[0] ?? images[0] ?? draft.image }))} />
                  </label>
                </div>
              ) : (
                <label className="grid min-h-28 cursor-pointer place-items-center rounded-lg border border-dashed border-[#047068]/35 bg-[#047068]/5 p-4 text-center text-sm font-black text-[#047068] transition hover:bg-[#047068]/10">
                  <span className="text-3xl leading-none">+</span>
                  <span>Add blog photos</span>
                  <Input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => readFiles(event.target.files, (images) => setDraft({ ...draft, images: [...(draft.images ?? []), ...images], image: draft.images?.[0] ?? images[0] ?? draft.image }))} />
                </label>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setDraft(null)}>Cancel</Button>
              <Button onClick={saveBlog} disabled={loading}>{loading ? "Saving..." : "Save Blog"}</Button>
            </div>
          </div>
        ) : null}
      </Modal>
      <ConfirmModal open={Boolean(deleting)} title="Delete blog?" message={`Delete ${deleting?.title ?? "this blog"} from Supabase?`} onCancel={() => setDeleting(null)} onConfirm={deleteBlog} />
    </div>
  );
}

export function ReviewsAdmin() {
  const [items, setItems] = useState<GoogleReview[]>([]);
  const [draft, setDraft] = useState<GoogleReview | null>(null);
  const [deleting, setDeleting] = useState<GoogleReview | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast, show } = useToast();

  const loadReviews = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("google_reviews").select("*").order("created_at", { ascending: false });
    if (error) show(cleanError(error), "error");
    else setItems(((data ?? []) as GoogleReviewRow[]).map(mapGoogleReview));
    setLoading(false);
  }, [show]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadReviews();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadReviews]);

  function openAdd() {
    setDraft({
      id: "",
      reviewer_name: "",
      area: "Mumbai",
      rating: 5,
      review: "",
      source: "Google",
      is_featured: true,
      created_at: new Date().toISOString().slice(0, 10),
    });
  }

  async function saveReview() {
    if (!draft?.reviewer_name.trim()) return show("Reviewer name is required", "error");
    if (!draft.review.trim()) return show("Review text is required", "error");
    if (draft.rating < 1 || draft.rating > 5) return show("Rating must be between 1 and 5", "error");

    setLoading(true);
    const payload = {
      reviewer_name: draft.reviewer_name,
      area: draft.area || "Mumbai",
      rating: draft.rating,
      review: draft.review,
      source: draft.source || "Google",
      is_featured: draft.is_featured,
    };
    const { error } = draft.id ? await supabase.from("google_reviews").update(payload).eq("id", draft.id) : await supabase.from("google_reviews").insert(payload);

    if (error) show(cleanError(error), "error");
    else {
      setDraft(null);
      show("Google review saved in Supabase");
      await loadReviews();
    }
    setLoading(false);
  }

  async function deleteReview() {
    if (!deleting) return;
    const { error } = await supabase.from("google_reviews").delete().eq("id", deleting.id);
    if (error) show(cleanError(error), "error");
    else {
      setDeleting(null);
      show("Google review deleted");
      await loadReviews();
    }
  }

  return (
    <div>
      <ToastView toast={toast} />
      <SectionHeader
        title="Google Reviews"
        description="Manage the customer reviews shown on the homepage. Featured reviews appear publicly."
        action={<Button onClick={openAdd}>Add Review</Button>}
      />
      {items.length ? (
        <TableShell>
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
              <tr>{["Reviewer", "Area", "Rating", "Review", "Visible", "Actions"].map((header) => <th key={header} className="px-5 py-3">{header}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((review) => (
                <tr key={review.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-bold text-slate-900">{review.reviewer_name}</td>
                  <td className="px-5 py-4">{review.area}</td>
                  <td className="px-5 py-4 text-amber-500">{"★".repeat(Math.round(review.rating))}</td>
                  <td className="px-5 py-4 text-slate-600">{review.review}</td>
                  <td className="px-5 py-4"><Badge tone={review.is_featured ? "green" : "amber"}>{review.is_featured ? "Homepage" : "Hidden"}</Badge></td>
                  <td className="px-5 py-4"><div className="flex gap-2"><Button variant="secondary" onClick={() => setDraft(review)}>Edit</Button><Button variant="danger" onClick={() => setDeleting(review)}>Delete</Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      ) : <EmptyState text={loading ? "Loading reviews from Supabase..." : "No Google reviews yet. Add the first review."} />}
      <Modal open={Boolean(draft)} title={draft?.id ? "Edit Google Review" : "Add Google Review"} onClose={() => setDraft(null)}>
        {draft ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">Reviewer name<Input value={draft.reviewer_name} onChange={(event) => setDraft({ ...draft, reviewer_name: event.target.value })} /></label>
            <label className="text-sm font-bold text-slate-700">Area<Input value={draft.area} onChange={(event) => setDraft({ ...draft, area: event.target.value })} /></label>
            <label className="text-sm font-bold text-slate-700">Rating<Input type="number" min={1} max={5} step={0.5} value={draft.rating} onChange={(event) => setDraft({ ...draft, rating: Number(event.target.value) })} /></label>
            <label className="text-sm font-bold text-slate-700">Source<Input value={draft.source} onChange={(event) => setDraft({ ...draft, source: event.target.value })} /></label>
            <label className="text-sm font-bold text-slate-700 md:col-span-2">Review<Textarea value={draft.review} onChange={(event) => setDraft({ ...draft, review: event.target.value })} /></label>
            <label className="flex items-center gap-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={draft.is_featured} onChange={(event) => setDraft({ ...draft, is_featured: event.target.checked })} /> Show on homepage</label>
            <div className="flex justify-end gap-3 md:col-span-2"><Button variant="ghost" onClick={() => setDraft(null)}>Cancel</Button><Button onClick={saveReview} disabled={loading}>{loading ? "Saving..." : "Save Review"}</Button></div>
          </div>
        ) : null}
      </Modal>
      <ConfirmModal open={Boolean(deleting)} title="Delete review?" message={`Delete ${deleting?.reviewer_name ?? "this review"} from Supabase?`} onCancel={() => setDeleting(null)} onConfirm={deleteReview} />
    </div>
  );
}
