import type { Metadata, Viewport } from "next";
import { Commissioner } from "next/font/google";
import localFont from "next/font/local";
import { Consent } from "@/components/Consent";
import { content } from "@/content/uk";
import { CONSENT_KEY, GA_ID, PIXEL_ID } from "@/lib/analytics";
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
  // og:title/og:url не задаємо тут: інакше сторінки без власних openGraph успадкують дані головної. Соцмережі беруть <title> і опис сторінки.
  openGraph: {
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
      <head>
        {GA_ID && (
          <>
            {/* Google tag у режимі згоди (Consent Mode v2): без «Прийняти» cookies не ставляться. */}
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
var g="denied";try{if(localStorage.getItem("${CONSENT_KEY}")==="granted")g="granted"}catch(e){}
gtag("consent","default",{analytics_storage:g,ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"});
gtag("js",new Date());gtag("config","${GA_ID}");`,
              }}
            />
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
          </>
        )}
        {PIXEL_ID && (
          // Meta Pixel: до «Прийняти» згода відкликана — дані в Meta не надсилаються.
          <script
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
var m=false;try{m=localStorage.getItem("${CONSENT_KEY}")==="granted"}catch(e){}
fbq('consent',m?'grant':'revoke');fbq('init','${PIXEL_ID}');fbq('track','PageView');`,
            }}
          />
        )}
      </head>
      <body>
        {children}
        <Consent />
      </body>
    </html>
  );
}
