"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import FlagMark from "@/components/redesign/shared/brand/FlagMark";

// Shown instead of Next's bare "Application error" text if a page ever
// throws in the browser. A full reload rather than reset(): after a crash the
// DOM may be out of step with React (browser translation, extensions).
export default function Error({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div data-version="v3" className="grid min-h-[100svh] place-items-center bg-snow px-5 text-ink">
      <div className="w-full max-w-[26rem] text-center">
        <FlagMark className="mx-auto h-7 w-auto" />
        <h1 className="mt-6 text-[2rem] font-extrabold leading-tight tracking-[-0.03em]">Something went wrong.</h1>
        <p className="mt-3 text-base font-medium text-ash">The page hit an error on this device. Reloading it usually does the trick.</p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-[0.9375rem] font-semibold text-snow transition-transform active:scale-[0.97]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden /> Reload
          </button>
          <Link
            href="/"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-mist px-6 text-[0.9375rem] font-semibold text-ink transition-colors hover:bg-line"
          >
            Back to home <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
