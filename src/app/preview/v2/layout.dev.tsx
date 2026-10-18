import type { Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import MaintenanceBar from "@/components/redesign/shared/MaintenanceBar";
import { SiteConfigProvider } from "@/components/redesign/shared/SiteConfig";

// DEV ONLY (*.dev.tsx, see next.config.mjs): the first redesign, kept as a
// preview to compare with. src/middleware.dev.ts rewrites the clean URLs
// here when the wh-site-version cookie is "v2" (?v2=true). Apart from the
// home, its pages are the site's own, rendered with the v2 look.
export const viewport: Viewport = { themeColor: "#09090b", colorScheme: "dark" };

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <SiteConfigProvider version="v2">
      <div data-version="v2">
        <MaintenanceBar />
        {children}
        <Toaster position="bottom-center" />
      </div>
    </SiteConfigProvider>
  );
}
