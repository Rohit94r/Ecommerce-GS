"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { createClient } from "@/utils/supabase/client";
import { cn, formatCurrency, slugify } from "@/lib/utils";
import type { Blog, GoogleReview, Order, Product, ProductCategory, Rental } from "@/types";

type Toast = { message: string; tone: "success" | "error" };
type SortDirection = "asc" | "desc";
type ProductImageRow = { image_url: string; sort_order: number | null };
type ProductRow = {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  price: number | string;
  discount: number | string;
  stock: number;
  description: string;
  brand: string | null;
  features: string[] | null;
  is_featured: boolean;
  show_on_homepage: boolean | null;
  is_special_offer: boolean | null;
  is_rental: boolean;
  product_images?: ProductImageRow[];
};
type BlogRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  created_at: string;
};
type RentalRow = {
  id: string;
  product_id: string | null;
  name: string;
  slug: string;
  price_per_day: number | string;
  availability: boolean;
  description: string;
  image_url: string | null;
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
type AdminProduct = Product & { featured?: boolean; showOnHomepage?: boolean; specialOffer?: boolean };
type AdminRental = Rental & { id?: string; name: string; description: string; image: string };
type DraftProduct = {
  id?: string;
  name: string;
  category: ProductCategory;
  price: number;
  discount: number;
  stock: number;
  images: string[];
  description: string;
  featured?: boolean;
  showOnHomepage?: boolean;
  specialOffer?: boolean;
};

const categoryOptions: ProductCategory[] = ["Hospital Equipment", "Mobility Products", "Oxygen on Rent", "Wellness", "Orthocare"];
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
  const images = row.product_images?.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map((image) => image.image_url) ?? [];

  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    category: row.category,
    images: images.length ? images : [defaultImage],
    stock: row.stock,
    discount: Number(row.discount),
    isRental: row.is_rental,
    description: row.description,
    features: row.features ?? [],
    brand: row.brand ?? "Gargi Care",
    featured: row.is_featured,
    showOnHomepage: Boolean(row.show_on_homepage),
    specialOffer: Boolean(row.is_special_offer),
  };
}

function mapRental(row: RentalRow): AdminRental {
  return {
    id: row.id,
    product_id: row.product_id ?? row.id,
    name: row.name,
    price_per_day: Number(row.price_per_day),
    availability: row.availability,
    description: row.description,
    image: row.image_url ?? defaultImage,
  };
}

