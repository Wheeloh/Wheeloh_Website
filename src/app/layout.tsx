import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
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
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon-ios.png",
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
        <SmoothScroll>{children}</SmoothScroll>
        <VersionSwitcher />
      </body>
    </html>
  );
}
