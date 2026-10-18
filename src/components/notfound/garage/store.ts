import { store } from "../engine/core";
import { RARITIES, RARITY, SKINS, type Rarity, type Skin } from "../engine/skins";

// The garage: coins won in the three games, the skins they buy, the one on
// the car. Kept in this browser only; nothing is ever paid for.

const KEY = "wh-404-garage";
export const CRATE_COST = 50;
/** A skin you already have: half the price back. */
export const DUPLICATE_REFUND = CRATE_COST / 2;

export interface Garage {
  coins: number;
  owned: string[];
  equipped: string;
  /** Crates opened so far. */
  opened: number;
}

const fresh = (): Garage => ({ coins: 0, owned: ["stock"], equipped: "stock", opened: 0 });

export function loadGarage(): Garage {
  const g = store.json<Partial<Garage>>(KEY);
  if (!g) return fresh();
  const owned = Array.from(new Set(["stock", ...(g.owned ?? []).filter((id) => SKINS.some((s) => s.id === id))]));
  return {
    coins: Math.max(0, Math.floor(Number(g.coins) || 0)),
    owned,
    equipped: owned.includes(g.equipped ?? "") ? g.equipped! : "stock",
    opened: Math.max(0, Math.floor(Number(g.opened) || 0)),
  };
}

export const saveGarage = (g: Garage) => store.set(KEY, g);

/** Rarity first, by the published odds; then any skin of that rarity. */
export function rollSkin(rand = Math.random): Skin {
  const total = RARITIES.reduce((n, r) => n + RARITY[r].weight, 0);
  let x = rand() * total;
  let rarity: Rarity = "common";
  for (const r of RARITIES) {
    x -= RARITY[r].weight;
    if (x < 0) {
      rarity = r;
      break;
    }
  }
  const pool = SKINS.filter((s) => s.rarity === rarity && s.id !== "stock");
  return pool[Math.floor(rand() * pool.length)];
}

export interface Opening {
  skin: Skin;
  duplicate: boolean;
  refund: number;
  /** The strip that spins past; `skin` sits at `win`. */
  reel: Skin[];
  win: number;
}

export const REEL = 56;
export const REEL_WIN = 47;

export function openCrate(g: Garage): { garage: Garage; opening: Opening } | null {
  if (g.coins < CRATE_COST) return null;
  const skin = rollSkin();
  const duplicate = g.owned.includes(skin.id);
  const refund = duplicate ? DUPLICATE_REFUND : 0;
  const reel = Array.from({ length: REEL }, (_, i) => (i === REEL_WIN ? skin : rollSkin()));
  return {
    garage: {
      ...g,
      coins: g.coins - CRATE_COST + refund,
      owned: duplicate ? g.owned : [...g.owned, skin.id],
      opened: g.opened + 1,
    },
    opening: { skin, duplicate, refund, reel, win: REEL_WIN },
  };
}
