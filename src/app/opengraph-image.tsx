import fs from "fs";
import path from "path";

export const alt = "Wheeloh — Spot, identify and collect the rarest cars around you";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default function OpengraphImage() {
  const filePath = path.join(process.cwd(), "public", "og-preview.png");
  const buffer = fs.readFileSync(filePath);

  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

