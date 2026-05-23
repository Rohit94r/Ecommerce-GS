import type { ProductOptionGroup } from "@/types";

const PRODUCT_OPTIONS_FEATURE_PREFIX = "__product_options_json:";

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

export function getProductOptions(value: unknown, features?: string[] | null): ProductOptionGroup[] {
  const direct = normalizeProductOptions(value);
  if (direct.length) return direct;

  const encoded = features?.find((feature) => feature.startsWith(PRODUCT_OPTIONS_FEATURE_PREFIX));
  return encoded ? normalizeProductOptions(encoded.slice(PRODUCT_OPTIONS_FEATURE_PREFIX.length)) : [];
}

export function cleanProductFeatures(features?: string[] | null) {
  return (features ?? []).filter((feature) => !feature.startsWith(PRODUCT_OPTIONS_FEATURE_PREFIX));
}

export function appendProductOptionsFeature(features: string[], groups: ProductOptionGroup[]) {
  const cleaned = cleanProductFeatures(features);
  const normalized = normalizeProductOptions(groups);
  if (!normalized.length) return cleaned;
  return [...cleaned, `${PRODUCT_OPTIONS_FEATURE_PREFIX}${JSON.stringify(normalized)}`];
}

function parseJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}
