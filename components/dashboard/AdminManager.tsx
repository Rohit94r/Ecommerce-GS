"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { blogs, orders as seedOrders, products as seedProducts, rentals as seedRentals } from "@/lib/dummyData";
import { cn, formatCurrency, slugify } from "@/lib/utils";
import type { Blog, Order, Product, Rental } from "@/types";

type Toast = { message: string; tone: "success" | "error" };
type SortDirection = "asc" | "desc";
type AdminProduct = Product & { featured?: boolean };
type AdminRental = Rental & { name: string; description: string; image: string };
type DraftProduct = Omit<AdminProduct, "images" | "features" | "isRental" | "brand" | "stock"> & {
  stock: number;
  images: string[];
  description: string;
};

const categoryOptions = ["Hospital Equipment", "Mobility Products", "Oxygen on Rent", "Wellness", "Orthocare"] as const;
const productSeed: AdminProduct[] = seedProducts.map((product, index) => ({ ...product, featured: index < 3 }));
const defaultImage = "/media/hero-care.svg";

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

  function show(message: string, tone: Toast["tone"] = "success") {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 2200);
  }

  return { toast, show };
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-slate-200 bg-white p-10 text-center font-semibold text-slate-500">{text}</div>;
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

export function OverviewAdmin() {
  const totalStock = seedProducts.reduce((sum, product) => sum + product.stock, 0);
  const rentalRevenue = seedRentals.reduce((sum, rental) => sum + rental.price_per_day, 0);

  return (
    <div className="space-y-6">
      <SectionHeader title="Overview" description="A quick operating view of products, rentals, orders and content." />
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Products", seedProducts.length],
          ["Stock Units", totalStock],
          ["Rental SKUs", seedRentals.length],
          ["Open Orders", seedOrders.length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-black text-[#047068]">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <TableShell>
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-xl font-black text-slate-950">Recent orders</h2>
          </div>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
              <tr><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Phone</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {seedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-bold text-slate-800">{order.customer_name}</td>
                  <td className="px-5 py-4">{order.phone}</td>
                  <td className="px-5 py-4">{formatCurrency(order.total_price)}</td>
                  <td className="px-5 py-4"><Badge tone={order.status === "delivered" ? "green" : "amber"}>{order.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Rental pricing</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Current daily rental base across all dummy SKUs.</p>
          <p className="mt-6 text-3xl font-black text-[#047068]">{formatCurrency(rentalRevenue)}/day</p>
        </div>
      </div>
    </div>
  );
}

export function ProductsAdmin() {
  const [items, setItems] = useState<AdminProduct[]>(productSeed);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<keyof Pick<Product, "name" | "price" | "stock" | "discount">>("name");
  const [direction, setDirection] = useState<SortDirection>("asc");
  const [draft, setDraft] = useState<DraftProduct | null>(null);
  const [viewing, setViewing] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast, show } = useToast();

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
    setDraft({ id: `product-${Date.now()}`, name: "", category: "Wellness", price: 0, discount: 0, stock: 0, images: [], description: "", featured: false });
  }

  function openEdit(product: AdminProduct) {
    setDraft({ ...product, images: product.images, stock: product.stock, description: product.description });
  }

  function saveProduct() {
    if (!draft?.name.trim()) return show("Product name is required", "error");
    if (draft.price <= 0) return show("Price must be greater than 0", "error");
    if (draft.stock < 0) return show("Stock cannot be negative", "error");
    setLoading(true);
    window.setTimeout(() => {
      const product: AdminProduct = {
        ...draft,
        images: draft.images.length ? draft.images : [defaultImage],
        stock: Number(draft.stock),
        price: Number(draft.price),
        discount: Number(draft.discount),
        features: ["Admin managed product"],
        isRental: false,
        brand: "Gargi Care",
      };
      setItems((current) => (current.some((item) => item.id === product.id) ? current.map((item) => (item.id === product.id ? product : item)) : [product, ...current]));
      setDraft(null);
      setLoading(false);
      show("Product saved");
    }, 450);
  }

  function deleteProduct() {
    if (!deleting) return;
    setItems((current) => current.filter((item) => item.id !== deleting.id));
    setDeleting(null);
    show("Product deleted");
  }

  return (
    <div>
      <ToastView toast={toast} />
      <SectionHeader title="Products" description="Manage ecommerce product listings, stock, pricing, discounts and product images." action={<Button onClick={openAdd}>Add Product</Button>} />
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
              <tr>{["Name", "Category", "Price", "Stock", "Discount", "Actions"].map((header) => <th key={header} className="px-5 py-3">{header}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="relative h-12 w-12 overflow-hidden rounded-md bg-slate-100"><Image src={product.images[0] ?? defaultImage} alt={product.name} fill className="object-cover" /></div><span className="font-bold text-slate-900">{product.name}</span>{product.featured ? <Badge tone="amber">Featured</Badge> : null}</div></td>
                  <td className="px-5 py-4">{product.category}</td>
                  <td className="px-5 py-4">{formatCurrency(product.price)}</td>
                  <td className="px-5 py-4"><Badge tone={product.stock > 0 ? "green" : "red"}>{product.stock}</Badge></td>
                  <td className="px-5 py-4">{product.discount}%</td>
                  <td className="px-5 py-4"><div className="flex gap-2"><Button variant="ghost" onClick={() => setViewing(product)}>View</Button><Button variant="secondary" onClick={() => openEdit(product)}>Edit</Button><Button variant="danger" onClick={() => setDeleting(product)}>Delete</Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      ) : <EmptyState text="No products match your filters." />}
      <Modal open={Boolean(draft)} title={draft?.name ? "Edit Product" : "Add Product"} onClose={() => setDraft(null)}>
        {draft ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">Name<Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
            <label className="text-sm font-bold text-slate-700">Category<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as Product["category"] })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm">{categoryOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
            <label className="text-sm font-bold text-slate-700">Price<Input type="number" value={draft.price} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} /></label>
            <label className="text-sm font-bold text-slate-700">Discount<Input type="number" value={draft.discount} onChange={(event) => setDraft({ ...draft, discount: Number(event.target.value) })} /></label>
            <label className="text-sm font-bold text-slate-700">Stock<Input type="number" value={draft.stock} onChange={(event) => setDraft({ ...draft, stock: Number(event.target.value) })} /></label>
            <label className="flex items-center gap-3 pt-7 text-sm font-bold text-slate-700"><input type="checkbox" checked={Boolean(draft.featured)} onChange={(event) => setDraft({ ...draft, featured: event.target.checked })} /> Featured product</label>
            <label className="text-sm font-bold text-slate-700 md:col-span-2">Description<Textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
            <label className="text-sm font-bold text-slate-700 md:col-span-2">Images<Input type="file" accept="image/*" multiple onChange={(event) => readFiles(event.target.files, (images) => setDraft({ ...draft, images }))} /></label>
            {draft.images.length > 0 ? <div className="flex flex-wrap gap-3 md:col-span-2">{draft.images.map((image) => <div key={image} className="relative h-20 w-20 overflow-hidden rounded-md bg-slate-100"><Image src={image} alt="Preview" fill className="object-cover" /></div>)}</div> : null}
            <div className="flex justify-end gap-3 md:col-span-2"><Button variant="ghost" onClick={() => setDraft(null)}>Cancel</Button><Button onClick={saveProduct} disabled={loading}>{loading ? "Saving..." : "Save Product"}</Button></div>
          </div>
        ) : null}
      </Modal>
      <Modal open={Boolean(viewing)} title="Product Details" onClose={() => setViewing(null)}>{viewing ? <div className="space-y-3 text-sm text-slate-700"><p><b>Name:</b> {viewing.name}</p><p><b>Category:</b> {viewing.category}</p><p><b>Description:</b> {viewing.description}</p><p><b>Price:</b> {formatCurrency(viewing.price)}</p></div> : null}</Modal>
      <ConfirmModal open={Boolean(deleting)} title="Delete product?" message={`Delete ${deleting?.name ?? "this product"}? This cannot be undone.`} onCancel={() => setDeleting(null)} onConfirm={deleteProduct} />
    </div>
  );
}

