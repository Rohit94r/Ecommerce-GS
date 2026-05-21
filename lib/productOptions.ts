import type { ProductOptionGroup } from "@/types";

export const PRODUCT_OPTION_PRESETS: ProductOptionGroup[] = [
  {
    name: "Size",
    values: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"].map((label) => ({ label, available: true })),
  },
  {
    name: "Chair Dimensions",
    values: [
      "Seat width",
      "Overall width",
      "Height",
      "Weight capacity",
      "Foldable size",
    ].map((label) => ({ label, available: true })),
  },
];

export function normalizeProductOptions(value: unknown): ProductOptionGroup[] {
  const parsed = typeof value === "string" ? parseJson(value) : value;
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((group) => {
      if (!group || typeof group !== "object") return null;
      const source = group as { name?: unknown; values?: unknown };
      const name = typeof source.name === "string" ? source.name.trim() : "";
      const values = Array.isArray(source.values)
        ? source.values
            .map((item) => {
              if (typeof item === "string") {
                const label = item.trim();
                return label ? { label, available: true } : null;
              }
              if (!item || typeof item !== "object") return null;
              const option = item as { label?: unknown; available?: unknown };
              const label = typeof option.label === "string" ? option.label.trim() : "";
              return label ? { label, available: option.available !== false } : null;
            })
            .filter((item): item is { label: string; available: boolean } => Boolean(item))
        : [];

      return name && values.length ? { name, values } : null;
    })
    .filter((group): group is ProductOptionGroup => Boolean(group));
}

function parseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}
