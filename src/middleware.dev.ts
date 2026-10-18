import { NextResponse, type NextRequest } from "next/server";

// DEV ONLY (*.dev.ts, see next.config.mjs). `next build` has no middleware:
// it ships the site (v3) at its clean URLs and nothing else.
//
// In `next dev`, the older versions can be previewed in place:
//
//   ?v1=true               → the original site     (cookie wh-site-version=v1)
//   ?v2=true               → the first redesign    (cookie wh-site-version=v2)
//   ?v3=true, ?preview=off → back to the site      (cookie cleared)
//
// The cookie keeps the choice while browsing: the clean URL is *rewritten*
// to src/app/preview/v1… or /v2…, so the address bar never changes. /v1…,
// /v2…, /v3… and /preview… typed by hand redirect to the clean URL.

const COOKIE = "wh-site-version";
const MAX_AGE = 60 * 60 * 24 * 30;

// Paths that exist in every version. Everything else (deep-link pages,
// assets…) is shared and served as is.
const VERSIONED = /^\/(|changelog(\/.*)?|engineering(\/.*)?|legal|cgu|privacy|community-standards|legal-and-privacy)$/;

type Choice = "v1" | "v2" | "site";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const sp = url.searchParams;

  let requested: Choice | null = null;
  if (sp.get("preview") === "off" || sp.get("v3") === "true") requested = "site";
  else if (sp.get("v2") === "true") requested = "v2";
  else if (sp.get("v1") === "true") requested = "v1";
  else if (sp.get("v1") === "false" || sp.get("v2") === "false") requested = "site";

  const internal = url.pathname.match(/^(?:\/preview)?\/(v[123])(?=\/|$)/);
  if (internal && !requested) requested = internal[1] === "v3" ? "site" : (internal[1] as "v1" | "v2");

  // the preview tree itself is never served under its own URL
  if (!internal && /^\/preview(\/|$)/.test(url.pathname)) {
    url.pathname = url.pathname.replace(/^\/preview/, "") || "/";
    return NextResponse.redirect(url, 307);
  }

  if (requested) {
    ["v1", "v2", "v3", "preview"].forEach((k) => sp.delete(k));
    if (internal) url.pathname = url.pathname.replace(/^(?:\/preview)?\/v[123]/, "") || "/";
    const res = NextResponse.redirect(url, 307);
    if (requested === "site") res.cookies.delete(COOKIE);
    else res.cookies.set(COOKIE, requested, { path: "/", maxAge: MAX_AGE, sameSite: "lax" });
    return res;
  }

  const version = req.cookies.get(COOKIE)?.value;
  if ((version === "v1" || version === "v2") && VERSIONED.test(url.pathname)) {
    url.pathname = `/preview/${version}${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals, API routes and anything with a file extension.
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};