export function RentalsAdmin() {
  const rentalSeed: AdminRental[] = seedRentals.map((rental) => {
    const product = seedProducts.find((item) => item.id === rental.product_id);
    return { ...rental, name: product?.name ?? rental.product_id, description: product?.description ?? "", image: product?.images[0] ?? defaultImage };
  });
  const [items, setItems] = useState(rentalSeed);
  const [draft, setDraft] = useState<AdminRental | null>(null);
  const [deleting, setDeleting] = useState<AdminRental | null>(null);
  const [days, setDays] = useState(7);
  const { toast, show } = useToast();

  function saveRental() {
    if (!draft?.name.trim()) return show("Rental name is required", "error");
    if (draft.price_per_day <= 0) return show("Price per day is required", "error");
    setItems((current) => (current.some((item) => item.product_id === draft.product_id) ? current.map((item) => (item.product_id === draft.product_id ? draft : item)) : [draft, ...current]));
    setDraft(null);
    show("Rental saved");
  }

  return (
    <div>
      <ToastView toast={toast} />
      <SectionHeader title="Rentals" description="Manage rental products, daily pricing and availability." action={<Button onClick={() => setDraft({ product_id: `rental-${Date.now()}`, name: "", price_per_day: 0, availability: true, description: "", image: defaultImage })}>Add Rental</Button>} />
      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <label className="text-sm font-bold text-slate-700">Rental calculator<Input className="mt-2 max-w-xs" type="number" min={1} value={days} onChange={(event) => setDays(Number(event.target.value))} /></label>
      </div>
      <TableShell>
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500"><tr>{["Product", "Price per day", "Availability", `${days} day estimate`, "Actions"].map((header) => <th key={header} className="px-5 py-3">{header}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((rental) => (
              <tr key={rental.product_id} className="hover:bg-slate-50">
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
      <Modal open={Boolean(draft)} title="Rental Form" onClose={() => setDraft(null)}>{draft ? <div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-bold text-slate-700">Name<Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label><label className="text-sm font-bold text-slate-700">Price per day<Input type="number" value={draft.price_per_day} onChange={(event) => setDraft({ ...draft, price_per_day: Number(event.target.value) })} /></label><label className="flex items-center gap-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={draft.availability} onChange={(event) => setDraft({ ...draft, availability: event.target.checked })} /> Available</label><label className="text-sm font-bold text-slate-700 md:col-span-2">Description<Textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label><label className="text-sm font-bold text-slate-700 md:col-span-2">Image<Input type="file" accept="image/*" onChange={(event) => readFiles(event.target.files, ([image]) => setDraft({ ...draft, image }))} /></label><div className="flex justify-end gap-3 md:col-span-2"><Button variant="ghost" onClick={() => setDraft(null)}>Cancel</Button><Button onClick={saveRental}>Save Rental</Button></div></div> : null}</Modal>
      <ConfirmModal open={Boolean(deleting)} title="Delete rental?" message={`Delete ${deleting?.name ?? "this rental"}?`} onCancel={() => setDeleting(null)} onConfirm={() => { if (deleting) setItems((current) => current.filter((item) => item.product_id !== deleting.product_id)); setDeleting(null); show("Rental deleted"); }} />
    </div>
  );
}

