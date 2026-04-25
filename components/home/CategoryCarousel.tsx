"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import type { CommerceCategory } from "@/types";

const categoryImages: Record<string, string> = {
  mobility: "/media/Home-banner1.jpeg",
  "personal-hygiene": "/media/Personal-hygiene.png",
  surgical: "/media/Surgical.png",
  orthopedic: "/media/orthopedic.png",
  "digital-monitoring": "/media/Home-banner3.png",
};

export function CategoryCarousel({ categories }: { categories: CommerceCategory[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function move(direction: "prev" | "next") {
    const track = trackRef.current;
    if (!track) return;

    const card = track.querySelector<HTMLElement>("[data-category-card]");
    const distance = card ? card.offsetWidth + 24 : 420;
    track.scrollBy({ left: direction === "next" ? distance : -distance, behavior: "smooth" });
  }

  return (
    <div>
      <div
        ref={trackRef}
        className="category-carousel flex snap-x gap-6 overflow-x-auto pb-5 pt-2"
        aria-label="Product categories"
      >
        {categories.map((category, index) => {
          const productCount = category.subcategories.reduce((total, subcategory) => total + subcategory.products.length, 0);
          const image = categoryImages[category.slug] ?? category.image;

          return (
            <Link
              key={category.slug}
              href={`/products/${category.slug}`}
              data-category-card
              className="group relative min-h-[500px] w-[84vw] shrink-0 snap-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-900/5 transition duration-300 ease-out hover:-translate-y-1 hover:border-[#047068]/25 hover:shadow-2xl hover:shadow-[#047068]/10 sm:w-[420px] lg:w-[440px]"
              style={{ marginTop: index % 2 === 1 ? "1.5rem" : undefined }}
            >
              <div className="relative h-64 overflow-hidden bg-slate-100 sm:h-72">
                <Image
                  src={image}
                  alt={`${category.name} category`}
                  fill
                  sizes="(max-width: 768px) 84vw, 440px"
                  className="object-cover transition duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-950/5 to-transparent" />
                <span className="absolute bottom-5 left-5 rounded-full bg-white px-4 py-2 text-sm font-black text-[#047068] shadow-md">
                  {category.subcategories.length} sections
                </span>
              </div>
              <div className="p-7">
                <h3 className="text-2xl font-black text-slate-950 transition group-hover:text-[#047068]">{category.name}</h3>
                <p className="mt-4 min-h-24 text-lg leading-8 text-slate-600">{category.description}</p>
                <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5">
                  <span className="text-base font-black text-slate-500">
                    {productCount > 0 ? `${productCount} products listed` : "Ask for availability"}
                  </span>
                  <span className="rounded-full bg-[#047068]/10 px-4 py-2 text-base font-black text-[#047068] transition group-hover:bg-[#047068] group-hover:text-white">
                    Browse
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="mt-2 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => move("prev")}
          className="grid h-11 w-11 place-items-center rounded-full border border-[#047068]/20 bg-white text-xl font-black text-[#047068] shadow-sm transition hover:scale-105 hover:bg-[#eef8f6]"
          aria-label="Previous categories"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => move("next")}
          className="grid h-11 w-11 place-items-center rounded-full bg-[#047068] text-xl font-black text-white shadow-sm shadow-[#047068]/20 transition hover:scale-105 hover:bg-[#035d57]"
          aria-label="Next categories"
        >
          ›
        </button>
      </div>
    </div>
  );
}
