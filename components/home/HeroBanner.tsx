import Image from "next/image";
import { LinkButton } from "@/components/ui/Button";

const heroBanners = [
  {
    src: "/media/Home-banner.jpeg",
    alt: "Medical equipment banner with hospital and home-care products",
    position: "center",
  },
  {
    src: "/media/Mobility-Products.png",
    alt: "Mobility products banner with wheelchair and home-care equipment",
    position: "center",
  },
];

const sliderBanners = [...heroBanners, heroBanners[0]];

export function HeroBanner() {
  return (
    <section className="overflow-hidden bg-white">
      <div className="relative h-[38vw] min-h-[300px] max-h-[620px] overflow-hidden bg-white">
        <div className="hero-banner-track flex h-full w-[300%]">
          {sliderBanners.map((banner, index) => (
            <div key={`${banner.src}-${index}`} className="relative h-full w-1/3 shrink-0 bg-white">
              <Image
                src={banner.src}
                alt={banner.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: banner.position }}
              />
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {heroBanners.map((banner, index) => (
            <span
              key={`${banner.src}-dot`}
              className={`h-2.5 w-2.5 rounded-full bg-white shadow-md shadow-slate-950/20 ${index === 0 ? "hero-banner-dot-one" : "hero-banner-dot-two"}`}
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
