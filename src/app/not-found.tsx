import type { Metadata } from "next";
import NotFoundGame from "@/components/notfound/NotFoundGame";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

// Every unknown URL, in every site version, lands here.
export default function NotFound() {
  return <NotFoundGame />;
}
