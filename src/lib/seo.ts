// Centralised SEO constants and JSON-LD factories for wheeloh.com.
// All "freshness" dates are explicit constants here (never fs.mtime, which is
// unreliable on CI where every file shares the checkout timestamp).

export const SITE_URL = "https://wheeloh.com";
export const SITE_NAME = "Wheeloh";
export const SITE_TAGLINE = "Car Spotting App";
export const SITE_DESCRIPTION =
  "Wheeloh is the car-spotting app for enthusiasts. Spot a car with your camera, instantly identify its make and model, collect it in your virtual garage, and share rare finds with a passionate community of spotters.";

export const CONTACT_EMAIL = "contact@wheeloh.com";
export const CONTACT_PHONE = "+33 7 52 05 25 59";

export const APP_STORE_URL =
  "https://apps.apple.com/fr/app/wheeloh-carspotting/id6746037128";
export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.wheeloh.app";
export const STATUS_URL = "https://status.wheeloh.com";

/** Build an absolute URL from a site-relative path. */
export const abs = (path = "/"): string =>
  path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

type JsonLd = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Site-entity schemas (rendered once, on the homepage only)
// ---------------------------------------------------------------------------

export const organizationLd: JsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  legalName: "Wheeloh SAS",
  url: SITE_URL,
  logo: abs("/icon.png"),
  email: CONTACT_EMAIL,
  telephone: CONTACT_PHONE,
  address: {
    "@type": "PostalAddress",
    streetAddress: "155 Boulevard de la Reine, Bâtiment B",
    addressLocality: "Versailles",
    postalCode: "78000",
    addressCountry: "FR",
  },
  sameAs: [APP_STORE_URL, PLAY_STORE_URL, STATUS_URL],
};

export const websiteLd: JsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: ["en", "fr"],
  publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
};

export const mobileAppLd: JsonLd = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "Wheeloh — Car Spotting",
  operatingSystem: "iOS, Android",
  applicationCategory: "LifestyleApplication",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  downloadUrl: [APP_STORE_URL, PLAY_STORE_URL],
  // No aggregateRating: we do not fabricate store ratings (avoids Google penalties).
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
};

// ---------------------------------------------------------------------------
// Reusable helpers
// ---------------------------------------------------------------------------

export interface Crumb {
  name: string;
  path: string;
}

export const breadcrumbLd = (items: Crumb[]): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: abs(item.path),
  })),
});

export const techArticleLd = (opts: {
  headline: string;
  description: string;
  author: string;
  path: string;
  datePublished: string;
  dateModified?: string;
}): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: opts.headline,
  description: opts.description,
  author: { "@type": "Person", name: opts.author },
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    logo: { "@type": "ImageObject", url: abs("/icon.png") },
  },
  datePublished: opts.datePublished,
  dateModified: opts.dateModified ?? opts.datePublished,
  mainEntityOfPage: abs(opts.path),
});

export const articleLd = (opts: {
  headline: string;
  description?: string;
  path: string;
  datePublished: string;
  dateModified?: string;
}): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: opts.headline,
  description: opts.description,
  author: { "@type": "Organization", name: SITE_NAME },
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    logo: { "@type": "ImageObject", url: abs("/icon.png") },
  },
  datePublished: opts.datePublished,
  dateModified: opts.dateModified ?? opts.datePublished,
  mainEntityOfPage: abs(opts.path),
});

// ---------------------------------------------------------------------------
// FAQ — single source of truth shared by the visible section AND the JSON-LD,
// so the on-page text and structured data stay byte-for-byte identical
// (required for FAQ rich-result validation).
// ---------------------------------------------------------------------------

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is Wheeloh?",
    answer:
      "Wheeloh is a mobile car-spotting app for enthusiasts. Point your camera at a car, instantly identify its make and model, add it to your virtual garage, and share rare finds with a community of spotters.",
  },
  {
    question: "Is Wheeloh free to download?",
    answer:
      "Yes. Wheeloh is free on the App Store and Google Play. Create an account and start spotting in minutes.",
  },
  {
    question: "Which devices does Wheeloh support?",
    answer: "Wheeloh is available for iOS (iPhone) and Android phones.",
  },
  {
    question: "How does car identification work?",
    answer:
      "Our smart camera and semantic search match your photo against a database of 22,180 vehicle models to identify the make, model and version.",
  },
  {
    question: "What can I do with my spots?",
    answer:
      "Every spot is saved to your organized garage, plotted on a real-time map, and earns points on the global leaderboard as you compete with friends.",
  },
  {
    question: "How do I become a Wheeloh affiliate?",
    answer:
      "Apply through the affiliate program on the Wheeloh site to unlock an exclusive profile badge and import your own car photos directly into the app.",
  },
];

export const faqLd: JsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};
