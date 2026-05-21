"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { ProductMedia } from "@/types";

export function ProductMediaGallery({ media, productName }: { media: ProductMedia[]; productName: string }) {
  const items = useMemo(() => (media.length ? media : [{ type: "image" as const, url: "/media/Home-banner2.png" }]), [media]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const active = items[Math.min(activeIndex, items.length - 1)];
  const activeIsDataUrl = active.type === "image" && active.url.startsWith("data:");

  function selectMedia(index: number) {
    setActiveIndex(index);
    setZoom(1);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[76px_1fr]">
      <div className="order-2 grid grid-flow-col auto-cols-[64px] gap-3 overflow-x-auto pb-2 lg:order-1 lg:grid-flow-row lg:auto-cols-auto lg:grid-cols-1 lg:overflow-visible lg:pb-0">
        {items.map((item, index) => (
          <button
            key={`${item.url}-${index}`}
            type="button"
            onClick={() => selectMedia(index)}
            className={`relative h-16 w-16 overflow-hidden rounded-lg border bg-white p-1 transition ${activeIndex === index ? "border-[#047068] ring-2 ring-[#047068]/20" : "border-slate-200 hover:border-[#047068]/50"}`}
            aria-label={`Show ${item.type} ${index + 1}`}
          >
            {item.type === "video" ? (
              <>
                <video src={item.url} muted playsInline preload="metadata" className="h-full w-full rounded-md object-cover" />
                <span className="absolute inset-0 grid place-items-center bg-slate-950/20 text-xs font-black text-white">Play</span>
              </>
            ) : (
              <Image src={item.url} alt={`${productName} thumbnail ${index + 1}`} fill sizes="64px" className="object-contain p-1" />
            )}
          </button>
        ))}
      </div>

      <div className="order-1 lg:order-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {active.type === "video" ? (
            <video
              key={active.url}
              src={active.url}
              autoPlay
              muted
              loop
              playsInline
              controls
              className="h-full w-full bg-slate-950 object-contain"
            />
          ) : (
            <Image
              key={active.url}
              src={active.url}
              alt={productName}
              fill
              priority={!activeIsDataUrl}
              unoptimized={activeIsDataUrl}
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="object-contain p-5 transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
            />
          )}
        </div>

        {active.type === "image" ? (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700">
            <span>Zoom {Math.round(zoom * 100)}%</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setZoom((value) => Math.max(1, Number((value - 0.25).toFixed(2))))} className="h-9 rounded-md border border-slate-200 px-3 hover:bg-slate-50">
                -
              </button>
              <button type="button" onClick={() => setZoom(1)} className="h-9 rounded-md border border-slate-200 px-3 hover:bg-slate-50">
                Reset
              </button>
              <button type="button" onClick={() => setZoom((value) => Math.min(2.5, Number((value + 0.25).toFixed(2))))} className="h-9 rounded-md border border-slate-200 px-3 hover:bg-slate-50">
                +
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
