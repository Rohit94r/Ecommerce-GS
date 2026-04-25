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

export const categories = [
  {
    name: "Mobility",
    slug: "mobility",
    description: "Wheelchairs, walkers and daily movement support for safer home recovery.",
    image: "/media/product-mobility.svg",
    subcategories: [
      {
        name: "Wheelchairs",
        slug: "wheelchairs",
        products: [
          {
            id: "wc1",
            name: "Foldable Wheelchair",
            price: 8500,
            discount: 10,
            stock: true,
            image: "/media/hero-care.svg",
          },
          {
            id: "wc2",
            name: "Electric Wheelchair",
            price: 45000,
            discount: 5,
            stock: true,
            image: "/media/hero-care.svg",
          },
        ],
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
    image: "/media/product-hygiene.svg",
    subcategories: [
      {
        name: "Adult Diapers",
        slug: "adult-diapers",
        products: [
          {
            id: "ad1",
            name: "Adult Diaper Pants Large",
            price: 799,
            discount: 12,
            stock: true,
            image: "/media/hero-care.svg",
          },
          {
            id: "ad2",
            name: "Underpads for Bed Protection",
            price: 499,
            discount: 8,
            stock: true,
            image: "/media/hero-care.svg",
          },
        ],
      },
      {
        name: "Baby Diapers",
        slug: "baby-diapers",
        products: [
          {
            id: "bd1",
            name: "Baby Diaper Pants Medium",
            price: 649,
            discount: 10,
            stock: true,
            image: "/media/hero-care.svg",
          },
        ],
      },
    ],
  },

  {
    name: "Surgical",
    slug: "surgical",
    description: "Sterile surgical consumables, gloves and dressing support for clinics and homes.",
    image: "/media/product-surgical.svg",
    subcategories: [
      {
        name: "Gloves",
        slug: "gloves",
        products: [
          {
            id: "sg1",
            name: "Latex Examination Gloves",
            price: 550,
            discount: 7,
            stock: true,
            image: "/media/hero-care.svg",
          },
          {
            id: "sg2",
            name: "Nitrile Powder-Free Gloves",
            price: 690,
            discount: 9,
            stock: true,
            image: "/media/hero-care.svg",
          },
        ],
      },
      {
        name: "Dressing Products",
        slug: "dressing",
        products: [
          {
            id: "dp1",
            name: "Sterile Gauze Swabs",
            price: 299,
            discount: 5,
            stock: true,
            image: "/media/hero-care.svg",
          },
          {
            id: "dp2",
            name: "Medical Adhesive Tape",
            price: 180,
            discount: 0,
            stock: true,
            image: "/media/hero-care.svg",
          },
        ],
      },
    ],
  },

  {
    name: "Orthopedic",
    slug: "orthopedic",
    description: "Knee, back and joint support products for recovery and everyday comfort.",
    image: "/media/product-orthopedic.png",
    subcategories: [
      {
        name: "Knee Support",
        slug: "knee-support",
        products: [
          {
            id: "ks1",
            name: "Adjustable Knee Support",
            price: 899,
            discount: 10,
            stock: true,
            image: "/media/hero-care.svg",
          },
          {
            id: "ks2",
            name: "Hinged Knee Brace",
            price: 1699,
            discount: 12,
            stock: true,
            image: "/media/hero-care.svg",
          },
        ],
      },
      {
        name: "Back Support",
        slug: "back-support",
        products: [
          {
            id: "bs1",
            name: "Lumbar Support Belt",
            price: 1199,
            discount: 10,
            stock: true,
            image: "/media/hero-care.svg",
          },
          {
            id: "bs2",
            name: "Posture Corrector Belt",
            price: 999,
            discount: 15,
            stock: true,
            image: "/media/hero-care.svg",
          },
        ],
      },
    ],
  },

  {
    name: "Digital Monitoring",
    slug: "digital-monitoring",
    description: "BP monitors, oximeters and home devices for daily health checks.",
    image: "/media/product-monitoring.svg",
    subcategories: [
      {
        name: "Blood Pressure Monitor",
        slug: "bp-monitor",
        products: [
          {
            id: "bp1",
            name: "Digital BP Monitor",
            price: 1999,
            discount: 15,
            stock: true,
            image: "/media/hero-care.svg",
          },
        ],
      },
      {
        name: "Oximeter",
        slug: "oximeter",
        products: [
          {
            id: "ox1",
            name: "Pulse Oximeter",
            price: 999,
            discount: 20,
            stock: true,
            image: "/media/hero-care.svg",
          },
        ],
      },
      {
        name: "Thermometer",
        slug: "thermometer",
        products: [
          {
            id: "th1",
            name: "Digital Thermometer",
            price: 249,
            discount: 5,
            stock: true,
            image: "/media/hero-care.svg",
          },
          {
            id: "th2",
            name: "Infrared Forehead Thermometer",
            price: 1499,
            discount: 18,
            stock: true,
            image: "/media/hero-care.svg",
          },
        ],
      },
    ],
  },
] satisfies import("@/types").CommerceCategory[];

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

export const products: Product[] = [
  {
    id: "oxygen-concentrator-5l",
    name: "5L Oxygen Concentrator",
    price: 42500,
    category: "Oxygen on Rent",
    images: [
      "/media/hero-care.svg",
      "/media/hero-care.svg",
    ],
    stock: 8,
    discount: 10,
    isRental: true,
    description:
      "Compact oxygen concentrator for reliable home oxygen support with flow control and low-noise operation.",
    features: ["5 litre flow capacity", "Low noise compressor", "Home setup guidance", "Same Day / Next Day Delivery Available"],
    brand: "Philips Respironics",
  },
  {
    id: "folding-wheelchair",
    name: "Premium Folding Wheelchair",
    price: 8900,
    category: "Mobility Products",
    images: [
      "/media/hero-care.svg",
      "/media/hero-care.svg",
    ],
    stock: 14,
    discount: 15,
    isRental: true,
    description:
      "Lightweight wheelchair with foldable frame, cushioned seat and attendant brakes for indoor and outdoor movement.",
    features: ["Foldable steel frame", "Attendant brakes", "Comfortable seat", "Easy transport in cars"],
    brand: "KosmoCare",
  },
  {
    id: "hospital-bed",
    name: "Semi Fowler Hospital Bed",
    price: 24500,
    category: "Hospital Equipment",
    images: [
      "/media/hero-care.svg",
      "/media/hero-care.svg",
    ],
    stock: 5,
    discount: 8,
    isRental: true,
    description:
      "Durable semi fowler bed for patient care at home or clinics, supplied with side rails and mattress options.",
    features: ["Manual backrest adjustment", "Powder coated frame", "Optional mattress", "Bulk order support"],
    brand: "Gargi Care",
  },
  {
    id: "bp-monitor",
    name: "Digital Blood Pressure Monitor",
    price: 2290,
    category: "Wellness",
    images: [
      "/media/hero-care.svg",
      "/media/hero-care.svg",
    ],
    stock: 22,
    discount: 12,
    isRental: false,
    description:
      "Easy-to-use BP monitor with clear display, memory function and accurate readings for regular home checks.",
    features: ["Automatic inflation", "Large display", "Memory storage", "Warranty support"],
    brand: "Omron",
  },
  {
    id: "knee-brace",
    name: "Adjustable Knee Brace",
    price: 1450,
    category: "Orthocare",
    images: [
      "/media/hero-care.svg",
      "/media/hero-care.svg",
    ],
    stock: 0,
    discount: 5,
    isRental: false,
    description:
      "Adjustable orthopaedic knee support for injury recovery, ligament support and everyday movement confidence.",
    features: ["Adjustable straps", "Breathable fabric", "Joint stabilization", "Multiple sizes"],
    brand: "Tynor",
  },
  {
    id: "suction-machine",
    name: "Portable Suction Machine",
    price: 12900,
    category: "Hospital Equipment",
    images: [
      "/media/hero-care.svg",
      "/media/hero-care.svg",
    ],
    stock: 6,
    discount: 7,
    isRental: false,
    description:
      "Portable suction machine for clinical and home-care use with easy cleaning and strong suction performance.",
    features: ["Portable body", "Reusable jar", "Easy pressure control", "Service support in Mumbai"],
    brand: "Hospitech",
  },
];

export const rentals: Rental[] = [
  { product_id: "oxygen-concentrator-5l", price_per_day: 550, availability: true },
  { product_id: "folding-wheelchair", price_per_day: 120, availability: true },
  { product_id: "hospital-bed", price_per_day: 350, availability: true },
];

export const blogs: Blog[] = [
  {
    id: "blog-oxygen-care",
    title: "How to Choose Oxygen Support for Home Care in Mumbai",
    slug: "choose-oxygen-support-home-care-mumbai",
    excerpt: "A practical guide to concentrators, cylinders and delivery planning for families.",
    image: "/media/hero-care.svg",
    created_at: "2026-03-10",
    content:
      "Choosing oxygen support starts with the doctor's prescribed flow rate, duration of use and backup needs. Oxygen concentrators are ideal for steady home use, while cylinders are useful as backup or for movement. Families in Mumbai should also consider lift access, power backup and Same Day / Next Day Delivery Available options before confirming equipment.",
  },
  {
    id: "blog-wheelchair-rent",
    title: "Wheelchair on Rent Mumbai: What to Check Before Booking",
    slug: "wheelchair-on-rent-mumbai-checklist",
    excerpt: "Comfort, brakes, seat width and delivery are the biggest rental checks.",
    image: "/media/hero-care.svg",
    created_at: "2026-02-21",
    content:
      "When renting a wheelchair, confirm seat width, folding frame, brake condition and whether the chair is suitable for indoor, outdoor or post-surgery use. For Mumbai homes, check doorway width and building access before delivery.",
  },
  {
    id: "blog-medical-equipment",
    title: "Medical Equipment Mumbai: Building a Safe Home Recovery Setup",
    slug: "medical-equipment-mumbai-home-recovery",
    excerpt: "Hospital beds, oxygen, mobility and monitoring products that support recovery.",
    image: "/media/hero-care.svg",
    created_at: "2026-01-18",
    content:
      "A safe home recovery setup usually combines a patient bed, mobility support, prescribed oxygen equipment and daily monitoring products. Keep walkways clear, place essentials near the patient and choose equipment that can be serviced locally.",
  },
];

export const testimonials: Testimonial[] = [
  { id: "t1", name: "Neha Shah", area: "Andheri", quote: "Fast delivery and very clear guidance for oxygen concentrator setup.", rating: 5 },
  { id: "t2", name: "Amit Mehta", area: "Borivali", quote: "The wheelchair rental was clean, sturdy and arrived the same day.", rating: 5 },
  { id: "t3", name: "Farah Khan", area: "Bandra", quote: "Reliable team for home-care equipment and follow-up support.", rating: 5 },
];

export const partnerBrands = ["Omron", "Tynor", "Philips", "KosmoCare", "Hospitech", "Gargi Care"];

export const orders: Order[] = [
  {
    id: "ORD-1024",
    customer_name: "Ramesh Nair",
    phone: "+91 98765 43210",
    address: "Powai, Mumbai",
    items: [{ product: products[1], quantity: 1 }],
    total_price: 8900,
    status: "confirmed",
  },
  {
    id: "ORD-1025",
    customer_name: "Priya Desai",
    phone: "+91 99887 77665",
    address: "Dadar, Mumbai",
    items: [{ product: products[3], quantity: 2 }],
    total_price: 4580,
    status: "pending",
  },
];

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
