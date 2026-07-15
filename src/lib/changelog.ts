// Single source of truth for changelog markdown, read at build/server time.
// Reused by the changelog list page, the [date] detail page, its
// generateMetadata/generateStaticParams, and app/sitemap.ts.
import fs from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "public/changelog/content");

export interface ChangelogEntry {
  slug: string;
  title: string;
  /** Printed date as written in the markdown, e.g. "04/05/2025". */
  printed: string;
  /** ISO date (yyyy-mm-dd) used for lastmod / dateModified. */
  iso: string;
  /** Short description: first meaningful line after the title/date. */
  description: string;
  /** Markdown body (front-matter stripped), unchanged from the source. */
  body: string;
}

function stripFrontmatter(md: string): string {
  return md.replace(/^---[\s\S]*?---\s*/, "");
}

/** List changelog slugs (filenames without ".md") from index.json. */
export function listSlugs(): string[] {
  const index = JSON.parse(
    fs.readFileSync(path.join(DIR, "index.json"), "utf8"),
  ) as string[];
  return index.map((file) => file.replace(/\.md$/, ""));
}

/** Read and parse a single changelog entry by slug. Throws if missing. */
export function readEntry(slug: string): ChangelogEntry {
  const raw = fs.readFileSync(path.join(DIR, `${slug}.md`), "utf8");
  const lines = raw.split("\n");

  const title =
    lines.find((l) => l.startsWith("#"))?.replace(/^#+\s*/, "") ?? slug;
  const printed =
    lines
      .find((l) => /^\*\d{2}\/\d{2}\/\d{4}\*$/.test(l.trim()))
      ?.replace(/\*/g, "")
      .trim() ?? slug;
  const description =
    lines.find(
      (l, i) => i > 1 && l.trim() !== "" && !l.startsWith("#") && !l.startsWith("*") && !l.startsWith("-"),
    ) ?? title;

  // Prefer the slug when it is already an ISO date (deterministic on CI).
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(slug) ? slug : new Date().toISOString().slice(0, 10);

  return { slug, title, printed, iso, description: description.trim(), body: stripFrontmatter(raw) };
}

/** All entries, newest first (by ISO date). */
export function listEntries(): ChangelogEntry[] {
  return listSlugs()
    .map(readEntry)
    .sort((a, b) => (a.iso < b.iso ? 1 : -1));
}
