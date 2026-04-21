import Link from "next/link";
import { business } from "@/lib/dummyData";
import { whatsappLink } from "@/lib/utils";

export function FloatingActions() {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <Link
        href={whatsappLink("Hi Gargi Surgical & Healthcare, I need help with medical equipment in Mumbai.")}
        className="rounded-lg bg-[#25D366] px-4 py-3 text-sm font-black text-white shadow-lg transition hover:translate-y-[-1px]"
        target="_blank"
      >
        WhatsApp
      </Link>
      <Link
        href={`tel:${business.phone.replaceAll(" ", "")}`}
        className="rounded-lg bg-[#047068] px-4 py-3 text-sm font-black text-white shadow-lg transition hover:translate-y-[-1px]"
      >
        Call Now
      </Link>
    </div>
  );
}
