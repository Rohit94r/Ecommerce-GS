"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { business } from "@/lib/dummyData";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import { createClient } from "@/utils/supabase/client";
import { isAdminEmail } from "@/lib/admin";

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
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { count } = useCart();
  const supabase = useMemo(() => createClient(), []);
  const isAdmin = isAdminEmail(userEmail);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUserEmail(data.user?.email ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  async function logout() {
    await supabase.auth.signOut();
    setUserEmail(null);
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-sm shadow-slate-900/[0.03] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label={`${business.name} home`}>
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#047068] text-lg font-black text-white shadow-md shadow-[#047068]/20">GS</span>
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
          {userEmail ? (
            <Link href="/account" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              Account
            </Link>
          ) : (
            <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              Login
            </Link>
          )}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          {isAdmin ? <LinkButton href="/dashboard" variant="secondary">Dashboard</LinkButton> : null}
          {userEmail ? (
            <Button onClick={logout} variant="secondary">Logout</Button>
          ) : (
            <LinkButton href="/signup" variant="secondary">Create Account</LinkButton>
          )}
          <LinkButton href="/products">Browse Equipment</LinkButton>
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
            {userEmail ? (
              <>
                <Link href="/account" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 font-semibold text-slate-700">
                  Account
                </Link>
                {isAdmin ? (
                  <Link href="/dashboard" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 font-semibold text-[#047068]">
                    Dashboard
                  </Link>
                ) : null}
                <button onClick={logout} className="rounded-lg px-3 py-3 text-left font-semibold text-slate-700">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 font-semibold text-slate-700">
                  Login
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 font-semibold text-slate-700">
                  Create Account
                </Link>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
