import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { business } from "@/lib/dummyData";
import { whatsappLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Gargi Surgical & Healthcare for medical equipment Mumbai, oxygen cylinder Mumbai and rentals.",
};

export default function ContactPage() {
  return (
    <SiteShell>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#047068]">Contact</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight text-slate-950">Speak with a healthcare equipment specialist</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">Call, WhatsApp or send a request for hospital equipment, mobility products, oxygen on rent and orthocare support.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton href={`tel:${business.phone.replaceAll(" ", "")}`}>Click to call</LinkButton>
            <LinkButton href={whatsappLink("Hi Gargi Surgical & Healthcare, I need assistance.")} target="_blank" variant="secondary">WhatsApp</LinkButton>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a
              href={whatsappLink("Hi Gargi Surgical & Healthcare, I need help choosing medical equipment.")}
              target="_blank"
              className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <span className="text-sm font-black uppercase tracking-[0.16em] text-emerald-600">WhatsApp support</span>
              <span className="mt-2 block text-xl font-black text-slate-950">Quick product help</span>
              <span className="mt-2 block text-sm leading-6 text-slate-600">Share your requirement and get a practical recommendation.</span>
            </a>
            <a
              href={`tel:${business.phone.replaceAll(" ", "")}`}
              className="rounded-xl border border-[#047068]/20 bg-[#047068]/10 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <span className="text-sm font-black uppercase tracking-[0.16em] text-[#047068]">Talk to us</span>
              <span className="mt-2 block text-xl font-black text-slate-950">Call for urgent needs</span>
              <span className="mt-2 block text-sm leading-6 text-slate-600">Best for same day delivery, rentals and patient setup questions.</span>
            </a>
          </div>
          <div className="mt-8 rounded-md border border-[#047068]/15 bg-white p-6 shadow-sm">
            <h2 className="font-black text-slate-950">Business hours</h2>
            <p className="mt-2 text-slate-600">{business.hours}</p>
            <p className="mt-2 text-slate-600">{business.address}</p>
            <p className="mt-2 text-slate-600">
              <a href={`mailto:${business.email}`} className="font-bold text-[#047068]">{business.email}</a>
            </p>
          </div>
        </div>
        <div className="rounded-md border border-[#047068]/15 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">Send enquiry</h2>
          <form className="mt-5 grid gap-4">
            <Input placeholder="Full name" aria-label="Full name" />
            <Input placeholder="Phone number" aria-label="Phone number" />
            <Textarea placeholder="Tell us what you need" aria-label="Message" />
            <Button type="button">Submit enquiry</Button>
          </form>
          <div className="relative mt-6 overflow-hidden rounded-md border border-[#047068]/15">
            <iframe title="Gargi Surgical & Healthcare location map" src={business.mapsEmbed} className="h-72 w-full" loading="lazy" />
            <a
              href={business.mapsUrl}
              target="_blank"
              className="absolute inset-0"
              aria-label="Open Gargi Surgical & Healthcare on Google Maps"
            />
            <span className="absolute bottom-4 left-4 rounded-lg bg-white px-4 py-2 text-sm font-black text-[#047068] shadow-md">
              Open in Google Maps
            </span>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
