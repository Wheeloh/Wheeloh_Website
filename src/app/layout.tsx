import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import VersionSwitcher from "@/components/redesign/shared/VersionSwitcher";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";

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
