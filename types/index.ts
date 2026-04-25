export type ProductCategory =
  | "Hospital Equipment"
  | "Mobility Products"
  | "Oxygen on Rent"
  | "Wellness"
  | "Orthocare";

export type CommerceProduct = {
  id: string;
  name: string;
  price: number;
  discount: number;
  stock: boolean;
  image: string;
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
  stock: number;
  discount: number;
  isRental: boolean;
  description: string;
  features: string[];
  brand: string;
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
  availability: boolean;
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
