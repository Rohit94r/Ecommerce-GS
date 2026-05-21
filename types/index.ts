export type ProductCategory =
  | "Mobility"
  | "Personal Hygiene"
  | "Surgical"
  | "Digital Monitoring"
  | "Orthopedic";

export type ProductMedia = {
  type: "image" | "video";
  url: string;
};

export type CommerceProduct = {
  id: string;
  name: string;
  price: number;
  discount: number;
  stock: boolean;
  image: string;
  images?: string[];
  videos?: string[];
  media?: ProductMedia[];
  description?: string;
  features?: string[];
  brand?: string;
};

export type CommerceSubcategory = {
  name: string;
  slug: string;
  products: CommerceProduct[];
};

export type CommerceCategory = {
  name: string;
  slug: string;
  description: string;
  image: string;
  subcategories: CommerceSubcategory[];
};

export type Product = {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  images: string[];
  videos?: string[];
  media?: ProductMedia[];
  detailHref?: string;
  stock: number;
  discount: number;
  isRental: boolean;
  description: string;
  features: string[];
  brand: string;
  showOnHomepage?: boolean;
  specialOffer?: boolean;
  featured?: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Order = {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  items: CartItem[];
  total_price: number;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
};

export type Rental = {
  product_id: string;
  price_per_day: number;
  price_per_week?: number;
  price_per_month?: number;
  availability: boolean;
  category?: string;
};

export type Blog = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  created_at: string;
};

export type Testimonial = {
  id: string;
  name: string;
  area: string;
  quote: string;
  rating: number;
};

export type GoogleReview = {
  id: string;
  reviewer_name: string;
  area: string;
  rating: number;
  review: string;
  source: string;
  is_featured: boolean;
  created_at: string;
};