function mapOrder(row: OrderRow): Order {
  const items = row.order_items?.map((item) => ({
    product: {
      id: item.product_id ?? item.product_name,
      name: item.product_name,
      price: Number(item.unit_price),
      category: "Wellness" as ProductCategory,
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
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    image: row.image_url ?? defaultImage,
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
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<keyof Pick<Product, "name" | "price" | "stock" | "discount">>("name");
  const [direction, setDirection] = useState<SortDirection>("asc");
  const [draft, setDraft] = useState<DraftProduct | null>(null);
  const [viewing, setViewing] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast, show } = useToast();

  const loadProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").select("*, product_images(image_url, sort_order)").order("created_at", { ascending: false });
    if (error) show(cleanError(error), "error");
    else setItems(((data ?? []) as ProductRow[]).map(mapProduct));
    setLoading(false);
  }, [show]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProducts();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadProducts]);

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

  function openAdd() {
    setDraft({ name: "", category: "Wellness", price: 0, discount: 0, stock: 0, images: [], description: "", featured: false, showOnHomepage: false, specialOffer: false });
  }

  function openEdit(product: AdminProduct) {
    setDraft({ id: product.id, name: product.name, category: product.category, price: product.price, discount: product.discount, stock: product.stock, images: product.images, description: product.description, featured: product.featured, showOnHomepage: product.showOnHomepage, specialOffer: product.specialOffer });
  }

  async function saveProduct() {
    if (!draft?.name.trim()) return show("Product name is required", "error");
    if (draft.price <= 0) return show("Price must be greater than 0", "error");
    if (draft.stock < 0) return show("Stock cannot be negative", "error");
    setLoading(true);
    const slug = slugify(draft.name);
    const payload = {
      name: draft.name,
      slug,
      category: draft.category,
      price: draft.price,
      discount: draft.discount,
      stock: draft.stock,
      description: draft.description,
      brand: "Gargi Care",
      features: ["Admin managed product"],
      is_featured: Boolean(draft.featured),
      show_on_homepage: Boolean(draft.showOnHomepage),
      is_special_offer: Boolean(draft.specialOffer),
      is_rental: false,
      is_active: true,
    };
    const result = draft.id
      ? await supabase.from("products").update(payload).eq("id", draft.id).select("id").single()
      : await supabase.from("products").insert(payload).select("id").single();

    if (result.error) {
      setLoading(false);
      return show(cleanError(result.error), "error");
    }

    const productId = result.data.id as string;
    await supabase.from("product_images").delete().eq("product_id", productId);
    const imageRows = (draft.images.length ? draft.images : [defaultImage]).map((image, index) => ({
      product_id: productId,
      image_url: image,
      alt_text: draft.name,
      sort_order: index,
    }));
    const imageResult = await supabase.from("product_images").insert(imageRows);
    if (imageResult.error) show(cleanError(imageResult.error), "error");
    else show("Product saved in Supabase");
    setDraft(null);
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

  async function toggleProductFlag(product: AdminProduct, field: "show_on_homepage" | "is_special_offer") {
    const currentValue = field === "show_on_homepage" ? Boolean(product.showOnHomepage) : Boolean(product.specialOffer);
    const { error } = await supabase.from("products").update({ [field]: !currentValue }).eq("id", product.id);
    if (error) show(cleanError(error), "error");
    else {
      show(field === "show_on_homepage" ? "Homepage visibility updated" : "Special offer updated");
      await loadProducts();
    }
  }

  return (
    <div>
      <ToastView toast={toast} />
      <SectionHeader title="Products" description="Live Supabase product listings, stock, pricing, discounts and images." action={<Button onClick={openAdd}>Add Product</Button>} />
      <div className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_180px_140px]">
        <Input placeholder="Search products" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-3 text-sm">
          <option>All</option>
          {categoryOptions.map((option) => <option key={option}>{option}</option>)}
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
              <tr>{["Name", "Category", "Price", "Stock", "Flags", "Actions"].map((header) => <th key={header} className="px-5 py-3">{header}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="relative h-12 w-12 overflow-hidden rounded-md bg-slate-100"><Image src={product.images[0] ?? defaultImage} alt={product.name} fill className="object-cover" /></div><span className="font-bold text-slate-900">{product.name}</span></div></td>
                  <td className="px-5 py-4">{product.category}</td>
                  <td className="px-5 py-4">{formatCurrency(product.price)}</td>
                  <td className="px-5 py-4"><Badge tone={product.stock > 0 ? "green" : "red"}>{product.stock}</Badge></td>
                  <td className="px-5 py-4"><div className="flex flex-wrap gap-2">{product.discount > 0 ? <Badge tone="amber">{product.discount}% OFF</Badge> : null}{product.featured ? <Badge tone="amber">Featured</Badge> : null}{product.showOnHomepage ? <Badge tone="green">Homepage</Badge> : null}{product.specialOffer ? <Badge tone="green">Special Offer</Badge> : null}</div></td>
                  <td className="px-5 py-4">
                    <details className="relative">
                      <summary className="inline-flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-black text-slate-600 shadow-sm transition hover:bg-slate-50">⋯</summary>
                      <div className="absolute right-0 z-20 mt-2 grid w-56 gap-1 rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
                        <button className="rounded-md px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={() => setViewing(product)}>View</button>
                        <button className="rounded-md px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={() => openEdit(product)}>Edit</button>
                        <button className="rounded-md px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={() => toggleProductFlag(product, "show_on_homepage")}>{product.showOnHomepage ? "Hide from Homepage" : "Show on Homepage"}</button>
                        <button className="rounded-md px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={() => toggleProductFlag(product, "is_special_offer")}>{product.specialOffer ? "Unmark Special Offer" : "Mark Special Offer"}</button>
                        <button className="rounded-md px-3 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50" onClick={() => setDeleting(product)}>Delete</button>
                      </div>
                    </details>
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
            <label className="text-sm font-bold text-slate-700">Category<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as ProductCategory })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm">{categoryOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
            <label className="text-sm font-bold text-slate-700">Price<Input type="number" value={draft.price} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} /></label>
            <label className="text-sm font-bold text-slate-700">Discount<Input type="number" value={draft.discount} onChange={(event) => setDraft({ ...draft, discount: Number(event.target.value) })} /></label>
            <label className="text-sm font-bold text-slate-700">Stock<Input type="number" value={draft.stock} onChange={(event) => setDraft({ ...draft, stock: Number(event.target.value) })} /></label>
            <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:col-span-2 md:grid-cols-3">
              <label className="flex items-center gap-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={Boolean(draft.showOnHomepage)} onChange={(event) => setDraft({ ...draft, showOnHomepage: event.target.checked })} /> Show on Homepage</label>
              <label className="flex items-center gap-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={Boolean(draft.specialOffer)} onChange={(event) => setDraft({ ...draft, specialOffer: event.target.checked })} /> Special Offer</label>
              <label className="flex items-center gap-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={Boolean(draft.featured)} onChange={(event) => setDraft({ ...draft, featured: event.target.checked })} /> Featured</label>
            </div>
            <label className="text-sm font-bold text-slate-700 md:col-span-2">Description<Textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
            <label className="text-sm font-bold text-slate-700 md:col-span-2">Images<Input type="file" accept="image/*" multiple onChange={(event) => readFiles(event.target.files, (images) => setDraft({ ...draft, images }))} /></label>
            {draft.images.length > 0 ? <div className="flex flex-wrap gap-3 md:col-span-2">{draft.images.map((image) => <div key={image} className="relative h-20 w-20 overflow-hidden rounded-md bg-slate-100"><Image src={image} alt="Preview" fill className="object-cover" /></div>)}</div> : null}
            <div className="flex justify-end gap-3 md:col-span-2"><Button variant="ghost" onClick={() => setDraft(null)}>Cancel</Button><Button onClick={saveProduct} disabled={loading}>{loading ? "Saving..." : "Save Product"}</Button></div>
          </div>
        ) : null}
      </Modal>
      <Modal open={Boolean(viewing)} title="Product Details" onClose={() => setViewing(null)}>{viewing ? <div className="space-y-3 text-sm text-slate-700"><p><b>Name:</b> {viewing.name}</p><p><b>Category:</b> {viewing.category}</p><p><b>Description:</b> {viewing.description}</p><p><b>Price:</b> {formatCurrency(viewing.price)}</p></div> : null}</Modal>
      <ConfirmModal open={Boolean(deleting)} title="Delete product?" message={`Delete ${deleting?.name ?? "this product"} from Supabase?`} onCancel={() => setDeleting(null)} onConfirm={deleteProduct} />
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
    const { data, error } = await supabase.from("rentals").select("*").order("created_at", { ascending: false });
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
    setLoading(true);
    const payload = {
      name: draft.name,
      slug: slugify(draft.name),
      price_per_day: draft.price_per_day,
      availability: draft.availability,
      description: draft.description,
      image_url: draft.image,
      is_active: true,
    };
    const { error } = draft.id ? await supabase.from("rentals").update(payload).eq("id", draft.id) : await supabase.from("rentals").insert(payload);
    if (error) show(cleanError(error), "error");
    else {
      setDraft(null);
      show("Rental saved in Supabase");
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
      <SectionHeader title="Rentals" description="Live Supabase rentals, daily pricing and availability." action={<Button onClick={() => setDraft({ product_id: "", name: "", price_per_day: 0, availability: true, description: "", image: defaultImage })}>Add Rental</Button>} />
      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <label className="text-sm font-bold text-slate-700">Rental calculator<Input className="mt-2 max-w-xs" type="number" min={1} value={days} onChange={(event) => setDays(Number(event.target.value))} /></label>
      </div>
      {items.length ? (
        <TableShell>
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500"><tr>{["Product", "Price per day", "Availability", `${days} day estimate`, "Actions"].map((header) => <th key={header} className="px-5 py-3">{header}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((rental) => (
                <tr key={rental.id ?? rental.product_id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-bold text-slate-900">{rental.name}</td>
                  <td className="px-5 py-4">{formatCurrency(rental.price_per_day)}</td>
                  <td className="px-5 py-4"><Badge tone={rental.availability ? "green" : "red"}>{rental.availability ? "Available" : "Unavailable"}</Badge></td>
                  <td className="px-5 py-4 font-bold text-[#047068]">{formatCurrency(days * rental.price_per_day)}</td>
                  <td className="px-5 py-4"><div className="flex gap-2"><Button variant="secondary" onClick={() => setDraft(rental)}>Edit</Button><Button variant="danger" onClick={() => setDeleting(rental)}>Delete</Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      ) : <EmptyState text={loading ? "Loading rentals from Supabase..." : "No rentals in Supabase yet."} />}
      <Modal open={Boolean(draft)} title="Rental Form" onClose={() => setDraft(null)}>{draft ? <div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-bold text-slate-700">Name<Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label><label className="text-sm font-bold text-slate-700">Price per day<Input type="number" value={draft.price_per_day} onChange={(event) => setDraft({ ...draft, price_per_day: Number(event.target.value) })} /></label><label className="flex items-center gap-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={draft.availability} onChange={(event) => setDraft({ ...draft, availability: event.target.checked })} /> Available</label><label className="text-sm font-bold text-slate-700 md:col-span-2">Description<Textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label><label className="text-sm font-bold text-slate-700 md:col-span-2">Image<Input type="file" accept="image/*" onChange={(event) => readFiles(event.target.files, ([image]) => setDraft({ ...draft, image }))} /></label>{draft.image ? <div className="relative h-24 w-32 overflow-hidden rounded-md bg-slate-100"><Image src={draft.image} alt="Rental preview" fill className="object-cover" /></div> : null}<div className="flex justify-end gap-3 md:col-span-2"><Button variant="ghost" onClick={() => setDraft(null)}>Cancel</Button><Button onClick={saveRental} disabled={loading}>{loading ? "Saving..." : "Save Rental"}</Button></div></div> : null}</Modal>
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
    const { data, error } = await supabase.from("blogs").select("*").order("created_at", { ascending: false });
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
    const payload = { title: draft.title, slug: draft.slug || slugify(draft.title), excerpt: draft.excerpt, content: draft.content, image_url: draft.image, is_published: true, published_at: new Date().toISOString() };
    const { error } = draft.id ? await supabase.from("blogs").update(payload).eq("id", draft.id) : await supabase.from("blogs").insert(payload);
    if (error) show(cleanError(error), "error");
    else {
      setDraft(null);
      show("Blog saved in Supabase");
      await loadBlogs();
    }
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
      <SectionHeader title="Blogs" description="Live Supabase educational content for customers." action={<Button onClick={() => setDraft({ id: "", title: "", slug: "", excerpt: "", content: "", image: defaultImage, created_at: new Date().toISOString().slice(0, 10) })}>Add Blog</Button>} />
      {items.length ? <TableShell><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500"><tr>{["Title", "Date", "Actions"].map((header) => <th key={header} className="px-5 py-3">{header}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{items.map((blog) => <tr key={blog.id} className="hover:bg-slate-50"><td className="px-5 py-4 font-bold text-slate-900">{blog.title}</td><td className="px-5 py-4">{blog.created_at}</td><td className="px-5 py-4"><div className="flex gap-2"><Button variant="secondary" onClick={() => setDraft(blog)}>Edit</Button><Button variant="danger" onClick={() => setDeleting(blog)}>Delete</Button></div></td></tr>)}</tbody></table></TableShell> : <EmptyState text={loading ? "Loading blogs from Supabase..." : "No blogs in Supabase yet."} />}
      <Modal open={Boolean(draft)} title="Blog Form" onClose={() => setDraft(null)}>{draft ? <div className="grid gap-4"><label className="text-sm font-bold text-slate-700">Title<Input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value, slug: slugify(event.target.value) })} /></label><div><p className="text-sm font-bold text-slate-700">Content</p><div contentEditable suppressContentEditableWarning onInput={(event) => setDraft({ ...draft, content: event.currentTarget.innerHTML })} className="mt-1 min-h-40 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-[#047068] focus:ring-4 focus:ring-[#047068]/10" dangerouslySetInnerHTML={{ __html: draft.content }} /></div><label className="text-sm font-bold text-slate-700">Image<Input type="file" accept="image/*" onChange={(event) => readFiles(event.target.files, ([image]) => setDraft({ ...draft, image }))} /></label>{draft.image ? <div className="relative h-28 w-44 overflow-hidden rounded-md bg-slate-100"><Image src={draft.image} alt="Blog preview" fill className="object-cover" /></div> : null}<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setDraft(null)}>Cancel</Button><Button onClick={saveBlog} disabled={loading}>{loading ? "Saving..." : "Save Blog"}</Button></div></div> : null}</Modal>
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
