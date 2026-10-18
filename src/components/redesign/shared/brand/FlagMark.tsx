import { cn } from "@/lib/utils";

// The Wheeloh app icon — a checkered flag waving away from the viewer —
// rebuilt as one SVG path per tile (geometry measured from /public/icon.png)
// so the tiles can flip in, wave and scatter independently.

const SLOPE = -0.2; // the flag's top/bottom edges rise 1px every 5px

interface TileSpec {
  x0: number; // column start
  w: number; // column width (= tile height)
  y0: number; // top edge y at x0
  roundTL?: number;
  roundBR?: number;
  col: number; // global column, used for the wave phase
}

function tile({ x0, w, y0, roundTL = 0, roundBR = 0 }: TileSpec) {
  const x1 = x0 + w;
  const yTL = y0;
  const yTR = y0 + SLOPE * w;
  const yBR = yTR + w;
  const yBL = yTL + w;
  const parts: string[] = [];
  if (roundTL) {
    parts.push(`M${x0} ${yTL + roundTL}`, `Q${x0} ${yTL} ${x0 + roundTL} ${yTL + SLOPE * roundTL}`);
  } else {
    parts.push(`M${x0} ${yTL}`);
  }
  parts.push(`L${x1} ${yTR}`);
  if (roundBR) {
    parts.push(`L${x1} ${yBR - roundBR}`, `Q${x1} ${yBR} ${x1 - roundBR} ${yBR - SLOPE * roundBR}`);
  } else {
    parts.push(`L${x1} ${yBR}`);
  }
  parts.push(`L${x0} ${yBL}`, "Z");
  return parts.join(" ");
}

// Large group: 3 columns of 276px, checkerboard rows from y=348 at x=68.
const S1 = 276;
const X1 = 68;
const Y1 = 348;
const big = (c: number, r: number) => Y1 + S1 * r + SLOPE * S1 * c;
// Small group (further away): 2 columns of 182px starting at x=928.
const S2 = 182;
const X2 = 928;
const Y2 = 318;
const small = (c: number, r: number) => Y2 + S2 * r + SLOPE * S2 * c;

export const FLAG_TILES: Array<TileSpec & { d: string }> = [
  { x0: X1, w: S1, y0: big(0, 0), roundTL: 44, col: 0 },
  { x0: X1, w: S1, y0: big(0, 2), roundBR: 44, col: 0 },
  { x0: X1 + S1, w: S1, y0: big(1, 1), col: 1 },
  { x0: X1 + S1 * 2, w: S1, y0: big(2, 0), roundTL: 64, col: 2 },
  { x0: X1 + S1 * 2, w: S1, y0: big(2, 2), roundBR: 50, col: 2 },
  { x0: X2, w: S2, y0: small(0, 1), col: 3 },
  { x0: X2 + S2, w: S2, y0: small(1, 0), roundTL: 44, col: 4 },
  { x0: X2 + S2, w: S2, y0: small(1, 2), roundBR: 44, col: 4 },
].map((t) => ({ ...t, d: tile(t) }));

interface FlagMarkProps {
  className?: string;
  title?: string | null;
  /** "wave" loops a gentle flag wave; "intro" flips the tiles in once. */
  motion?: "none" | "wave" | "intro";
  tileClassName?: string;
}

export default function FlagMark({ className, title = null, motion = "none", tileClassName }: FlagMarkProps) {
  return (
    <svg
      viewBox="60 170 1240 1016"
      fill="currentColor"
      className={cn("block h-auto overflow-visible", motion === "wave" && "flag-wave", motion === "intro" && "flag-intro", className)}
      role={title ? "img" : undefined}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
    >
      {FLAG_TILES.map((t, i) => (
        <path
          key={i}
          d={t.d}
          className={cn("flag-tile", tileClassName)}
          style={{ ["--i" as string]: i, ["--col" as string]: t.col }}
        />
      ))}
    </svg>
  );
}
