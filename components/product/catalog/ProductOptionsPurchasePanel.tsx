"use client";

import { useMemo, useState } from "react";
import { CommerceProductActions } from "@/components/product/catalog/CommerceProductActions";
import { getInitialProductOptionSelection, ProductOptionGroups } from "@/components/product/catalog/ProductOptionGroups";
import type { Product, ProductOptionGroup } from "@/types";

function cleanSelectedOptions(selected: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(selected)
      .map(([name, value]) => [name.trim(), value.trim()] as const)
      .filter(([name, value]) => name && value),
  );
}

export function ProductOptionsPurchasePanel({
  groups,
  cartProduct,
  inStock,
}: {
  groups?: ProductOptionGroup[];
  cartProduct: Product;
  inStock: boolean;
}) {
  const [selectedOptions, setSelectedOptions] = useState(() => getInitialProductOptionSelection(groups));
  const cartProductWithOptions = useMemo(
    () => ({
      ...cartProduct,
      selectedOptions: cleanSelectedOptions(selectedOptions),
    }),
    [cartProduct, selectedOptions],
  );

  return (
    <>
      <ProductOptionGroups groups={groups} selected={selectedOptions} onChange={setSelectedOptions} />
      <CommerceProductActions cartProduct={cartProductWithOptions} inStock={inStock} />
    </>
  );
}

