import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

// `next build` ships the site (v3) only. Files named *.dev.tsx / *.dev.ts
// exist for `next dev` alone: the v1 and v2 previews (src/app/preview) and
// the middleware that switches to them (src/middleware.dev.ts).
const EXTENSIONS = ["tsx", "ts", "jsx", "js"];

/** @type {(phase: string) => import('next').NextConfig} */
export default function nextConfig(phase) {
  const dev = phase === PHASE_DEVELOPMENT_SERVER;
  return {
    pageExtensions: dev ? ["dev.tsx", "dev.ts", ...EXTENSIONS] : EXTENSIONS,
    images: {
      formats: ["image/avif", "image/webp"],
    },
  };
}
