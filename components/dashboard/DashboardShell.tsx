"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/rentals", label: "Rentals" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/blogs", label: "Blogs" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="h-fit rounded-md border border-[#047068]/15 bg-white p-4 shadow-sm lg:sticky lg:top-24">
          <h2 className="px-3 text-lg font-black text-slate-950">Admin Dashboard</h2>
          <p className="mt-1 px-3 text-xs font-semibold text-slate-500">Gargi Surgical & Healthcare</p>
          <nav className="mt-4 grid gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-[#047068]/10 hover:text-[#047068]",
                  pathname === item.href && "bg-[#047068] text-white hover:bg-[#047068] hover:text-white",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <section>{children}</section>
      </div>
    </div>
  );
}
