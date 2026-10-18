// Server-side reader for the Brand Collection data (built by
// scripts/build-collection.mjs from the app's public/car-brands/data.json).
import fs from "node:fs";
import path from "node:path";
import type { CollectionData } from "@/lib/collection-shared";

export function readCollection(): CollectionData {
  const file = path.join(process.cwd(), "public/car-brands/collection.json");
  return JSON.parse(fs.readFileSync(file, "utf8")) as CollectionData;
}
