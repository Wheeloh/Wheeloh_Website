"use client";
// Thin first-party wrapper around @splinetool/react-spline's default export.
// @splinetool/react-spline ships a strict ESM `exports` map that Next 14's
// webpack fails to resolve through a bare `next/dynamic(() => import('pkg'))`
// call ("Package path . is not exported"), even though a static top-level
// import of the same package works fine. Re-exporting through this
// first-party file lets next/dynamic target a normally-resolvable module
// while still code-splitting Spline's heavy runtime out of the main bundle.
import Spline from "@splinetool/react-spline";

export default Spline;
