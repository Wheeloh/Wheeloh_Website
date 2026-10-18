import MaintenanceBar from "@/components/MaintenanceBar";

// The app's deep-link fallbacks (/invite, /news, /user): the pages a shared
// link opens when the app isn't installed. They keep the original site's
// look and live outside the site's own layout.
export default function DeepLinkLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MaintenanceBar />
      {children}
    </>
  );
}
