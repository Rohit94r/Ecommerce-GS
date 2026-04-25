import Image from "next/image";

const brandLogos = [
  { src: "/media/logo1.png", alt: "Partner brand logo 1" },
  { src: "/media/logo2.png", alt: "Partner brand logo 2" },
  { src: "/media/logo3.png", alt: "Partner brand logo 3" },
  { src: "/media/logo4.png", alt: "Partner brand logo 4" },
  { src: "/media/logo5.png", alt: "Partner brand logo 5" },
  { src: "/media/logo6.png", alt: "Partner brand logo 6" },
  { src: "/media/logo7.png", alt: "Partner brand logo 7" },
];

export function BrandLogoScroller() {
  const scrollingLogos = [...brandLogos, ...brandLogos];

  return (
    <section className="border-b border-slate-100 bg-white">
      <div className="py-7">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#047068]">Trusted Brands</p>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-xl font-black text-slate-950">Brands available at Gargi Surgical</h2>
              <p className="text-sm font-semibold text-slate-500">Medical, mobility and home-care essentials</p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-slate-50/80 py-5">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-slate-50 to-transparent sm:w-32" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-slate-50 to-transparent sm:w-32" />

          <div className="brand-logo-track flex w-max items-center gap-12 px-8 sm:gap-16 lg:gap-20">
            {scrollingLogos.map((logo, index) => (
              <div
                key={`${logo.src}-${index}`}
                className="grid h-20 w-40 shrink-0 place-items-center transition duration-300 ease-out hover:-translate-y-1 sm:h-24 sm:w-52"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={180}
                  height={90}
                  className="max-h-16 w-auto object-contain sm:max-h-20"
                  sizes="208px"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
