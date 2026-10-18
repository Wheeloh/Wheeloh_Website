// Builds the compact data files behind the homepage "galaxy" (every dot = one
// of the 22,180 models of the semantic car search index).
//
//   node scripts/build-galaxy.mjs
//
// Input:  public/embeddings_coords.json   (2D projection used by the article)
// Output: public/galaxy/points.bin        x,y (Uint16) + category (Uint8)  — loaded with the hero
//         public/galaxy/labels.bin        model index + version index (Uint16) per car
//         public/galaxy/labels.json       string tables, loaded lazily on hover/search
//
// The category rules are read from SemanticCarSearchContent.tsx so the
// homepage and the engineering article always agree.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const src = fs.readFileSync(path.join(root, "src/components/SemanticCarSearchContent.tsx"), "utf8");
const start = src.indexOf("const SUPERCAR_BRANDS");
const end = src.indexOf("// Gaussian normal");
if (start < 0 || end < 0) throw new Error("Could not locate getCarCategory() in SemanticCarSearchContent.tsx");
const fnSrc = src
  .slice(start, end)
  .replace(/export function getCarCategory\([^)]*\)\s*:\s*number\s*\{/, "function getCarCategory(car) {");
const getCarCategory = new Function(`${fnSrc}; return getCarCategory;`)();

const { cars } = JSON.parse(fs.readFileSync(path.join(root, "public/embeddings_coords.json"), "utf8"));
const N = cars.length;

let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
for (const c of cars) {
  minX = Math.min(minX, c.x); maxX = Math.max(maxX, c.x);
  minY = Math.min(minY, c.y); maxY = Math.max(maxY, c.y);
}
// Uniform scale (keep the layout's aspect ratio), centred.
const span = Math.max(maxX - minX, maxY - minY);
const cx = (minX + maxX) / 2;
const cy = (minY + maxY) / 2;
const q = (v, c) => Math.round(((v - c) / span + 0.5) * 65535);

const xs = new Uint16Array(N);
const ys = new Uint16Array(N);
const cats = new Uint8Array(N);
const brands = [];
const brandIdx = new Map();
const models = [];
const modelIdx = new Map();
const versions = [];
const versionIdx = new Map();
const mi = new Uint16Array(N);
const vi = new Uint16Array(N);

cars.forEach((c, i) => {
  xs[i] = q(c.x, cx);
  ys[i] = q(c.y, cy);
  cats[i] = getCarCategory(c);
  if (!brandIdx.has(c.brand)) { brandIdx.set(c.brand, brands.length); brands.push(c.brand); }
  const mk = `${c.brand}\u0000${c.model}`;
  if (!modelIdx.has(mk)) { modelIdx.set(mk, models.length); models.push([brandIdx.get(c.brand), c.model]); }
  if (!versionIdx.has(c.version)) { versionIdx.set(c.version, versions.length); versions.push(c.version); }
  mi[i] = modelIdx.get(mk);
  vi[i] = versionIdx.get(c.version);
});

const senna = cars.findIndex((c) => c.brand === "McLaren" && /Senna/.test(c.version));

const outDir = path.join(root, "public/galaxy");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "points.bin"),
  Buffer.concat([Buffer.from(xs.buffer), Buffer.from(ys.buffer), Buffer.from(cats.buffer)]),
);
fs.writeFileSync(path.join(outDir, "labels.bin"), Buffer.concat([Buffer.from(mi.buffer), Buffer.from(vi.buffer)]));
fs.writeFileSync(
  path.join(outDir, "labels.json"),
  JSON.stringify({ count: N, senna, brands, models, versions }),
);

const catCount = [0, 0, 0, 0, 0];
cats.forEach((c) => catCount[c]++);
console.log(`galaxy: ${N} cars, ${brands.length} brands, ${models.length} models, ${versions.length} versions`);
console.log(`categories: ${catCount.join(" / ")} — senna index ${senna}`);
