#!/usr/bin/env node
// Pings IndexNow (Bing, Yandex, Seznam, Naver) with the site's indexable URLs
// on every production deploy, so new/changed pages (e.g. a new changelog
// entry) get picked up without waiting for a crawl. Runs as `postbuild` on
// Netlify only (skipped for local `npm run build`) and never fails the
// build — a network hiccup here must never block a deploy.
import fs from "node:fs";
import path from "node:path";

const SITE_URL = "https://wheeloh.com";
const INDEXNOW_KEY = "ef48aaec3830a21f1181c8b3c4e84f80";
const KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

// Skip on local builds — only submit from Netlify's CI environment.
if (!process.env.NETLIFY) {
  console.log("[indexnow] not running in Netlify CI, skipping submission.");
  process.exit(0);
}

// The sitemap `next build` just generated (app/sitemap.ts) is the list of
// every indexable URL, in both languages: submit exactly that.
function sitemapUrls() {
  const candidates = [".next/server/app/sitemap.xml.body", ".next/server/app/sitemap.xml"];
  for (const file of candidates) {
    try {
      const xml = fs.readFileSync(path.join(process.cwd(), file), "utf8");
      const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
      if (urls.length) return urls;
    } catch {
      // try the next location
    }
  }
  return [];
}

// Fallback if the build output moved: the main pages and the releases.
function fallbackUrls() {
  let slugs = [];
  try {
    const files = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public/changelog/content/index.json"), "utf8"));
    slugs = files.map((f) => f.replace(/\.md$/, ""));
  } catch {
    // no releases
  }
  return ["/", "/fr", "/car-spotting", "/fr/carspotting", "/cars", "/fr/voitures", "/changelog", ...slugs.map((s) => `/changelog/${s}`)].map(
    (p) => `${SITE_URL}${p === "/" ? "" : p}`,
  );
}

const fromSitemap = sitemapUrls();
const urlList = fromSitemap.length ? fromSitemap : fallbackUrls();

try {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: "wheeloh.com",
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList,
    }),
  });
  console.log(`[indexnow] submitted ${urlList.length} URLs — status ${res.status}`);
} catch (err) {
  console.warn("[indexnow] submission failed (non-fatal):", err.message);
}
