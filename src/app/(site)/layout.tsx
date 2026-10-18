import type { Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import MaintenanceBar from "@/components/redesign/shared/MaintenanceBar";
import { SiteConfigProvider } from "@/components/redesign/shared/SiteConfig";

// The site (v3). This route group is what `next build` ships. The older
// versions are only previews in `next dev` (src/app/preview, *.dev.tsx).
export const viewport: Viewport = { themeColor: "#ffffff", colorScheme: "light" };

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteConfigProvider version="v3">
      <div data-version="v3">
        <MaintenanceBar />
        {children}
        <Toaster position="bottom-center" />
      </div>
    </SiteConfigProvider>
  );
}
