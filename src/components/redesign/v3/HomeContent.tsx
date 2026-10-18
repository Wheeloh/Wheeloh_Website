"use client";

import Header from "@/components/redesign/shared/Header";
import Footer from "@/components/redesign/shared/Footer";
import Affiliate from "@/components/redesign/shared/Affiliate";
import Faq from "@/components/redesign/shared/Faq";
import Contact from "@/components/redesign/shared/Contact";
import MobileCta from "@/components/redesign/shared/MobileCta";
import AppCta from "@/components/redesign/shared/AppCta";
import Hero from "./Hero";
import Features from "./Features";
import Community from "./Community";
import DownloadBand from "./DownloadBand";

interface HomeContentProps {
  latestUpdate?: { slug: string; title: string };
  /** Build-time SVG of the download QR code. */
  qr: string;
}

// v3: a white page from top to bottom, the app's own black kept for the
// phones, the buttons and the closing download band + footer. Nothing pins
// the scroll; every section animates in place as it comes into view.
export default function HomeContent({ latestUpdate, qr }: HomeContentProps) {
  return (
    <>
      <Header showNavLinks />
      <main>
        <Hero latestUpdate={latestUpdate} />
        <Features />
        {/* a download prompt between the two long sections */}
        <div className="bg-snow">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
            <AppCta variant="inline" campaign="home_features" />
          </div>
        </div>
        <Community />
        <Affiliate />
        <Faq />
        <Contact />
        <DownloadBand qr={qr} />
      </main>
      <Footer />
      <MobileCta />
    </>
  );
}
