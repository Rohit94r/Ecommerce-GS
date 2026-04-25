import Link from "next/link";
import { cn } from "@/lib/utils";

type Crumb = {
  label: string;
  href?: string;
};

export function CatalogBreadcrumbs({ crumbs, className }: { crumbs: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500", className)}>
      <Link href="/" className="transition hover:text-[#047068]">
        Home
      </Link>
      {crumbs.map((crumb) => (
        <span key={`${crumb.label}-${crumb.href ?? "current"}`} className="flex items-center gap-2">
          <span className="text-slate-300">/</span>
          {crumb.href ? (
            <Link href={crumb.href} className="transition hover:text-[#047068]">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-slate-800">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
