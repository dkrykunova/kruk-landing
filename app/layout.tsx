import type { Metadata, Viewport } from "next";
import { Commissioner } from "next/font/google";
import localFont from "next/font/local";
import { Consent } from "@/components/Consent";
import { content } from "@/content/uk";
import { config } from "@/lib/config";
import "./globals.css";

const commissioner = Commissioner({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-commissioner",
  display: "swap",
});

// Nyght Serif — Максим Кобузан, SIL OFL 1.1 (app/fonts/OFL-NyghtSerif.txt)
const nyght = localFont({
  src: [
    { path: "./fonts/NyghtSerif-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/NyghtSerif-RegularItalic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/NyghtSerif-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/NyghtSerif-MediumItalic.woff2", weight: "500", style: "italic" },
  ],
  variable: "--font-nyght",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: content.meta.title,
  description: content.meta.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: content.meta.title,
    description: content.meta.description,
    url: "/",
    siteName: "Крук",
    locale: "uk_UA",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#fffdf0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${commissioner.variable} ${nyght.variable}`}>
      <body>
        {children}
        <Consent />
      </body>
    </html>
  );
}
