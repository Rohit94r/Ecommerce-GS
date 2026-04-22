import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-[#047068] text-white shadow-sm shadow-[#047068]/20 hover:bg-[#035d57] hover:shadow-lg hover:shadow-[#047068]/20",
  secondary: "border border-[#047068]/20 bg-white text-[#047068] shadow-sm shadow-slate-900/5 hover:bg-[#eef8f6] hover:shadow-md hover:shadow-[#047068]/10",
  ghost: "text-slate-700 hover:bg-slate-100",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  variant?: Variant;
};

const base =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition duration-300 ease-out hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-[#047068]/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100";

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return <button className={cn(base, variants[variant], className)} {...props} />;
}

export function LinkButton({ className, variant = "primary", href, children, ...props }: LinkButtonProps) {
  return (
    <Link className={cn(base, variants[variant], className)} href={href} {...props}>
      {children}
    </Link>
  );
}
