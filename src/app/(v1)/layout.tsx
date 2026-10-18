import MaintenanceBar from "@/components/MaintenanceBar";

// The original site (the public default). Its pages live in this route
// group untouched; the redesigns live under src/app/[version] and are
// served in place of these when a preview cookie is set (src/middleware.ts).
export default function OriginalSiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MaintenanceBar />
      {children}
    </>
  );
}
