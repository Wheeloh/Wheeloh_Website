"use client";
// Thin first-party wrapper around @fillout/react's named export — see
// SplineLazy.tsx for why this indirection is needed (strict ESM `exports`
// map defeats next/dynamic's direct package resolution in Next 14's webpack).
export { FilloutStandardEmbed as default } from "@fillout/react";
