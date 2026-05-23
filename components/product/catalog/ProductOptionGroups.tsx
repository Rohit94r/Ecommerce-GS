"use client";

import { useMemo, useState } from "react";
import type { ProductOptionGroup } from "@/types";

type ProductOptionGroupsProps = {
  groups?: ProductOptionGroup[];
  selected?: Record<string, string>;
  onChange?: (selected: Record<string, string>) => void;
};

export function getInitialProductOptionSelection(groups?: ProductOptionGroup[]) {
  return Object.fromEntries(
    (groups ?? []).map((group) => [group.name, group.values.find((value) => value.available)?.label ?? ""]),
  );
}

export function ProductOptionGroups({ groups, selected, onChange }: ProductOptionGroupsProps) {
  const initialSelection = useMemo(() => {
    return getInitialProductOptionSelection(groups);
  }, [groups]);
  const [localSelected, setLocalSelected] = useState<Record<string, string>>(initialSelection);
  const currentSelected = selected ?? localSelected;

  if (!groups?.length) return null;

  function selectOption(groupName: string, valueLabel: string) {
    const nextSelected = { ...currentSelected, [groupName]: valueLabel };
    setLocalSelected(nextSelected);
    onChange?.(nextSelected);
  }

  return (
    <div className="mt-7 grid gap-4">
      {groups.map((group) => (
        <section key={group.name} className="border-t border-slate-200 pt-4 first:border-t-0 first:pt-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">Choose {group.name}</h3>
            {currentSelected[group.name] ? <span className="text-xs font-black text-[#047068]">Selected: {currentSelected[group.name]}</span> : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {group.values.map((value) => (
              <button
                key={value.label}
                type="button"
                disabled={!value.available}
                onClick={() => selectOption(group.name, value.label)}
                className={
                  value.available && currentSelected[group.name] === value.label
                    ? "rounded-full border border-[#047068] bg-[#047068] px-3 py-1.5 text-sm font-black text-white shadow-sm"
                    : value.available
                    ? "rounded-full border border-[#047068]/25 bg-[#047068]/10 px-3 py-1.5 text-sm font-black text-[#047068] transition hover:bg-[#047068]/15"
                    : "rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-400 line-through"
                }
              >
                {value.label}{value.available ? "" : " (Out)"}
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
