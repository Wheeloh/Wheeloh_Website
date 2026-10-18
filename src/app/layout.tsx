import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import TranslationGuard from "@/components/TranslationGuard";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";

// The v1 / v2 previews exist in `next dev` only, and so does their switcher:
// in a production build this branch is dead code and the import is dropped.
const VersionSwitcher =
  process.env.NODE_ENV === "development" ? dynamic(() => import("@/components/redesign/shared/VersionSwitcher")) : () => null;

// Inter is the original site's typeface; Montserrat (the app's typeface) is
// what the redesign uses, across its full weight range. globals.css picks
// one of them as --font-sans depending on the version being rendered.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Wheeloh — Car Spotting App",
    template: "%s | Wheeloh",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "car spotting",
    "car spotting app",
    "carspotting",
    "carspotting app",
    "car identification",
    "car collection",
    "supercars",
    "automotive",
    "Wheeloh",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    locale: "en_US",
    title: "Wheeloh — Car Spotting App",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Wheeloh — Car Spotting App",
    description: SITE_DESCRIPTION,
  },
  // The app icon (black flag on a white tile), made from the app's own icon.
  // Google needs a square favicon whose size is a multiple of 48 px.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/favicon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <head>
        <link rel="preconnect" href="https://forms.fillout.com" />
        <link rel="dns-prefetch" href="https://forms.fillout.com" />
      </head>
      <body className="font-sans">
        <TranslationGuard />
        <SmoothScroll>{children}</SmoothScroll>
        <VersionSwitcher />
      </body>
    </html>
  );
}
