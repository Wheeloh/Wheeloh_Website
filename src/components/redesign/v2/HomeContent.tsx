"use client";

import Header from "@/components/redesign/shared/Header";
import Footer from "@/components/redesign/shared/Footer";
import Preloader from "@/components/redesign/v2/Preloader";
import HeroGalaxy from "@/components/redesign/v2/HeroGalaxy";
import PhoneStory from "@/components/redesign/v2/PhoneStory";
import Collection from "@/components/redesign/v2/Collection";
import Community from "@/components/redesign/v2/Community";
import Affiliate from "@/components/redesign/shared/Affiliate";
import DownloadCta from "@/components/redesign/v2/DownloadCta";
import Faq from "@/components/redesign/shared/Faq";
import Contact from "@/components/redesign/shared/Contact";
import MobileCta from "@/components/redesign/shared/MobileCta";
import type { CollectionData } from "@/lib/collection-shared";

interface LatestUpdate {
  slug: string;
  title: string;
}

interface HomeContentProps {
  latestUpdate?: LatestUpdate;
  collection: CollectionData;
  /** Build-time SVG of the download QR code. */
  qr: string;
  /** Play the first-visit intro (false once the session cookie is set). */
  intro: boolean;
}

// The page follows a spot from the street to the leaderboard:
// viewfinder → the catalogue it searches → the app that takes over →
// the collection → the community → join.
export default function HomeContent({ latestUpdate, collection, qr, intro }: HomeContentProps) {
  return (
    <>
      <Preloader play={intro} />
      <Header showNavLinks />
      <main>
        <HeroGalaxy latestUpdate={latestUpdate} />
        <PhoneStory />
        <Collection data={collection} />
        <Community />
        <Affiliate />
        <DownloadCta qr={qr} />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <MobileCta />
    </>
  );
}
