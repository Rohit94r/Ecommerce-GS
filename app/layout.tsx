import type { Metadata } from "next";
import { Libre_Baskerville, Noto_Sans } from "next/font/google";
import { CartProvider } from "@/hooks/useCart";
import "@/styles/globals.css";

const notoSans = Noto_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gargisurgical.example"),
  title: {
    default: "Gargi Surgical & Healthcare | Medical Equipment Mumbai",
    template: "%s | Gargi Surgical & Healthcare",
  },
  description:
    "Hospital equipment, wheelchair on rent Mumbai services, oxygen cylinder Mumbai support, wellness and orthocare products.",
  keywords: ["Medical equipment Mumbai", "Wheelchair on rent Mumbai", "Oxygen cylinder Mumbai"],
  openGraph: {
    title: "Gargi Surgical & Healthcare",
    description: "Trusted medical equipment, rentals and healthcare products in Mumbai.",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${notoSans.variable} ${libreBaskerville.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#f6faf9] text-slate-900">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
