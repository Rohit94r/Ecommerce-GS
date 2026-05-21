import type { ProductOptionGroup } from "@/types";

export function ProductOptionGroups({ groups }: { groups?: ProductOptionGroup[] }) {
  if (!groups?.length) return null;

  return (
    <div className="mt-7 grid gap-4">
      {groups.map((group) => (
        <section key={group.name} className="border-t border-slate-200 pt-4 first:border-t-0 first:pt-0">
          <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">{group.name}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {group.values.map((value) => (
              <span
                key={value.label}
                className={
                  value.available
                    ? "rounded-full border border-[#047068]/25 bg-[#047068]/10 px-3 py-1.5 text-sm font-black text-[#047068]"
                    : "rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-400 line-through"
                }
              >
                {value.label}{value.available ? "" : " (Out)"}
              </span>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
