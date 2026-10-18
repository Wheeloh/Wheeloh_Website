// Centralised SEO constants and JSON-LD factories for wheeloh.com.
// All "freshness" dates are explicit constants (here and in lib/routes.ts),
// never fs.mtime or git dates, which are unreliable on CI.
import type { Locale } from "@/lib/i18n";

export const SITE_URL = "https://wheeloh.com";
export const SITE_NAME = "Wheeloh";
export const SITE_TAGLINE = "Car Spotting App";

// Kept under 155 chars (search engines truncate meta descriptions around 155-160).
export const SITE_DESCRIPTIONS: Record<Locale, string> = {
  en: "Wheeloh is the car spotting app: photograph a car, identify it in seconds, score it by rarity and collect it in your garage. Free on iPhone and Android.",
  fr: "Wheeloh, l'app de carspotting : photographie une voiture, identifie-la en quelques secondes et gagne des points selon sa rareté. Gratuite, iOS et Android.",
};
export const SITE_DESCRIPTION = SITE_DESCRIPTIONS.en;

export const CONTACT_EMAIL = "contact@wheeloh.com";
export const CONTACT_PHONE = "+33 7 52 05 25 59";

export const APP_STORE_URL =
  "https://apps.apple.com/fr/app/wheeloh-carspotting/id6746037128";
export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.wheeloh.app";
export const STATUS_URL = "https://status.wheeloh.com";
export const INSTAGRAM_URL = "https://www.instagram.com/wheeloh_app";
export const TIKTOK_URL = "https://www.tiktok.com/@bywheeloh";
export const LINKEDIN_URL = "https://www.linkedin.com/company/wheeloh";

/**
 * The numbers the site quotes about the app, in one place so the home, the
 * FAQ, the feature pages and llms.txt never disagree (answer engines repeat
 * whichever figure they find). Source: the app's car database
 * (functions/lib/wheeloh/data, Oct 2026) and its collection catalogue
 * (public/car-brands/data.json).
 */
export const FACTS = {
  /** Car database used to identify a spot. */
  dbBrands: 150,
  dbModels: 1680,
  dbVersions: 23000,
  dbFirstYear: 1904,
  /** The collection a spotter completes ("catalogue Wheeloh"). */
  catalogueModels: 1154,
  catalogueBrands: 74,
  catalogueCountries: 14,
  /** Countries where the app is on the stores. */
  storeCountries: 9,
  /** Points scale of the scoring formula. */
  minPoints: 40,
  maxPoints: 3000,
  tuningBonus: 25,
} as const;

export const STORE_COUNTRIES: Record<Locale, string> = {
  en: "France, Belgium, Switzerland, Luxembourg, the Netherlands, the UK, the US, Canada and Australia",
  fr: "France, Belgique, Suisse, Luxembourg, Pays-Bas, Royaume-Uni, États-Unis, Canada et Australie",
};

/** Build an absolute URL from a site-relative path. */
export const abs = (path = "/"): string =>
  path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

/** The app icon (black flag on a white tile), 512 px: Google's logo for the
 * Organization. Made from the app's own icon; reads on white and on dark. */
export const LOGO_URL = abs("/icon-512.png");

type JsonLd = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Site-entity schemas (rendered once per language, on the home pages)
// ---------------------------------------------------------------------------

