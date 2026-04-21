"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { business } from "@/lib/dummyData";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/rentals", label: "Rentals" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label={`${business.name} home`}>
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#047068] text-lg font-black text-white">GS</span>
          <span>
            <span className="block text-sm font-black leading-4 text-slate-950 sm:text-base">{business.name}</span>
            <span className="text-xs font-semibold text-slate-500">Medical equipment Mumbai</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-[#047068]",
                pathname === link.href && "bg-[#047068]/10 text-[#047068]",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/cart" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
            Cart ({count})
          </Link>
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <LinkButton href={`tel:${business.phone.replaceAll(" ", "")}`} variant="secondary">
            Call Now
          </LinkButton>
          <LinkButton href="/products">Shop Now</LinkButton>
        </div>
        <Button className="lg:hidden" onClick={() => setOpen((value) => !value)} variant="secondary" aria-label="Toggle menu">
          Menu
        </Button>
      </div>
      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          <nav className="grid gap-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 font-semibold text-slate-700">
                {link.label}
              </Link>
            ))}
            <Link href="/cart" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 font-semibold text-slate-700">
              Cart ({count})
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
