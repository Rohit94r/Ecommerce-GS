import { products } from "@/lib/dummyData";
import type { ProductCategory } from "@/types";

export function useProducts({ category, maxPrice }: { category?: ProductCategory | "All"; maxPrice?: number } = {}) {
  return products.filter((product) => {
    const categoryMatch = !category || category === "All" || product.category === category;
    const priceMatch = !maxPrice || product.price <= maxPrice;
    return categoryMatch && priceMatch;
  });
}
