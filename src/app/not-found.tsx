import type { Metadata } from "next";
import NotFoundGame from "@/components/notfound/NotFoundGame";

// Next adds its own <meta name="robots" content="noindex"> to a 404, but the
// root layout's "index, follow" would still be inherited next to it: this
// override keeps both tags saying noindex.
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

// Every unknown URL lands here (and, in `next dev`, every preview's too).
export default function NotFound() {
  return <NotFoundGame />;
}
