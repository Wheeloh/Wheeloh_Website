// Loaders for the compact galaxy files produced by scripts/build-galaxy.mjs.

export interface GalaxyPoints {
  count: number;
  x: Uint16Array; // 0..65535, layout x
  y: Uint16Array; // 0..65535, layout y (up = larger)
  cat: Uint8Array; // 0 supercar · 1 sports · 2 luxury/GT · 3 SUV · 4 everyday
}

export const CATEGORY_LABELS = [
  { name: "Supercars & hypercars", count: 470 },
  { name: "Sports & performance", count: 1128 },
  { name: "Luxury & GT", count: 698 },
  { name: "SUVs & 4x4", count: 1165 },
  { name: "Everyday cars", count: 18719 },
] as const;

// sRGB colours used by both the WebGL points and the HTML legend.
export const CATEGORY_COLORS: Array<[number, number, number]> = [
  [1.0, 0.33, 0.24], // supercars — hot red
  [1.0, 0.64, 0.18], // sports — amber
  [0.72, 0.56, 1.0], // luxury — lavender
  [0.24, 0.86, 0.56], // SUV — green
  [0.56, 0.64, 0.78], // everyday — steel
];

export const categoryCss = (i: number) => {
  const [r, g, b] = CATEGORY_COLORS[i];
  return `rgb(${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)})`;
};

let pointsPromise: Promise<GalaxyPoints> | null = null;

export function loadPoints(): Promise<GalaxyPoints> {
  if (!pointsPromise) {
    pointsPromise = fetch("/galaxy/points.bin")
      .then((r) => {
        if (!r.ok) throw new Error(`points.bin ${r.status}`);
        return r.arrayBuffer();
      })
      .then((buf) => {
        const count = buf.byteLength / 5;
        return {
          count,
          x: new Uint16Array(buf, 0, count),
          y: new Uint16Array(buf, count * 2, count),
          cat: new Uint8Array(buf, count * 4, count),
        };
      });
    pointsPromise.catch(() => {
      pointsPromise = null;
    });
  }
  return pointsPromise;
}

export interface CarLabel {
  brand: string;
  model: string;
  version: string;
}

export interface GalaxyLabels {
  senna: number;
  label(i: number): CarLabel;
  search(query: string, limit?: number): number[];
}

// Spotter slang → catalogue words, so a few nicknames behave like the app's
// semantic search does (the full system understands far more).
const ALIASES: Record<string, string> = {
  rari: "ferrari",
  lambo: "lamborghini",
  beamer: "bmw",
  bimmer: "bmw",
  merc: "mercedes",
  benz: "mercedes",
  "g-wagon": "g-class",
  gwagon: "g-class",
  miata: "mx-5",
  vw: "volkswagen",
  chevy: "chevrolet",
  aston: "aston martin",
  rolls: "rolls-royce",
  porsh: "porsche",
};

let labelsPromise: Promise<GalaxyLabels> | null = null;

export function loadLabels(): Promise<GalaxyLabels> {
  if (!labelsPromise) {
    labelsPromise = Promise.all([
      fetch("/galaxy/labels.json").then((r) => r.json()),
      fetch("/galaxy/labels.bin").then((r) => r.arrayBuffer()),
    ]).then(([json, buf]) => {
      const { count, senna, brands, models, versions } = json as {
        count: number;
        senna: number;
        brands: string[];
        models: Array<[number, string]>;
        versions: string[];
      };
      const mi = new Uint16Array(buf, 0, count);
      const vi = new Uint16Array(buf, count * 2, count);
      const label = (i: number): CarLabel => {
        const [b, model] = models[mi[i]];
        return { brand: brands[b], model, version: versions[vi[i]] };
      };
      let haystack: string[] | null = null;
      const search = (query: string, limit = 8) => {
        const tokens = query
          .toLowerCase()
          .split(/\s+/)
          .filter(Boolean)
          .map((t) => ALIASES[t] ?? t);
        if (!tokens.length) return [];
        if (!haystack) {
          haystack = new Array(count);
          for (let i = 0; i < count; i++) {
            const l = label(i);
            haystack[i] = `${l.brand} ${l.model} ${l.version}`.toLowerCase();
          }
        }
        const seen = new Set<string>();
        const hits: Array<{ i: number; score: number }> = [];
        for (let i = 0; i < count; i++) {
          const h = haystack[i];
          if (!tokens.every((t) => h.includes(t))) continue;
          if (seen.has(h)) continue;
          seen.add(h);
          const l = label(i);
          // Prefer brand/model hits over version-only hits, then shorter names.
          const head = `${l.brand} ${l.model}`.toLowerCase();
          const score = tokens.filter((t) => head.includes(t)).length * 100 - h.length;
          hits.push({ i, score });
        }
        hits.sort((a, b) => b.score - a.score);
        return hits.slice(0, limit).map((h) => h.i);
      };
      return { senna, label, search };
    });
    labelsPromise.catch(() => {
      labelsPromise = null;
    });
  }
  return labelsPromise;
}
