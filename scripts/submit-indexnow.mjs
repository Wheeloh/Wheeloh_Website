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

function getChangelogSlugs() {
  try {
    const indexPath = path.join(process.cwd(), "public/changelog/content/index.json");
    const files = JSON.parse(fs.readFileSync(indexPath, "utf8"));
    return files.map((f) => f.replace(/\.md$/, ""));
  } catch {
    return [];
  }
}

const staticPaths = [
  "/",
  "/engineering",
  "/engineering/semantic-car-search",
  "/changelog",
  "/legal",
  "/cgu",
  "/privacy",
  "/community-standards",
];

const urlList = [
  ...staticPaths,
  ...getChangelogSlugs().map((slug) => `/changelog/${slug}`),
].map((p) => `${SITE_URL}${p === "/" ? "" : p}`);

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
