import type { Product } from "@/types";

export function getSelectedOptionEntries(product: Pick<Product, "selectedOptions">) {
  return Object.entries(product.selectedOptions ?? {})
    .map(([name, value]) => [name.trim(), value.trim()] as const)
    .filter(([name, value]) => name && value)
    .sort(([firstName], [secondName]) => firstName.localeCompare(secondName));
}

export function getSelectedOptionsText(product: Pick<Product, "selectedOptions">) {
  return getSelectedOptionEntries(product)
    .map(([name, value]) => `${name}: ${value}`)
    .join(", ");
}

export function getCartProductKey(product: Pick<Product, "id" | "selectedOptions">) {
  const optionsKey = getSelectedOptionEntries(product)
    .map(([name, value]) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`)
    .join("&");

  return optionsKey ? `${product.id}::${optionsKey}` : product.id;
}

