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

/** `description: "..."` from the front-matter, the release's meta description. */
function frontmatterDescription(md: string): string | undefined {
  const block = md.match(/^---\n([\s\S]*?)\n---/)?.[1];
  return block?.match(/^description:\s*"?(.*?)"?\s*$/m)?.[1];
}

/** Strip inline markdown formatting so a line is safe to use as a plain-text
 * meta description / OG description / JSON-LD description. */
function stripMarkdownInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // **bold**
    .replace(/__(.*?)__/g, "$1") // __bold__
    .replace(/\*(.*?)\*/g, "$1") // *italic*
    .replace(/_(.*?)_/g, "$1") // _italic_
    .replace(/`(.*?)`/g, "$1") // `code`
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // [text](url)
    .trim();
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
  const lines = stripFrontmatter(raw).split("\n");

  const title =
    lines.find((l) => l.startsWith("#"))?.replace(/^#+\s*/, "") ?? slug;
  const printed =
    lines
      .find((l) => /^\*\d{2}\/\d{2}\/\d{4}\*$/.test(l.trim()))
      ?.replace(/\*/g, "")
      .trim() ?? slug;
  const description =
    frontmatterDescription(raw) ??
    lines.find(
      (l, i) => i > 1 && l.trim() !== "" && !l.startsWith("#") && !l.startsWith("*") && !l.startsWith("-"),
    ) ?? title;

  // The printed date (dd/mm/yyyy) is the release date; the slug is only a
  // URL (2024-04-05 was published on 04/05/2025). Fall back to an ISO slug.
  const [d, m, y] = printed.split("/");
  const iso = y && m && d ? `${y}-${m}-${d}` : /^\d{4}-\d{2}-\d{2}$/.test(slug) ? slug : new Date().toISOString().slice(0, 10);

  return {
    slug,
    title: stripMarkdownInline(title),
    printed,
    iso,
    description: stripMarkdownInline(description),
    body: stripFrontmatter(raw),
  };
}

/** All entries, newest first (by ISO date). */
export function listEntries(): ChangelogEntry[] {
  return listSlugs()
    .map(readEntry)
    .sort((a, b) => (a.iso < b.iso ? 1 : -1));
}