export function OrdersAdmin() {
  const [items, setItems] = useState<Order[]>(seedOrders);
  const [viewing, setViewing] = useState<Order | null>(null);
  const { toast, show } = useToast();

  function updateStatus(id: string, status: Order["status"]) {
    setItems((current) => current.map((order) => (order.id === id ? { ...order, status } : order)));
    show("Order status updated");
  }

  return (
    <div>
      <ToastView toast={toast} />
      <SectionHeader title="Orders" description="Review customer orders, call customers and update fulfillment status." />
      <TableShell><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500"><tr>{["Customer name", "Phone", "Address", "Product", "Quantity", "Status", "Actions"].map((header) => <th key={header} className="px-5 py-3">{header}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{items.map((order) => <tr key={order.id} className="hover:bg-slate-50"><td className="px-5 py-4 font-bold">{order.customer_name}</td><td className="px-5 py-4">{order.phone}</td><td className="px-5 py-4">{order.address}</td><td className="px-5 py-4">{order.items[0]?.product.name}</td><td className="px-5 py-4">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td><td className="px-5 py-4"><select value={order.status} onChange={(event) => updateStatus(order.id, event.target.value as Order["status"])} className="rounded-md border border-slate-200 px-3 py-2 text-sm"><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></td><td className="px-5 py-4"><div className="flex gap-2"><Button variant="secondary" onClick={() => setViewing(order)}>View details</Button><a href={`tel:${order.phone.replaceAll(" ", "")}`}><Button>Call customer</Button></a></div></td></tr>)}</tbody></table></TableShell>
      <Modal open={Boolean(viewing)} title="Order Details" onClose={() => setViewing(null)}>{viewing ? <div className="space-y-3 text-sm text-slate-700"><p><b>Customer:</b> {viewing.customer_name}</p><p><b>Phone:</b> {viewing.phone}</p><p><b>Address:</b> {viewing.address}</p><p><b>Total:</b> {formatCurrency(viewing.total_price)}</p>{viewing.items.map((item) => <p key={item.product.id}><b>Item:</b> {item.quantity} x {item.product.name}</p>)}</div> : null}</Modal>
    </div>
  );
}

