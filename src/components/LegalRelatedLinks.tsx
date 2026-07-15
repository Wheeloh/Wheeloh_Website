import Link from "next/link";

const DOCS = [
  { path: "/legal", label: "Mentions légales" },
  { path: "/cgu", label: "CGU" },
  { path: "/privacy", label: "Politique de confidentialité" },
  { path: "/community-standards", label: "Standards communautaires" },
];

/** Contextual cross-links between the legal documents (+ home). */
export default function LegalRelatedLinks({ current }: { current: string }) {
  const others = DOCS.filter((doc) => doc.path !== current);
  return (
    <aside className="mt-12 border-t pt-6">
      <h2 className="text-sm font-semibold text-muted-foreground mb-3">Documents connexes</h2>
      <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {others.map((doc) => (
          <li key={doc.path}>
            <Link href={doc.path} className="text-blue-600 hover:underline underline-offset-4">
              {doc.label}
            </Link>
          </li>
        ))}
        <li>
          <Link href="/" className="text-blue-600 hover:underline underline-offset-4">
            Retour à l&apos;accueil
          </Link>
        </li>
      </ul>
    </aside>
  );
}
