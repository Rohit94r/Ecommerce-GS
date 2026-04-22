import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { CartProvider } from "@/hooks/useCart";
import "@/styles/globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
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
      className={`${inter.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-900">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
