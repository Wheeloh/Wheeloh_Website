import { DocumentLang, LocaleProvider } from "@/components/redesign/shared/Locale";

// The French site. Same pages and components as the English one, with
// their French copy; the content is marked lang="fr" here.
export default function FrenchLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider locale="fr">
      <DocumentLang lang="fr" />
      <div lang="fr">{children}</div>
    </LocaleProvider>
  );
}
