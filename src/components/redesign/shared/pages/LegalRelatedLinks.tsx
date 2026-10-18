import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

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
    <aside className="mx-auto mt-16 max-w-3xl border-t border-line pt-8">
      <h2 className="text-sm font-semibold text-ash">Documents connexes</h2>
      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {[...others, { path: "/", label: "Retour à l’accueil" }].map((doc) => (
          <li key={doc.path}>
            <Link
              href={doc.path}
              className="group flex items-center justify-between rounded-2xl bg-mist px-5 py-4 text-base font-bold transition-colors hover:bg-line"
            >
              {doc.label}
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
