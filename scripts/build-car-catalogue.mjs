// Builds the data behind the /cars and /fr/voitures pages: the app's
// collection catalogue (public/car-brands/data.json) and, from the app's car
// database, a preview of each brand — the specs of its first few models and
// four headline figures. The rest of the database stays in the app: the
// pages show a preview and invite to download it (this repo is public, so
// the JSON holds only what the pages display).
//
//   node scripts/build-car-catalogue.mjs <path to the app's car database>
//   (wheeloh_app/functions/lib/wheeloh/data — the folder holding cars_by_brand/)
//
// Output: src/data/car-catalogue.json (committed: the site's build does not
// have the app repository).
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const dbDir = process.argv[2];
if (!dbDir || !fs.existsSync(path.join(dbDir, "cars_by_brand"))) {
  console.error("usage: node scripts/build-car-catalogue.mjs <app>/functions/lib/wheeloh/data");
  process.exit(1);
}

/** Models whose specs a brand page shows before the download invitation. */
const previewSize = (n) => Math.min(5, Math.max(1, Math.floor(n / 3)));

const catalogue = JSON.parse(fs.readFileSync(path.join(root, "public/car-brands/data.json"), "utf8"));

const versions = new Map();
for (const file of fs.readdirSync(path.join(dbDir, "cars_by_brand"))) {
  for (const car of JSON.parse(fs.readFileSync(path.join(dbDir, "cars_by_brand", file), "utf8"))) versions.set(car.id, car);
}

// Same display fixes and slugs as scripts/build-collection.mjs.
const DISPLAY = { Ac: "AC", Ruf: "RUF", Citroen: "Citroën", Tvr: "TVR" };
const slug = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const num = (v) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? v : undefined);
const max = (xs) => (xs.length ? Math.max(...xs) : undefined);
const min = (xs) => (xs.length ? Math.min(...xs) : undefined);

function facts(ids) {
  const cars = ids.map((id) => versions.get(id)).filter(Boolean);
  if (!cars.length) return {};
  const perf = (c) => c.specifications?.Performance ?? {};
  const power = (c) => num(perf(c).combined_power_hp) ?? num(perf(c).power_hp);
  // the most powerful version describes the engine and the body
  const top = [...cars].sort((a, b) => (power(b) ?? 0) - (power(a) ?? 0))[0];
  const eng = top.specifications?.Engine_and_Drivetrain ?? {};
  const text = (v) => (typeof v === "string" && v.trim() && v.trim() !== "null" ? v.trim() : undefined);
  const config = text(eng.configuration);
  const electric = /electric/i.test(config ?? "") || (!config && Boolean(top.specifications?.Electric_Powertrain || eng.fuel === "Electric"));
  const body = text(top.specifications?.Dimensions_and_Practicality?.body_style);
  const starts = cars.map((c) => c.start_year).filter(num);
  const ends = cars.map((c) => c.end_year).filter(num);
  return {
    from: min(starts),
    to: ends.length === cars.length ? max(ends) : undefined,
    hp: max(cars.map(power).filter(Boolean)),
    acc: min(cars.map((c) => num(perf(c).zero_to_100_km_h_seconds)).filter(Boolean)),
    vmax: max(cars.map((c) => num(perf(c).top_speed_km_h)).filter(Boolean)),
    // engine: displacement (L), layout ("V8"), aspiration ("Bi-Turbo"), or electric
    ...(electric ? { ev: true } : { l: num(eng.displacement_l), cyl: config, asp: text(eng.aspiration) }),
    body: body && body[0].toUpperCase() + body.slice(1),
    versions: cars.length,
  };
}

const brands = Object.entries(catalogue)
  .map(([key, b]) => {
    const prefix = new RegExp(`^${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+`, "i");
    const seen = new Set();
    const models = [];
    for (const m of b.models) {
      const name = m.model.replace(prefix, "").trim() || m.model;
      if (seen.has(name)) continue;
      seen.add(name);
      const f = facts(m.db_ids ?? []);
      if (f.vmax) f.vmax = Math.round(f.vmax);
      if (f.hp) f.hp = Math.round(f.hp);
      models.push({ name, ...f });
    }
    const top = (field) => [...models].filter((m) => m[field]).sort((x, y) => y[field] - x[field])[0];
    const dated = models.filter((m) => m.from).sort((x, y) => x.from - y.from);
    const strongest = top("hp");
    const fastest = top("vmax");
    return {
      id: slug(key),
      name: DISPLAY[key] ?? key,
      country: b.country,
      logo: `/car-brands/logos/${b.logo.split("/").pop()}`,
      models: models.map((m) => m.name),
      preview: models.slice(0, previewSize(models.length)).map(({ versions, ...m }) => m),
      highlights: {
        ...(strongest && { strongest: { name: strongest.name, hp: strongest.hp } }),
        ...(fastest && { fastest: { name: fastest.name, vmax: fastest.vmax } }),
        ...(dated.length && {
          oldest: { name: dated[0].name, from: dated[0].from },
          newest: { name: dated[dated.length - 1].name, from: dated[dated.length - 1].from },
        }),
      },
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name, "en"));

const out = path.join(root, "src/data/car-catalogue.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ brands }));
const total = brands.reduce((n, b) => n + b.models.length, 0);
const previewed = brands.reduce((n, b) => n + b.preview.length, 0);
console.log(`car catalogue: ${brands.length} brands, ${total} models, ${previewed} previewed with specs → ${path.relative(root, out)}`);
