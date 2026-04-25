import { categories, commerceProductImages } from "@/lib/dummyData";
import type { CommerceCategory, CommerceProduct, CommerceSubcategory, Product } from "@/types";

const productCopy: Record<string, { description: string; features: string[]; brand: string }> = {
  wc1: {
    description:
      "A practical foldable wheelchair for home recovery, clinic visits and comfortable daily movement. The compact frame is easy to store and simple for caregivers to handle.",
    features: ["Foldable frame for easy transport", "Comfortable daily-use seating", "Reliable brakes for caregiver control", "Same Day / Next Day Delivery Available"],
    brand: "Gargi Care",
  },
  wc2: {
    description:
      "Electric wheelchair support for patients who need more independence across indoor and assisted outdoor movement.",
    features: ["Powered movement support", "Comfort-focused seating", "Useful for longer recovery periods", "Guidance available before purchase"],
    brand: "Gargi Care",
  },
  bp1: {
    description:
      "A simple digital blood pressure monitor for everyday home readings with a clear display and easy operation.",
    features: ["Clear digital display", "Home monitoring friendly", "Compact storage", "Warranty and usage guidance"],
    brand: "Omron",
  },
  ox1: {
    description:
      "Compact pulse oximeter for quick SpO2 and pulse checks at home, clinics or while monitoring recovery.",
    features: ["Fast SpO2 reading", "Lightweight body", "Easy one-button use", "Suitable for home care kits"],
    brand: "Gargi Care",
  },
  ad1: {
    description:
      "Comfortable adult diaper pants for daily hygiene support, overnight care and patient recovery routines.",
    features: ["Soft absorbent core", "Easy pull-up fit", "Odour control support", "Suitable for home-care use"],
    brand: "Gargi Care",
  },
  ad2: {
    description:
      "Disposable underpads that help protect beds, chairs and recovery spaces during hygiene care.",
    features: ["Leak protection layer", "Soft top sheet", "Useful for patient beds", "Quick disposal after use"],
    brand: "Gargi Care",
  },
  bd1: {
    description:
      "Gentle baby diaper pants for everyday comfort, quick changes and dependable leakage protection.",
    features: ["Soft waist fit", "Absorbent core", "Easy changing", "Comfortable for daily use"],
    brand: "Gargi Care",
  },
  sg1: {
    description:
      "Latex examination gloves for clinics, dressing changes, hygiene routines and general medical handling.",
    features: ["Textured grip", "Flexible latex fit", "Clinic and home-care friendly", "Box packing available"],
    brand: "Gargi Surgical",
  },
  sg2: {
    description:
      "Powder-free nitrile gloves for reliable protection during medical, hygiene and cleaning tasks.",
    features: ["Powder-free finish", "Latex-free material", "Strong puncture resistance", "Comfortable for longer use"],
    brand: "Gargi Surgical",
  },
  dp1: {
    description:
      "Sterile gauze swabs for dressing changes, wound cleaning and clinic supply requirements.",
    features: ["Sterile packing", "Soft cotton feel", "Useful for wound care", "Bulk order support"],
    brand: "Gargi Surgical",
  },
  dp2: {
    description:
      "Medical adhesive tape for securing dressings, tubes and light support wraps.",
    features: ["Reliable adhesion", "Easy to tear", "Gentle daily use", "Works with common dressings"],
    brand: "Gargi Surgical",
  },
  ks1: {
    description:
      "Adjustable knee support for mild strain, daily movement support and post-injury comfort.",
    features: ["Adjustable compression", "Breathable fabric", "Daily wear comfort", "Multiple size guidance available"],
    brand: "Tynor",
  },
  ks2: {
    description:
      "Hinged knee brace for stronger joint support during recovery, walking and controlled movement.",
    features: ["Side hinge stability", "Adjustable straps", "Better movement confidence", "Useful after injury guidance"],
    brand: "Tynor",
  },
  bs1: {
    description:
      "Lumbar support belt for lower-back comfort, posture support and everyday recovery needs.",
    features: ["Firm lumbar support", "Adjustable fit", "Breathable body", "Useful for long sitting hours"],
    brand: "Tynor",
  },
  bs2: {
    description:
      "Posture corrector belt designed to support shoulder alignment and reduce slouching during daily routines.",
    features: ["Adjustable shoulder straps", "Lightweight design", "Daily posture support", "Easy to wear under clothing"],
    brand: "Gargi Care",
  },
  th1: {
    description:
      "Simple digital thermometer for quick temperature checks at home, clinics and travel health kits.",
    features: ["Fast reading", "Compact body", "Easy digital display", "Suitable for family use"],
    brand: "Gargi Care",
  },
  th2: {
    description:
      "Infrared forehead thermometer for contactless temperature screening at home, clinics and workplaces.",
    features: ["Contactless reading", "Fast forehead scan", "Clear backlit display", "Useful for frequent checks"],
    brand: "Gargi Care",
  },
};

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getSubcategory(categorySlug: string, subcategorySlug: string) {
  const category = getCategory(categorySlug);
  const subcategory = category?.subcategories.find((item) => item.slug === subcategorySlug);
  return category && subcategory ? { category, subcategory } : null;
}

export function getCommerceProduct(categorySlug: string, subcategorySlug: string, id: string) {
  const result = getSubcategory(categorySlug, subcategorySlug);
  const product = result?.subcategory.products.find((item) => item.id === id);
  return result && product ? { ...result, product } : null;
}

export function getCommerceProductImages(product: CommerceProduct) {
  return commerceProductImages[product.id] ?? [product.image];
}

export function getCommerceProductDescription(product: CommerceProduct) {
  return productCopy[product.id]?.description ?? `${product.name} from Gargi Surgical & Healthcare, selected for dependable home and clinical care.`;
}

export function getCommerceProductFeatures(product: CommerceProduct) {
  return productCopy[product.id]?.features ?? ["Quality checked before dispatch", "Support available on call", "Same Day / Next Day Delivery Available"];
}

export function toCartProduct(product: CommerceProduct, category: CommerceCategory, subcategory: CommerceSubcategory): Product {
  return {
    id: product.id,
    name: product.name,
    price: Math.round(product.price - (product.price * product.discount) / 100),
    category: "Wellness",
    images: getCommerceProductImages(product),
    stock: product.stock ? 10 : 0,
    discount: product.discount,
    isRental: false,
    description: getCommerceProductDescription(product),
    features: getCommerceProductFeatures(product),
    brand: productCopy[product.id]?.brand ?? `${category.name} ${subcategory.name}`,
  };
}
