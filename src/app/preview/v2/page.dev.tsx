import { cookies } from "next/headers";
import HomeContent from "@/components/redesign/v2/HomeContent";
import { APP_LINK_URL } from "@/lib/links";
import { listEntries } from "@/lib/changelog";
import { readCollection } from "@/lib/collection";
import { qrSvg } from "@/lib/qr";

// DEV ONLY: the v2 home (galaxy hero, collection explorer).
export { metadata } from "@/app/(site)/page";

export default async function Page() {
  const [entry] = listEntries();
  const qr = await qrSvg(APP_LINK_URL);
  // the intro plays once per session
  const intro = !cookies().has("wh-intro");
  return (
    <HomeContent latestUpdate={{ slug: entry.slug, title: entry.title }} collection={readCollection()} qr={qr} intro={intro} />
  );
}
