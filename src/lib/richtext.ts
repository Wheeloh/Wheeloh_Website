// The small markup used in the guide and feature pages' copy: **bold** and
// [label](/path). Parsed into tokens here (server and client), rendered as
// React in the page template, and stripped to plain text for JSON-LD.

export type RichToken = { text: string } | { bold: string } | { label: string; href: string };

const PATTERN = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;

export function richTokens(text: string): RichToken[] {
  const out: RichToken[] = [];
  let last = 0;
  for (const m of Array.from(text.matchAll(PATTERN))) {
    const at = m.index ?? 0;
    if (at > last) out.push({ text: text.slice(last, at) });
    if (m[1] !== undefined) out.push({ bold: m[1] });
    else out.push({ label: m[2], href: m[3] });
    last = at + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

/** The same text without its markup (meta descriptions, JSON-LD). */
export const plainText = (text: string) => text.replace(PATTERN, (_, bold, label) => bold ?? label);