export function BlogsAdmin() {
  const [items, setItems] = useState<Blog[]>(blogs);
  const [draft, setDraft] = useState<Blog | null>(null);
  const [deleting, setDeleting] = useState<Blog | null>(null);
  const { toast, show } = useToast();

  function saveBlog() {
    if (!draft?.title.trim()) return show("Blog title is required", "error");
    const blog = { ...draft, slug: draft.slug || slugify(draft.title), created_at: draft.created_at || new Date().toISOString().slice(0, 10) };
    setItems((current) => (current.some((item) => item.id === blog.id) ? current.map((item) => (item.id === blog.id ? blog : item)) : [blog, ...current]));
    setDraft(null);
    show("Blog saved");
  }

  return (
    <div>
      <ToastView toast={toast} />
      <SectionHeader title="Blogs" description="Create and manage educational content for customers." action={<Button onClick={() => setDraft({ id: `blog-${Date.now()}`, title: "", slug: "", excerpt: "", content: "", image: defaultImage, created_at: new Date().toISOString().slice(0, 10) })}>Add Blog</Button>} />
      <TableShell><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500"><tr>{["Title", "Date", "Actions"].map((header) => <th key={header} className="px-5 py-3">{header}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{items.map((blog) => <tr key={blog.id} className="hover:bg-slate-50"><td className="px-5 py-4 font-bold text-slate-900">{blog.title}</td><td className="px-5 py-4">{blog.created_at}</td><td className="px-5 py-4"><div className="flex gap-2"><Button variant="secondary" onClick={() => setDraft(blog)}>Edit</Button><Button variant="danger" onClick={() => setDeleting(blog)}>Delete</Button></div></td></tr>)}</tbody></table></TableShell>
      <Modal open={Boolean(draft)} title="Blog Form" onClose={() => setDraft(null)}>{draft ? <div className="grid gap-4"><label className="text-sm font-bold text-slate-700">Title<Input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value, slug: slugify(event.target.value) })} /></label><div><p className="text-sm font-bold text-slate-700">Content</p><div contentEditable suppressContentEditableWarning onInput={(event) => setDraft({ ...draft, content: event.currentTarget.innerHTML })} className="mt-1 min-h-40 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-[#047068] focus:ring-4 focus:ring-[#047068]/10" dangerouslySetInnerHTML={{ __html: draft.content }} /></div><label className="text-sm font-bold text-slate-700">Image<Input type="file" accept="image/*" onChange={(event) => readFiles(event.target.files, ([image]) => setDraft({ ...draft, image }))} /></label>{draft.image ? <div className="relative h-28 w-44 overflow-hidden rounded-md bg-slate-100"><Image src={draft.image} alt="Blog preview" fill className="object-cover" /></div> : null}<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setDraft(null)}>Cancel</Button><Button onClick={saveBlog}>Save Blog</Button></div></div> : null}</Modal>
      <ConfirmModal open={Boolean(deleting)} title="Delete blog?" message={`Delete ${deleting?.title ?? "this blog"}?`} onCancel={() => setDeleting(null)} onConfirm={() => { if (deleting) setItems((current) => current.filter((item) => item.id !== deleting.id)); setDeleting(null); show("Blog deleted"); }} />
    </div>
  );
}