/** Canonical @id for the Wheeloh Organization node, referenced by every
 * other JSON-LD block's `publisher`/`author` so Google/LLM knowledge-graph
 * consolidation doesn't have to infer these are the same entity. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const APP_ID = `${SITE_URL}/#app`;

export const organizationLd: JsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: SITE_NAME,
  alternateName: ["Wheeloh Carspotting", "Wheeloh SAS"],
  legalName: "Wheeloh SAS",
  description: "Wheeloh SAS publishes Wheeloh, the car spotting app for iPhone and Android.",
  url: SITE_URL,
  logo: LOGO_URL,
  email: CONTACT_EMAIL,
  telephone: CONTACT_PHONE,
  address: {
    "@type": "PostalAddress",
    streetAddress: "155 Boulevard de la Reine, Bâtiment B",
    addressLocality: "Versailles",
    postalCode: "78000",
    addressCountry: "FR",
  },
  knowsAbout: ["Car spotting", "Carspotting", "Car identification", "Automotive photography"],
  sameAs: [APP_STORE_URL, PLAY_STORE_URL, INSTAGRAM_URL, TIKTOK_URL, LINKEDIN_URL],
};

export const websiteLd: JsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  alternateName: "Wheeloh Carspotting",
  url: SITE_URL,
  inLanguage: ["en", "fr"],
  publisher: { "@type": "Organization", "@id": ORGANIZATION_ID, name: SITE_NAME, url: SITE_URL },
};

const FEATURES: Record<Locale, string[]> = {
  en: [
    "Car identification from a photo (make, model, version)",
    "Points by performance, price and rarity, +25% for modified cars",
    "Garage sorted into brand albums",
    "Collection of 1,154 models to complete",
    "Map of your spots and community spot zones",
    "Global and friends leaderboards",
    "Licence plates erased on the phone",
    "Car meets, clubs, chat and Instagram stories",
    "Guess the car photo game",
  ],
  fr: [
    "Identification d'une voiture en photo (marque, modèle, version)",
    "Points selon la performance, le prix et la rareté, +25 % pour les voitures modifiées",
    "Garage trié en albums par marque",
    "Collection de 1 154 modèles à compléter",
    "Carte de tes spots et zones de spots de la communauté",
    "Classements mondial et entre amis",
    "Plaques d'immatriculation effacées sur le téléphone",
    "Rassos, clubs, messagerie et stories Instagram",
    "Jeu photo Devine la caisse",
  ],
};

export const mobileAppLdFor = (locale: Locale): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  "@id": APP_ID,
  name: "Wheeloh — Carspotting",
  alternateName: ["Wheeloh", "Wheeloh Car Spotting App"],
  operatingSystem: "iOS 16.6+, Android",
  // Matches the category the app is filed under on both stores.
  applicationCategory: "SocialNetworkingApplication",
  applicationSubCategory: locale === "fr" ? "Carspotting" : "Car spotting",
  inLanguage: ["fr", "en"],
  url: SITE_URL,
  description: SITE_DESCRIPTIONS[locale],
  featureList: FEATURES[locale],
  screenshot: abs("/opengraph-image"),
  downloadUrl: [APP_STORE_URL, PLAY_STORE_URL],
  installUrl: [APP_STORE_URL, PLAY_STORE_URL],
  // No aggregateRating: the stores hold too few ratings to quote yet.
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  publisher: { "@type": "Organization", "@id": ORGANIZATION_ID, name: SITE_NAME, url: SITE_URL },
});
export const mobileAppLd = mobileAppLdFor("en");

/**
 * Merge the latest changelog entry's version/date into the app's JSON-LD, so
 * it always reflects the real shipped version instead of going stale.
 * Extracts "1.2.1" out of a title like "Wheeloh v1.2.1 — ...".
 */
export const withLatestRelease = (
  entry: { title: string; slug: string; iso: string },
  locale: Locale = "en",
): JsonLd => {
  const version = entry.title.match(/v?(\d+(?:\.\d+){1,2})/i)?.[1];
  return {
    ...mobileAppLdFor(locale),
    ...(version ? { softwareVersion: version } : {}),
    releaseNotes: abs(`/changelog/${entry.slug}`),
    dateModified: entry.iso,
  };
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

const publisherLd = {
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: SITE_NAME,
  logo: { "@type": "ImageObject", url: LOGO_URL },
};

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
  image: abs("/opengraph-image"),
  author: { "@type": "Person", name: opts.author },
  publisher: publisherLd,
  datePublished: opts.datePublished,
  dateModified: opts.dateModified ?? opts.datePublished,
  mainEntityOfPage: abs(opts.path),
  inLanguage: "en",
});

export const articleLd = (opts: {
  headline: string;
  description?: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  locale?: Locale;
}): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: opts.headline,
  description: opts.description,
  image: abs("/opengraph-image"),
  author: { "@type": "Organization", "@id": ORGANIZATION_ID, name: SITE_NAME },
  publisher: publisherLd,
  datePublished: opts.datePublished,
  dateModified: opts.dateModified ?? opts.datePublished,
  mainEntityOfPage: abs(opts.path),
  inLanguage: opts.locale ?? "en",
});

