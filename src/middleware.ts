import { NextResponse, type NextRequest } from "next/server";

// Site version previews.
//
//   ?v2=true / ?v3=true   → preview that redesign (remembered in a cookie)
//   ?v1=true, ?v2=false…  → back to the original site
//   ?preview=off          → forget the choice entirely
//
// The choice is a cookie, so every page keeps the chosen version while
// browsing. Previews are served by *rewriting* the clean URL to the hidden
// /preview/v2 or /preview/v3 route tree: the address bar never changes, and
// a direct hit on /v2… or /v3… is redirected back to the clean URL (with the
// cookie set). The tree sits under a fixed prefix so that one-segment
// unknown URLs (/foo) never reach it and get the real 404 page.

const COOKIE = "wh-site-version";
const MAX_AGE = 60 * 60 * 24 * 30;

// Paths that exist in every version. Everything else (deep-link pages,
// assets…) is shared and served as is.
const VERSIONED = /^\/(|changelog(\/.*)?|engineering(\/.*)?|legal|cgu|privacy|community-standards|legal-and-privacy)$/;

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const sp = url.searchParams;

  let requested: "v1" | "v2" | "v3" | "off" | null = null;
  if (sp.get("preview") === "off") requested = "off";
  else if (sp.get("v3") === "true") requested = "v3";
  else if (sp.get("v2") === "true") requested = "v2";
  else if (sp.get("v1") === "true" || sp.get("v2") === "false" || sp.get("v3") === "false") requested = "v1";

  const internal = url.pathname.match(/^(?:\/preview)?\/(v2|v3)(?=\/|$)/);
  if (internal && !requested) requested = internal[1] as "v2" | "v3";

  // the hidden tree itself is never served under its own URL
  if (!internal && /^\/preview(\/|$)/.test(url.pathname)) {
    url.pathname = url.pathname.replace(/^\/preview/, "") || "/";
    return NextResponse.redirect(url, 307);
  }

  if (requested) {
    ["v1", "v2", "v3", "preview"].forEach((k) => sp.delete(k));
    if (internal) url.pathname = url.pathname.replace(/^(?:\/preview)?\/(v2|v3)/, "") || "/";
    const res = NextResponse.redirect(url, 307);
    if (requested === "off") res.cookies.delete(COOKIE);
    else res.cookies.set(COOKIE, requested, { path: "/", maxAge: MAX_AGE, sameSite: "lax" });
    return res;
  }

  const version = req.cookies.get(COOKIE)?.value;
  if ((version === "v2" || version === "v3") && VERSIONED.test(url.pathname)) {
    url.pathname = `/preview/${version}${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals, API routes and anything with a file extension.
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};
