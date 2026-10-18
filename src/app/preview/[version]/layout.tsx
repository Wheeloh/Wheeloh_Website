import type { Viewport } from "next";
import { notFound } from "next/navigation";
import { Toaster } from "@/components/ui/sonner";
import MaintenanceBar from "@/components/redesign/shared/MaintenanceBar";
import { SiteConfigProvider, type Version } from "@/components/redesign/shared/SiteConfig";

// The redesign previews. These URLs are never visited directly: the
// middleware rewrites "/" (and the other versioned paths) to /preview/v2…
// or /preview/v3… when the wh-site-version cookie says so, and redirects any
// direct /v2…, /v3… or /preview… hit back to the clean URL.
export const dynamicParams = false;

// Listed here rather than imported: SiteConfig is a client module, and its
// exports reach server code only as opaque client references.
export function generateStaticParams() {
  return [{ version: "v2" }, { version: "v3" }];
}

export function generateViewport({ params }: { params: { version: string } }): Viewport {
  return params.version === "v2"
    ? { themeColor: "#09090b", colorScheme: "dark" }
    : { themeColor: "#ffffff", colorScheme: "light" };
}

export default function VersionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { version: string };
}) {
  // Only v2 and v3 exist. dynamicParams=false alone is not enough once the
  // page reads cookies.
  if (params.version !== "v2" && params.version !== "v3") notFound();
  const version = params.version as Version;
  return (
    <SiteConfigProvider version={version}>
      <div data-version={version}>
        <MaintenanceBar />
        {children}
        <Toaster position="bottom-center" />
      </div>
    </SiteConfigProvider>
  );
}
