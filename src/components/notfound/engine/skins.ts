// Paint jobs for the player's car, won in the garage's crates.
// Pure data: the car draws them (engine/car.ts).

export type Rarity = "common" | "rare" | "epic" | "legendary";

export interface Skin {
  id: string;
  name: string;
  rarity: Rarity;
  /** Main paint. */
  body: string;
  /** Roof colour (defaults to a darker body). */
  roof?: string;
  /** The Wheeloh flag on the roof. */
  flag?: boolean;
  /** Racing stripes along the car: one centred, or two apart. */
  stripes?: { colors: string[]; width: number };
  /** A band across the doors (a cab's checker, a rally band). */
  band?: { color: string; checker?: boolean };
  pattern?: "carbon" | "checker" | "camo" | "flames";
  metallic?: boolean;
  /** Paint that shifts through the colours. */
  holo?: boolean;
  /** Neon under the car. */
  glow?: string;
}

export const RARITY: Record<Rarity, { label: string; color: string; weight: number }> = {
  common: { label: "Common", color: "#8E929C", weight: 60 },
  rare: { label: "Rare", color: "#2F6BFF", weight: 27 },
  epic: { label: "Epic", color: "#9B4DFF", weight: 10 },
  legendary: { label: "Legendary", color: "#F5A524", weight: 3 },
};

export const RARITIES: Rarity[] = ["common", "rare", "epic", "legendary"];

/** What a rarer car does better: top speed, acceleration, grip, toughness (chase). */
export interface Boost {
  speed: number;
  accel: number;
  grip: number;
  armor: number;
}
export const BOOST: Record<Rarity, Boost> = {
  common: { speed: 1, accel: 1, grip: 1, armor: 1 },
  rare: { speed: 1.04, accel: 1.08, grip: 1.05, armor: 1.1 },
  epic: { speed: 1.08, accel: 1.15, grip: 1.1, armor: 1.25 },
  legendary: { speed: 1.12, accel: 1.22, grip: 1.15, armor: 1.45 },
};
export const boostOf = (skin?: Skin) => BOOST[skin?.rarity ?? "common"];

/** "+8% speed · +15% accel…" (nothing for a common car). */
export function boostLabel(r: Rarity) {
  const b = BOOST[r];
  const pct = (v: number) => Math.round((v - 1) * 100);
  if (r === "common") return "Stock performance";
  return `+${pct(b.speed)}% speed · +${pct(b.accel)}% accel · +${pct(b.grip)}% grip · +${pct(b.armor)}% armor`;
}

export const SKINS: Skin[] = [
  // common
  { id: "stock", name: "Stock", rarity: "common", body: "#121214", roof: "#1D1D22", flag: true },
  { id: "chalk", name: "Chalk", rarity: "common", body: "#F2F2F4", roof: "#1D1D22", flag: true },
  { id: "slate", name: "Slate", rarity: "common", body: "#646873", roof: "#3A3D45", flag: true },
  { id: "dune", name: "Dune", rarity: "common", body: "#D9C6A0", roof: "#B49F77" },
  { id: "mint", name: "Mint", rarity: "common", body: "#8FD6BD", roof: "#5FB295" },
  { id: "cab", name: "Night Cab", rarity: "common", body: "#FFC531", roof: "#F2B200", band: { color: "#121214", checker: true } },
  { id: "pitlane", name: "Pit Lane", rarity: "common", body: "#E5322D", roof: "#B8211D", flag: true },
  // rare
  { id: "heritage", name: "Heritage", rarity: "rare", body: "#8CC4E8", roof: "#8CC4E8", stripes: { colors: ["#F28C28"], width: 0.34 } },
  { id: "tricolore", name: "Tricolore", rarity: "rare", body: "#F4F4F6", roof: "#F4F4F6", stripes: { colors: ["#1E50A0", "#E5322D"], width: 0.14 } },
  { id: "green", name: "Racing Green", rarity: "rare", body: "#1E4B37", roof: "#173A2A", stripes: { colors: ["#E8D9A8"], width: 0.1 } },
  { id: "bleu", name: "Bleu", rarity: "rare", body: "#1E50A0", roof: "#1E50A0", stripes: { colors: ["#FFFFFF", "#FFFFFF"], width: 0.12 } },
  { id: "sunset", name: "Sunset", rarity: "rare", body: "#FF6A13", roof: "#121214", stripes: { colors: ["#121214"], width: 0.18 } },
  { id: "rally", name: "Rally", rarity: "rare", body: "#F4F4F6", roof: "#121214", band: { color: "#E5322D" } },
  // epic
  { id: "carbon", name: "Carbon", rarity: "epic", body: "#26282E", roof: "#1B1C21", pattern: "carbon", stripes: { colors: ["#E5322D"], width: 0.06 } },
  { id: "chrome", name: "Chrome", rarity: "epic", body: "#C9CDD4", roof: "#9EA3AD", metallic: true },
  { id: "midnight", name: "Midnight", rarity: "epic", body: "#14151B", roof: "#0D0E12", glow: "#22D3EE", stripes: { colors: ["#22D3EE"], width: 0.05 } },
  { id: "camo", name: "Camo", rarity: "epic", body: "#6E7B4F", roof: "#56603D", pattern: "camo" },
  { id: "flames", name: "Hot Rod", rarity: "epic", body: "#121214", roof: "#121214", pattern: "flames" },
  // legendary
  { id: "gold", name: "Gold Rush", rarity: "legendary", body: "#E2B13C", roof: "#B8871F", metallic: true, glow: "#FFD36B" },
  { id: "holo", name: "Prism", rarity: "legendary", body: "#B07CFF", roof: "#8C5BE6", holo: true, glow: "#FF7AD9" },
  { id: "flag", name: "Chequered", rarity: "legendary", body: "#FFFFFF", roof: "#121214", pattern: "checker", glow: "#FFFFFF" },
];

export const STOCK = SKINS[0];

export const skinById = (id: string | null | undefined) => SKINS.find((s) => s.id === id) ?? STOCK;
