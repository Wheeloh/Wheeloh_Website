// Builds the compact Brand Collection file used by the homepage explorer.
//
//   node scripts/build-collection.mjs
//
// Input:  public/car-brands/data.json        (the app's prestige collection)
// Output: public/car-brands/collection.json  brands → display name, logo, country, model names
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "public/car-brands/data.json"), "utf8"));

// Display fixes for keys stored in a technical casing.
const DISPLAY = { Ac: "AC", Ruf: "RUF", Citroen: "Citroën", Tvr: "TVR" };

const slug = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const brands = Object.entries(data)
  .map(([key, b]) => {
    const name = DISPLAY[key] ?? key;
    const prefix = new RegExp(`^${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+`, "i");
    const models = [...new Set(b.models.map((m) => m.model.replace(prefix, "").trim() || m.model))];
    return {
      id: slug(key),
      name,
      logo: `/car-brands/logos/${b.logo.split("/").pop()}`,
      country: b.country,
      models,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name, "en"));

const total = brands.reduce((n, b) => n + b.models.length, 0);
fs.writeFileSync(path.join(root, "public/car-brands/collection.json"), JSON.stringify({ total, brands }));
console.log(`collection: ${brands.length} brands, ${total} models`);
