import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/seo";

const utm = (campaign: string) => `utm_source=website&utm_medium=organic&utm_campaign=${campaign}`;

/** App Store link with website attribution. */
export const appStoreUrl = (campaign = "app_download") => `${APP_STORE_URL}?${utm(campaign)}`;

/** Smart link (detects the phone and opens the right store) — for QR codes and generic "download" links. */
export const APP_LINK_URL = "https://app.wheeloh.com/";

/** Google Play link — the `referrer` param is what Play Console attributes installs to. */
export const playStoreUrl = (campaign = "app_download") =>
  `${PLAY_STORE_URL}&${utm(campaign)}&referrer=${encodeURIComponent(utm(campaign))}`;

export type Platform = "ios" | "android" | "other";

export function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "other";
}
