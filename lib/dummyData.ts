import type { Blog, Order, Product, ProductCategory, Rental, Testimonial } from "@/types";

export const business = {
  name: "Gargi Surgical & Healthcare",
  location: "Mumbai, India",
  phone: "+91 98921 68180",
  whatsapp: "+91 98921 68180",
  email: "gargihealthcaresales@gmail.com",
  address: "Shop no-6, Shree Vallabh Building, Mathuradas Road, Kandivali, Bhagat Colony, Kandivali West, Mumbai, Maharashtra 400067",
  hours: "Open every day: 9:00 AM - 10:00 PM",
  mapsUrl: "https://maps.app.goo.gl/n9ysXs9ueYqJaEnk9",
  mapsEmbed:
    "https://www.google.com/maps?q=Shop%20no-6%2C%20Shree%20Vallabh%20Building%2C%20Mathuradas%20Road%2C%20Kandivali%20West%2C%20Mumbai%2C%20Maharashtra%20400067&output=embed",
};

export const serviceCategories: { name: ProductCategory; description: string }[] = [
  { name: "Hospital Equipment", description: "Beds, monitors, suction machines and clinical essentials." },
  { name: "Mobility Products", description: "Wheelchairs, walkers, rollators and patient transfer support." },
  { name: "Oxygen on Rent", description: "Oxygen concentrators and cylinders for home-care needs." },
  { name: "Wellness", description: "Daily health monitoring, recovery and home wellness products." },
  { name: "Orthocare", description: "Braces, supports, belts and post-operative care products." },
];

export const categories: import("@/types").CommerceCategory[] = [
  {
    name: "Mobility",
    slug: "mobility",
    description: "Wheelchairs, walkers and daily movement support for safer home recovery.",
    image: "/media/mobility.png",
    subcategories: [
      {
        name: "Wheelchairs",
        slug: "wheelchairs",
        products: [],
      },
      {
        name: "Walkers",
        slug: "walkers",
        products: [],
      },
    ],
  },

  {
    name: "Personal Hygiene",
    slug: "personal-hygiene",
    description: "Reliable hygiene essentials for adults, babies and everyday care routines.",
    image: "/media/Personal-hygiene.png",
    subcategories: [
      {
        name: "Adult Diapers",
        slug: "adult-diapers",
        products: [],
      },
      {
        name: "Baby Diapers",
        slug: "baby-diapers",
        products: [],
      },
    ],
  },

  {
    name: "Surgical",
    slug: "surgical",
    description: "Sterile surgical consumables, gloves and dressing support for clinics and homes.",
    image: "/media/Surgical.png",
    subcategories: [
      {
        name: "Gloves",
        slug: "gloves",
        products: [],
      },
      {
        name: "Dressing Products",
        slug: "dressing",
        products: [],
      },
    ],
  },

  {
    name: "Orthopedic",
    slug: "orthopedic",
    description: "Knee, back and joint support products for recovery and everyday comfort.",
    image: "/media/orthopedic.png",
    subcategories: [
      {
        name: "Knee Support",
        slug: "knee-support",
        products: [],
      },
      {
        name: "Back Support",
        slug: "back-support",
        products: [],
      },
    ],
  },

  {
    name: "Digital Monitoring",
    slug: "digital-monitoring",
    description: "BP monitors, oximeters and home devices for daily health checks.",
    image: "/media/digital-monitoring.png",
    subcategories: [
      {
        name: "Blood Pressure Monitor",
        slug: "bp-monitor",
        products: [],
      },
      {
        name: "Oximeter",
        slug: "oximeter",
        products: [],
      },
      {
        name: "Thermometer",
        slug: "thermometer",
        products: [],
      },
    ],
  },
];

export const commerceProductImages: Record<string, string[]> = {
  wc1: [
    "/media/product-mobility.svg",
    "/media/hero-mobility.svg",
  ],
  wc2: [
    "/media/hero-mobility.svg",
    "/media/product-mobility.svg",
  ],
  bp1: [
    "/media/product-monitoring.svg",
    "/media/hero-monitoring.svg",
  ],
  ox1: [
    "/media/product-monitoring.svg",
    "/media/hero-monitoring.svg",
  ],
  ad1: [
    "/media/product-hygiene.svg",
    "/media/hero-care.svg",
  ],
  ad2: [
    "/media/product-hygiene.svg",
    "/media/hero-care.svg",
  ],
  bd1: [
    "/media/product-hygiene.svg",
    "/media/hero-care.svg",
  ],
  sg1: [
    "/media/product-surgical.svg",
    "/media/hero-care.svg",
  ],
  sg2: [
    "/media/product-surgical.svg",
    "/media/hero-care.svg",
  ],
  dp1: [
    "/media/product-surgical.svg",
    "/media/hero-care.svg",
  ],
  dp2: [
    "/media/product-surgical.svg",
    "/media/hero-care.svg",
  ],
  ks1: [
    "/media/product-orthopedic.png",
    "/media/hero-care.svg",
  ],
  ks2: [
    "/media/product-orthopedic.png",
    "/media/hero-care.svg",
  ],
  bs1: [
    "/media/product-orthopedic.png",
    "/media/hero-care.svg",
  ],
  bs2: [
    "/media/product-orthopedic.png",
    "/media/hero-care.svg",
  ],
  th1: [
    "/media/product-monitoring.svg",
    "/media/hero-monitoring.svg",
  ],
  th2: [
    "/media/product-monitoring.svg",
    "/media/hero-monitoring.svg",
  ],
};

export const products: Product[] = [];

export const rentals: Rental[] = [];

export const blogs: Blog[] = [];

export const testimonials: Testimonial[] = [
  { id: "t1", name: "Neha Shah", area: "Andheri", quote: "Fast delivery and very clear guidance for oxygen concentrator setup.", rating: 5 },
  { id: "t2", name: "Amit Mehta", area: "Borivali", quote: "The wheelchair rental was clean, sturdy and arrived the same day.", rating: 5 },
  { id: "t3", name: "Farah Khan", area: "Bandra", quote: "Reliable team for home-care equipment and follow-up support.", rating: 5 },
];

export const partnerBrands = ["Omron", "Tynor", "Philips", "KosmoCare", "Hospitech", "Gargi Care"];

export const orders: Order[] = [];

export function getProduct(id: string) {
  return products.find((product) => product.id === id);
}

export function getRentalProduct(id: string) {
  const product = getProduct(id);
  const rental = rentals.find((item) => item.product_id === id);
  return product && rental ? { product, rental } : null;
}

export function getBlog(slug: string) {
  return blogs.find((blog) => blog.slug === slug);
}
