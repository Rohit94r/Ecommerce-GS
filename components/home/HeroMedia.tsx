import Image from "next/image";

const slides = [
  {
    src: "/media/hero-care.svg",
    alt: "Hospital bed prepared for a comfortable home recovery setup",
  },
  {
    src: "/media/hero-monitoring.svg",
    alt: "Doctor guiding a patient through dependable healthcare support",
  },
  {
    src: "/media/hero-mobility.svg",
    alt: "Mobility equipment ready for daily patient care",
  },
];

export function HeroMedia() {
  return (
    <div className="hero-slider group relative aspect-[4/3] overflow-hidden rounded-2xl bg-white shadow-2xl shadow-[#047068]/15">
      {slides.map((slide, index) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={index === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="hero-slide object-cover"
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/30 via-transparent to-[#047068]/30" />
      <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-white/20 bg-white/85 p-4 shadow-lg shadow-slate-900/10 backdrop-blur-md">
        <p className="text-sm font-bold text-slate-950">Home-care support, handled with care</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          Beds, oxygen support and mobility essentials arranged across Mumbai.
        </p>
      </div>
    </div>
  );
}
