import Image from "next/image";
import { LinkButton } from "@/components/ui/Button";

const heroBanners = [
  {
    src: "/media/Home-banner1.jpeg",
    alt: "Gargi Surgical and Healthcare home banner",
    position: "center",
  },
  {
    src: "/media/Home-banner2.png",
    alt: "Medical equipment product banner",
    position: "center",
  },
  {
    src: "/media/Home-banner3.png",
    alt: "Healthcare products and support banner",
    position: "center",
  },
];

const sliderBanners = [...heroBanners, heroBanners[0]];

export function HeroBanner() {
  return (
    <section className="overflow-hidden bg-white">
      <div className="relative w-full overflow-hidden bg-white">
        <div className="hero-banner-track flex h-full w-[400%]">
          {sliderBanners.map((banner, index) => (
            <div key={`${banner.src}-${index}`} className="relative aspect-[16/7] min-h-[260px] w-1/4 shrink-0 bg-white sm:min-h-[360px] lg:min-h-[520px]">
              <Image
                src={banner.src}
                alt={banner.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-contain"
                style={{ objectPosition: banner.position }}
              />
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {heroBanners.map((banner, index) => (
            <span
              key={`${banner.src}-dot`}
              className={`h-2.5 w-2.5 rounded-full bg-white shadow-md shadow-slate-950/20 ${index === 0 ? "hero-banner-dot-one" : index === 1 ? "hero-banner-dot-two" : "hero-banner-dot-three"}`}
            />
          ))}
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-col justify-center gap-3 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
        <LinkButton href="/products">Browse Equipment</LinkButton>
        <LinkButton href="/rentals" variant="secondary">Rent Equipment</LinkButton>
      </div>
    </section>
  );
}
