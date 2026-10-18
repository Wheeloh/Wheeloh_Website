import MaintenanceBar from "@/components/MaintenanceBar";

// DEV ONLY (*.dev.tsx, see next.config.mjs): the original site, kept as a
// preview to compare with. src/middleware.dev.ts rewrites the clean URLs
// here when the wh-site-version cookie is "v1" (?v1=true).
export default function OriginalSiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MaintenanceBar />
      {children}
    </>
  );
}
