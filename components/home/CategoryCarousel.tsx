"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import type { CommerceCategory } from "@/types";

const categoryImages: Record<string, string> = {
  mobility: "/media/mobility.png",
  "personal-hygiene": "/media/Personal-hygiene.png",
  surgical: "/media/Surgical.png",
  orthopedic: "/media/orthopedic.png",
  "digital-monitoring": "/media/digital-monitoring.png",
};

export function CategoryCarousel({ categories }: { categories: CommerceCategory[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const loopedCategories = [...categories, ...categories, ...categories];

  const getLoopWidth = useCallback((track: HTMLDivElement) => {
    return track.scrollWidth / 3;
  }, []);

  const normalizeLoop = useCallback((track: HTMLDivElement) => {
    const loopWidth = getLoopWidth(track);
    if (!loopWidth) return;

    if (track.scrollLeft >= loopWidth * 2) {
      track.scrollLeft -= loopWidth;
    } else if (track.scrollLeft <= loopWidth * 0.25) {
      track.scrollLeft += loopWidth;
    }
  }, [getLoopWidth]);

  function move(direction: "prev" | "next") {
    const track = trackRef.current;
    if (!track) return;

    pausedRef.current = true;
    if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
    normalizeLoop(track);

    const card = track.querySelector<HTMLElement>("[data-category-card]");
    const distance = card ? card.offsetWidth + 24 : 420;
    const target = track.scrollLeft + (direction === "next" ? distance : -distance);
    track.scrollTo({ left: target, behavior: "smooth" });

    resumeTimerRef.current = window.setTimeout(() => {
      normalizeLoop(track);
      pausedRef.current = false;
    }, 700);
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    track.scrollLeft = getLoopWidth(track);

    const tick = () => {
      if (!pausedRef.current) {
        track.scrollLeft += 0.45;
        normalizeLoop(track);
      }

      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
    };
  }, [getLoopWidth, normalizeLoop]);

  return (
    <div>
      <div
        ref={trackRef}
        className="category-carousel flex gap-6 overflow-x-auto pb-5 pt-2"
        aria-label="Product categories"
        onMouseEnter={() => {
          pausedRef.current = true;
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
        }}
        onPointerDown={() => {
          pausedRef.current = true;
        }}
        onPointerUp={() => {
          pausedRef.current = false;
        }}
        onScroll={(event) => normalizeLoop(event.currentTarget)}
      >
        {loopedCategories.map((category, index) => {
          const productCount = category.subcategories.reduce((total, subcategory) => total + subcategory.products.length, 0);
          const image = categoryImages[category.slug] ?? category.image;

          return (
            <Link
              key={`${category.slug}-${index}`}
              href={`/products/${category.slug}`}
              data-category-card
              className="group relative min-h-[500px] w-[84vw] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-900/5 transition duration-300 ease-out hover:-translate-y-1 hover:border-[#047068]/25 hover:shadow-2xl hover:shadow-[#047068]/10 sm:w-[420px] lg:w-[440px]"
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