/** A feature or guide page: what it is about, and that the app is its subject. */
export const webPageLd = (opts: {
  name: string;
  description: string;
  path: string;
  locale: Locale;
  dateModified: string;
  about?: string;
}): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: opts.name,
  description: opts.description,
  url: abs(opts.path),
  inLanguage: opts.locale,
  dateModified: opts.dateModified,
  isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
  ...(opts.about
    ? { about: { "@type": "Thing", name: opts.about } }
    : { about: { "@type": "MobileApplication", "@id": APP_ID, name: "Wheeloh" } }),
  publisher: { "@type": "Organization", "@id": ORGANIZATION_ID, name: SITE_NAME },
});

// ---------------------------------------------------------------------------
// FAQ — single source of truth shared by the visible section AND the JSON-LD,
// so the on-page text and structured data stay identical. (Google no longer
// shows FAQ rich results; the markup still describes the visible Q&A for the
// other engines and assistants that read it.)
// ---------------------------------------------------------------------------

export interface FaqItem {
  question: string;
  answer: string;
  /** Optional "read more" link shown under the answer (not part of its text). */
  link?: { href: string; label: string };
}

export const faqPageLd = (items: FaqItem[]): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
});

export const FAQ_BY_LOCALE: Record<Locale, FaqItem[]> = {
  en: [
    {
      question: "What is Wheeloh?",
      answer:
        "Wheeloh is a free car spotting (carspotting) app for iPhone and Android. Photograph a car and Wheeloh identifies its make and model, scores the spot, files it in your garage and pins it on the map. Then share it with your friends, your clubs and the spotting community.",
    },
    {
      question: "What does car spotting (carspotting) mean?",
      answer:
        "Car spotting, also written carspotting, is the hobby of noticing, photographing and identifying interesting or rare cars in everyday life — like train spotting or plane spotting, but for cars. Wheeloh is built for it: it identifies the cars you photograph and helps you track, collect and share every spot.",
      link: { href: "/car-spotting", label: "The complete guide to car spotting" },
    },
    {
      question: "Is there an app that identifies a car from a photo?",
      answer:
        "Yes. Wheeloh recognises the make and model from a single photo and matches it against a database of more than 23,000 versions from over 150 brands, from 1904 to today. If the result looks wrong, you can contest it in the app.",
      link: { href: "/car-identifier", label: "How the car identifier works" },
    },
    {
      question: "Is Wheeloh free?",
      answer: "Yes. Wheeloh is free on the App Store and Google Play, with no subscription and no paywall.",
    },
    {
      question: "Which phones and countries does Wheeloh support?",
      answer:
        "iPhone (iOS 16.6 or later) and Android phones, in English and French. The app is available in France, Belgium, Switzerland, Luxembourg, the Netherlands, the UK, the US, Canada and Australia.",
    },
    {
      question: "How are points calculated?",
      answer:
        "Every spot is scored on four layers: performance, excitement, price and rarity. An everyday car earns around 40 points, an ultra-rare hypercar up to 3,000, and visibly modified cars get a +25% tuning bonus.",
    },
    {
      question: "Does Wheeloh hide licence plates?",
      answer:
        "Yes. Plates are found and erased on your phone, before the photo is uploaded. You can also mask a plate by hand, or choose to show it.",
      link: { href: "/license-plate-blur", label: "How plate masking works" },
    },
    {
      question: "Can I import car photos I have already taken?",
      answer:
        "Yes. Gallery sync scans your camera roll and finds the cars in it. Only genuine camera shots count: screenshots and downloaded images are filtered out.",
    },
    {
      question: "How do I find car meets near me?",
      answer:
        "Wheeloh lists car meets near you on the map and in search. Join one, check in on the day and share it with your friends; clubs can publish their own meets.",
      link: { href: "/car-meets", label: "Car meets on Wheeloh" },
    },
    {
      question: "How do I become a Wheeloh affiliate?",
      answer:
        "Apply through the affiliate programme on this site. Affiliates get an exclusive profile badge and can publish their own camera photos, in full quality, straight into the app.",
    },
  ],
  fr: [
    {
      question: "C'est quoi Wheeloh ?",
      answer:
        "Wheeloh est une app de carspotting gratuite pour iPhone et Android. Prends une voiture en photo : Wheeloh identifie la marque et le modèle, calcule les points du spot, le range dans ton garage et l'épingle sur la carte. Tu le partages ensuite avec tes amis, tes clubs et la communauté.",
    },
    {
      question: "Qu'est-ce que le carspotting (car spotting) ?",
      answer:
        "Le carspotting, ou car spotting, consiste à repérer, photographier et identifier les voitures rares ou intéressantes croisées au quotidien — comme le trainspotting ou le planespotting, mais pour les voitures. Wheeloh est fait pour ça : l'app identifie les voitures que tu photographies et t'aide à suivre, collectionner et partager chaque spot.",
      link: { href: "/fr/carspotting", label: "Le guide complet du carspotting" },
    },
    {
      question: "Existe-t-il une application pour reconnaître une voiture en photo ?",
      answer:
        "Oui. Wheeloh reconnaît la marque et le modèle à partir d'une seule photo, puis la compare à une base de plus de 23 000 versions de plus de 150 marques, de 1904 à aujourd'hui. Si le résultat te semble faux, tu peux le contester dans l'app.",
      link: { href: "/fr/identifier-une-voiture", label: "Comment l'app identifie une voiture" },
    },
    {
      question: "Wheeloh est-elle gratuite ?",
      answer: "Oui. Wheeloh est gratuite sur l'App Store et Google Play, sans abonnement ni contenu payant.",
    },
    {
      question: "Sur quels téléphones et dans quels pays ?",
      answer:
        "Sur iPhone (iOS 16.6 ou plus récent) et sur Android, en français et en anglais. L'app est disponible en France, en Belgique, en Suisse, au Luxembourg, aux Pays-Bas, au Royaume-Uni, aux États-Unis, au Canada et en Australie.",
    },
    {
      question: "Comment sont calculés les points ?",
      answer:
        "Chaque spot est noté sur quatre critères : performances, attrait, prix et rareté. Une voiture courante rapporte environ 40 points, une hypercar ultra-rare jusqu'à 3 000, et les voitures visiblement modifiées gagnent un bonus tuning de +25 %.",
    },
    {
      question: "Wheeloh floute-t-elle les plaques d'immatriculation ?",
      answer:
        "Oui. Les plaques sont détectées et effacées sur ton téléphone, avant l'envoi de la photo. Tu peux aussi masquer une plaque à la main, ou choisir de l'afficher.",
      link: { href: "/fr/flouter-plaque-immatriculation", label: "Comment l'app masque les plaques" },
    },
    {
      question: "Puis-je importer les photos de voitures que j'ai déjà prises ?",
      answer:
        "Oui. La synchronisation de galerie parcourt ta pellicule et y retrouve les voitures. Seules les vraies photos prises avec l'appareil comptent : captures d'écran et images téléchargées sont écartées.",
    },
    {
      question: "Comment trouver un rasso près de chez moi ?",
      answer:
        "Wheeloh affiche les rassos (rassemblements auto) autour de toi sur la carte et dans la recherche. Rejoins-en un, valide ta présence le jour J et partage-le avec tes amis ; les clubs peuvent publier leurs propres rassos.",
      link: { href: "/fr/rasso-voiture", label: "Les rassos sur Wheeloh" },
    },
    {
      question: "Comment devenir affilié Wheeloh ?",
      answer:
        "Candidate via le programme d'affiliation sur ce site. Les affiliés obtiennent un badge exclusif sur leur profil et peuvent publier leurs propres photos d'appareil, en pleine qualité, directement dans l'app.",
    },
  ],
};

export const FAQ_ITEMS: FaqItem[] = FAQ_BY_LOCALE.en;
export const faqLdFor = (locale: Locale): JsonLd => faqPageLd(FAQ_BY_LOCALE[locale]);
export const faqLd: JsonLd = faqLdFor("en");
