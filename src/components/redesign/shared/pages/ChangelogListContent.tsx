"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import DocShell from "@/components/redesign/shared/DocShell";
import { Reveal } from "@/components/redesign/shared/motion/reveal";

export interface ChangelogListItem {
  slug: string;
  title: string;
  date: string;
  description: string;
}

/** "Wheeloh v1.3.0 — The Social Update" → { version: "1.3.0", name: "The Social Update" } */
function splitTitle(title: string) {
  const m = title.match(/v?(\d+(?:\.\d+){1,2})\s*[—–-]\s*(.+)$/);
  return m ? { version: m[1], name: m[2] } : { version: null, name: title };
}

export default function ChangelogListContent({
  entries,
}: {
  entries: ChangelogListItem[];
}) {
  return (
    <DocShell
      lang="en"
      title="Changelog"
      subtitle="What’s new in Wheeloh."
      crumbs={[{ href: "/", label: "Home" }, { label: "Changelog" }]}
      intro={
        <>
          New features, improvements and fixes for the{" "}
          <Link href="/" className="font-semibold text-snow underline decoration-graphite underline-offset-4 hover:decoration-snow">
            Wheeloh
          </Link>{" "}
          app. Curious how it works under the hood? Explore our{" "}
          <Link href="/engineering" className="font-semibold text-snow underline decoration-graphite underline-offset-4 hover:decoration-snow">
            engineering articles
          </Link>
          .
        </>
      }
    >
      <ol className="relative mx-auto max-w-5xl">
        {/* timeline rail */}
        <span aria-hidden className="absolute bottom-6 left-[0.6875rem] top-6 w-px bg-line md:left-[12.6875rem]" />
        {entries.map((item, i) => {
          const { version, name } = splitTitle(item.title);
          return (
            <Reveal as="li" key={item.slug} delay={Math.min(i, 4) * 80} className="relative grid gap-3 pb-14 pl-10 last:pb-0 md:grid-cols-[12rem_1fr] md:gap-10 md:pl-0">
              <div className="md:pt-7 md:text-right">
                <p className="text-sm font-semibold text-ash tabular md:pr-10">{item.date}</p>
              </div>
              {/* node on the rail */}
              <span
                aria-hidden
                className={
                  "absolute left-0 top-1 grid h-6 w-6 place-items-center rounded-full ring-[6px] ring-snow md:left-[12rem] md:top-7 " +
                  (i === 0 ? "bg-ink" : "bg-line")
                }
              >
                {i === 0 && <span className="h-2 w-2 rounded-full bg-spotted" />}
              </span>
              <Link
                href={`/changelog/${item.slug}`}
                className="group block rounded-[1.75rem] border border-line p-6 transition-[border-color,box-shadow,transform] duration-500 ease-out-expo hover:-translate-y-0.5 hover:border-transparent hover:shadow-[0_24px_50px_-24px_rgba(0,0,0,0.35)] sm:p-8 md:ml-6"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {version && (
                    <span className="rounded-full bg-ink px-3 py-1 text-[0.8125rem] font-bold text-snow tabular">v{version}</span>
                  )}
                  {i === 0 && (
                    <span className="rounded-full bg-spotted/15 px-3 py-1 text-[0.8125rem] font-bold text-[oklch(0.45_0.15_142)]">
                      Latest
                    </span>
                  )}
                </div>
                <h2 className="mt-4 flex items-start justify-between gap-6 text-display-s font-extrabold">
                  {name}
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mist transition-[background-color,color,transform] duration-500 ease-out-expo group-hover:rotate-45 group-hover:bg-ink group-hover:text-snow">
                    <ArrowUpRight className="h-5 w-5" aria-hidden />
                  </span>
                </h2>
                <p className="mt-3 line-clamp-3 max-w-[60ch] text-base font-medium leading-relaxed text-ash sm:text-lg">{item.description}</p>
              </Link>
            </Reveal>
          );
        })}
      </ol>
    </DocShell>
  );
}
