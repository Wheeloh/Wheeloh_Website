import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wheeloh — Car Spotting",
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      { src: "/icon-android.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-android-white.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
