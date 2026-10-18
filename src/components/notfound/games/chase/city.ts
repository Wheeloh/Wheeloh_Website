import { clamp } from "../../engine/core";

// The chase's town, generated anew every run: streets of uneven widths, a
// few blocks merged across their street (dead ends, T-junctions), and each
// lot made into buildings, a park, a plaza, a car park or a building site.
// Everything is sized in car lengths (L) so it scales with the screen.

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface Circle {
  x: number;
  y: number;
  r: number;
}
export interface Building extends Rect {
  tall: number; // shadow length, in car lengths
  roof: string;
  details: Rect[];
  pad?: boolean; // a helipad on the roof
}
export type LotKind = "build" | "park" | "plaza" | "parking" | "works";
export interface Lot extends Rect {
  kind: LotKind;
  buildings: Building[];
  solids: Circle[]; // big trees, the fountain, a crane's foot
  bays: Rect[]; // car park lines
  paths: Rect[]; // park paths
}

export type PropKind = "lamp" | "hydrant" | "bin" | "bench" | "cone" | "crate" | "barrier" | "sapling" | "parked";
export interface Prop {
  kind: PropKind;
  x: number;
  y: number;
  r: number;
  a: number;
  vx: number;
  vy: number;
  w: number;
  broken: boolean;
  color?: string;
  cell: number; // where it sits in the lookup grid
}

const ROOFS = ["#FFFFFF", "#FBFBFC", "#F6F7F9", "#FAF8F5", "#F3F4F7"];
const PARKED = ["#2F6BFF", "#E5322D", "#F2F2F4", "#121214", "#8E929C", "#F5B83D", "#1E4B37"];

/** Breaking point of each prop (impact speed, in units of the reference car). */
export const BREAK: Record<PropKind, number> = {
  lamp: 170,
  hydrant: 190,
  bin: 60,
  bench: 110,
  cone: 40,
  crate: 90,
  barrier: 80,
  sapling: 120,
  parked: 99999,
};
/** How heavy a prop is next to a car (1). */
export const MASS: Record<PropKind, number> = {
  lamp: 0.6,
  hydrant: 0.8,
  bin: 0.15,
  bench: 0.4,
  cone: 0.05,
  crate: 0.25,
  barrier: 0.3,
  sapling: 0.4,
  parked: 1.6,
};

export class City {
  readonly cols: number;
  readonly L: number;
  xs: number[] = []; // left edge of each north-south street
  ys: number[] = []; // top edge of each east-west street
  sw: number[] = []; // width of each north-south street
  sh: number[] = []; // width of each east-west street
  /** North-south street segment along line i, spanning row j. */
  vOpen: boolean[][] = [];
  /** East-west street segment along line j, spanning column i. */
  hOpen: boolean[][] = [];
  lots: Lot[] = [];
  lotOf: number[] = []; // cell → lot
  props: Prop[] = [];
  grid = new Map<number, Prop[]>();
  W = 1;
  H = 1;
  private gridSize: number;

  constructor(L: number, cols: number, private rand: () => number) {
    this.L = L;
    this.cols = cols;
    this.gridSize = L * 3;
    this.layoutStreets();
    this.mergeBlocks();
    this.fillLots();
    this.placeStreetProps();
  }

  // ------------------------------------------------------------- streets

  private layoutStreets() {
    const { L, cols, rand } = this;
    const lines = cols + 1;
    const widths = () => Array.from({ length: lines }, (_, i) => (i > 0 && i < cols && rand() < 0.22 ? L * 3.1 : L * 2.25));
    this.sw = widths();
    this.sh = widths();
    const blocks = () => Array.from({ length: cols }, () => L * (4.2 + rand() * 4.6));
    const bw = blocks();
    const bh = blocks();
    this.xs = [0];
    this.ys = [0];
    for (let i = 0; i < cols; i++) {
      this.xs.push(this.xs[i] + this.sw[i] + bw[i]);
      this.ys.push(this.ys[i] + this.sh[i] + bh[i]);
    }
    this.W = this.xs[cols] + this.sw[cols];
    this.H = this.ys[cols] + this.sh[cols];
    this.vOpen = Array.from({ length: lines }, () => Array(cols).fill(true));
    this.hOpen = Array.from({ length: lines }, () => Array(cols).fill(true));
  }

  /** Cell (i, j)'s rectangle. */
  cell(i: number, j: number): Rect {
    const x = this.xs[i] + this.sw[i];
    const y = this.ys[j] + this.sh[j];
    return { x, y, w: this.xs[i + 1] - x, h: this.ys[j + 1] - y };
  }

  /** Merge some neighbouring blocks across their street, keeping every crossing reachable. */
  private mergeBlocks() {
    const { cols, rand } = this;
    this.lotOf = Array(cols * cols).fill(-1);
    const merged = new Set<number>();
    const order = Array.from({ length: cols * cols }, (_, k) => k).sort(() => rand() - 0.5);
    const pairs: [number, number][] = [];
    for (const k of order) {
      if (rand() > 0.2 || merged.has(k)) continue;
      const i = k % cols;
      const j = Math.floor(k / cols);
      const right = rand() < 0.5;
      const ni = right ? i + 1 : i;
      const nj = right ? j : j + 1;
      if (ni >= cols || nj >= cols) continue;
      const nk = nj * cols + ni;
      if (merged.has(nk)) continue;
      // close the street between them, unless that cuts the town in two
      if (right) this.vOpen[i + 1][j] = false;
      else this.hOpen[j + 1][i] = false;
      if (!this.connected()) {
        if (right) this.vOpen[i + 1][j] = true;
        else this.hOpen[j + 1][i] = true;
        continue;
      }
      merged.add(k);
      merged.add(nk);
      pairs.push([k, nk]);
    }
    const lots: Rect[] = [];
    for (const [a, b] of pairs) {
      const A = this.cell(a % cols, Math.floor(a / cols));
      const B = this.cell(b % cols, Math.floor(b / cols));
      this.lotOf[a] = this.lotOf[b] = lots.length;
      lots.push({ x: A.x, y: A.y, w: B.x + B.w - A.x, h: B.y + B.h - A.y });
    }
    for (let k = 0; k < cols * cols; k++) {
      if (this.lotOf[k] >= 0) continue;
      this.lotOf[k] = lots.length;
      lots.push(this.cell(k % cols, Math.floor(k / cols)));
    }
    this.lots = lots.map((r) => ({ ...r, kind: "build", buildings: [], solids: [], bays: [], paths: [] }));
  }

  // ------------------------------------------------------------- graph

  get nodes() {
    return (this.cols + 1) ** 2;
  }

  nodeXY(id: number): [number, number] {
    const n = this.cols + 1;
    const i = id % n;
    const j = Math.floor(id / n);
    return [this.xs[i] + this.sw[i] / 2, this.ys[j] + this.sh[j] / 2];
  }

  /** Nearest crossing. */
  node(x: number, y: number) {
    const n = this.cols + 1;
    let bi = 0;
    let bj = 0;
    for (let i = 1; i < n; i++) if (Math.abs(this.xs[i] + this.sw[i] / 2 - x) < Math.abs(this.xs[bi] + this.sw[bi] / 2 - x)) bi = i;
    for (let j = 1; j < n; j++) if (Math.abs(this.ys[j] + this.sh[j] / 2 - y) < Math.abs(this.ys[bj] + this.sh[bj] / 2 - y)) bj = j;
    return bj * n + bi;
  }

  /** Crossings reachable by an open street from `id`. */
  links(id: number): number[] {
    const n = this.cols + 1;
    const i = id % n;
    const j = Math.floor(id / n);
    const out: number[] = [];
    if (i > 0 && this.hOpen[j][i - 1]) out.push(id - 1);
    if (i < this.cols && this.hOpen[j][i]) out.push(id + 1);
    if (j > 0 && this.vOpen[i][j - 1]) out.push(id - n);
    if (j < this.cols && this.vOpen[i][j]) out.push(id + n);
    return out;
  }

  private connected() {
    const seen = new Uint8Array(this.nodes);
    const q = [0];
    seen[0] = 1;
    for (let h = 0; h < q.length; h++) for (const v of this.links(q[h])) if (!seen[v]) (seen[v] = 1), q.push(v);
    return q.length === this.nodes;
  }

  /** Shortest street route; `bias` breaks ties the same way for a given car. */
  route(from: number, to: number, bias = 0) {
    const prev = new Int16Array(this.nodes).fill(-1);
    prev[from] = from;
    const q = [from];
    const rot = Math.floor(bias * 4);
    for (let h = 0; h < q.length; h++) {
      const c = q[h];
      if (c === to) break;
      const l = this.links(c);
      for (let k = 0; k < l.length; k++) {
        const v = l[(k + rot) % l.length];
        if (prev[v] < 0) {
          prev[v] = c;
          q.push(v);
        }
      }
    }
    const path = [to];
    let c = to;
    while (c !== from && prev[c] >= 0) {
      c = prev[c];
      path.push(c);
    }
    return path.reverse();
  }

  /** A random point on an open street, in its lane. */
  streetPoint(): [number, number] {
    const n = this.cols + 1;
    for (let tries = 0; tries < 30; tries++) {
      const vertical = this.rand() < 0.5;
      const line = Math.floor(this.rand() * n);
      const seg = Math.floor(this.rand() * this.cols);
      if (vertical ? !this.vOpen[line][seg] : !this.hOpen[line][seg]) continue;
      const t = 0.15 + this.rand() * 0.7;
      const lane = (this.rand() < 0.5 ? -0.25 : 0.25) * this.L;
      if (vertical) {
        const y0 = this.ys[seg] + this.sh[seg];
        return [this.xs[line] + this.sw[line] / 2 + lane, y0 + (this.ys[seg + 1] - y0) * t];
      }
      const x0 = this.xs[seg] + this.sw[seg];
      return [x0 + (this.xs[seg + 1] - x0) * t, this.ys[line] + this.sh[line] / 2 + lane];
    }
    return this.nodeXY(0);
  }

  // ------------------------------------------------------------- lookups

  private index(edges: number[], widths: number[], v: number) {
    let i = 0;
    while (i < this.cols && edges[i + 1] <= v) i++;
    return { i, street: v < edges[i] + widths[i] };
  }

  /** The lot under a point (null on a street). */
  lotAt(x: number, y: number): Lot | null {
    if (x < 0 || y < 0 || x >= this.W || y >= this.H) return null;
    const cx = this.index(this.xs, this.sw, x);
    const cy = this.index(this.ys, this.sh, y);
    const c = this.cols;
    if (!cx.street && !cy.street) {
      if (cx.i >= c || cy.i >= c) return null;
      return this.lots[this.lotOf[cy.i * c + cx.i]];
    }
    if (cx.street && !cy.street && cx.i > 0 && cx.i < c && !this.vOpen[cx.i][cy.i]) return this.lots[this.lotOf[cy.i * c + cx.i - 1]];
    if (cy.street && !cx.street && cy.i > 0 && cy.i < c && !this.hOpen[cy.i][cx.i]) return this.lots[this.lotOf[(cy.i - 1) * c + cx.i]];
    return null;
  }

  /** Inside a building (sight lines, spawning). */
  solidAt(x: number, y: number) {
    const lot = this.lotAt(x, y);
    if (!lot) return false;
    for (const b of lot.buildings) if (x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h) return true;
    return false;
  }

  /** Lots overlapping a box (for collisions and drawing). */
  lotsIn(x0: number, y0: number, x1: number, y1: number): Lot[] {
    const out = new Set<Lot>();
    const c = this.cols;
    const i0 = clamp(this.index(this.xs, this.sw, Math.max(0, x0)).i - 1, 0, c - 1);
    const i1 = clamp(this.index(this.xs, this.sw, Math.min(this.W - 1, x1)).i, 0, c - 1);
    const j0 = clamp(this.index(this.ys, this.sh, Math.max(0, y0)).i - 1, 0, c - 1);
    const j1 = clamp(this.index(this.ys, this.sh, Math.min(this.H - 1, y1)).i, 0, c - 1);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) out.add(this.lots[this.lotOf[j * c + i]]);
    return Array.from(out);
  }

  // ------------------------------------------------------------- props

  private key(x: number, y: number) {
    return Math.floor(y / this.gridSize) * 4096 + Math.floor(x / this.gridSize);
  }

  addProp(kind: PropKind, x: number, y: number, r: number, color?: string, a = 0) {
    const p: Prop = { kind, x, y, r, a, vx: 0, vy: 0, w: 0, broken: false, color, cell: this.key(x, y) };
    this.props.push(p);
    const list = this.grid.get(p.cell);
    if (list) list.push(p);
    else this.grid.set(p.cell, [p]);
    return p;
  }

  /** A prop moved: file it under its new cell. */
  refile(p: Prop) {
    const k = this.key(p.x, p.y);
    if (k === p.cell) return;
    const old = this.grid.get(p.cell);
    if (old) old.splice(old.indexOf(p), 1);
    p.cell = k;
    const list = this.grid.get(k);
    if (list) list.push(p);
    else this.grid.set(k, [p]);
  }

  propsNear(x: number, y: number, r: number): Prop[] {
    const s = this.gridSize;
    const out: Prop[] = [];
    for (let gy = Math.floor((y - r) / s); gy <= Math.floor((y + r) / s); gy++)
      for (let gx = Math.floor((x - r) / s); gx <= Math.floor((x + r) / s); gx++) {
        const list = this.grid.get(gy * 4096 + gx);
        if (list) out.push(...list);
      }
    return out;
  }

  // ------------------------------------------------------------- lots

  private fillLots() {
    const { rand, L } = this;
    const side = L * 0.42;
    for (const lot of this.lots) {
      const roll = rand();
      const big = lot.w * lot.h > (L * 9) ** 2;
      lot.kind = roll < 0.56 ? "build" : roll < 0.68 ? "park" : roll < 0.76 ? "plaza" : roll < 0.89 ? "parking" : "works";
      if (big && lot.kind === "plaza") lot.kind = "park";
      const inner = { x: lot.x + side, y: lot.y + side, w: lot.w - side * 2, h: lot.h - side * 2 };
      if (lot.kind === "build") this.buildings(lot, inner);
      else if (lot.kind === "park") this.park(lot, inner);
      else if (lot.kind === "plaza") this.plaza(lot, inner);
      else if (lot.kind === "parking") this.parking(lot, inner);
      else this.works(lot, inner);
    }
  }

  /** Buildings by splitting the lot again and again: seams, sometimes an alley or a courtyard. */
  private buildings(lot: Lot, r: Rect) {
    const { rand, L } = this;
    const split = (b: Rect, depth: number) => {
      const long = Math.max(b.w, b.h);
      if (depth > 3 || long < L * 4.2 || (depth > 0 && rand() < 0.22)) {
        if (depth > 0 && rand() < 0.08) return; // a courtyard
        const set = () => (rand() < 0.5 ? 0 : L * (0.15 + rand() * 0.35));
        const x = b.x + set();
        const y = b.y + set();
        const w = b.x + b.w - set() - x;
        const h = b.y + b.h - set() - y;
        if (w < L * 1.2 || h < L * 1.2) return;
        const bld: Building = { x, y, w, h, tall: 0.15 + rand() * 0.5, roof: ROOFS[Math.floor(rand() * ROOFS.length)], details: [] };
        if (w > L * 4 && h > L * 4 && rand() < 0.18) bld.pad = true;
        const n = Math.floor(rand() * 4);
        for (let k = 0; k < n; k++) {
          const dw = L * (0.3 + rand() * 0.6);
          const dh = L * (0.3 + rand() * 0.5);
          if (w < dw + L || h < dh + L) continue;
          bld.details.push({ x: x + L * 0.3 + rand() * (w - dw - L * 0.6), y: y + L * 0.3 + rand() * (h - dh - L * 0.6), w: dw, h: dh });
        }
        lot.buildings.push(bld);
        return;
      }
      const alongX = b.w > b.h ? rand() < 0.8 : rand() < 0.2;
      const span = alongX ? b.w : b.h;
      const alley = span > L * 9 && rand() < 0.3;
      const gap = alley ? L * 2.1 : L * 0.12;
      const f = 0.32 + rand() * 0.36;
      const a = span * f - gap / 2;
      if (alongX) {
        split({ x: b.x, y: b.y, w: a, h: b.h }, depth + 1);
        split({ x: b.x + a + gap, y: b.y, w: b.w - a - gap, h: b.h }, depth + 1);
      } else {
        split({ x: b.x, y: b.y, w: b.w, h: a }, depth + 1);
        split({ x: b.x, y: b.y + a + gap, w: b.w, h: b.h - a - gap }, depth + 1);
      }
    };
    split(r, 0);
  }

  private park(lot: Lot, r: Rect) {
    const { rand, L } = this;
    // a cross of paths
    lot.paths.push({ x: r.x, y: r.y + r.h * (0.35 + rand() * 0.3) - L * 0.3, w: r.w, h: L * 0.6 });
    lot.paths.push({ x: r.x + r.w * (0.35 + rand() * 0.3) - L * 0.3, y: r.y, w: L * 0.6, h: r.h });
    const n = Math.round((r.w * r.h) / (L * L * 9));
    for (let k = 0; k < n; k++) {
      const big = rand() < 0.45;
      const rr = big ? L * (0.5 + rand() * 0.3) : L * 0.26;
      const x = r.x + rr + rand() * (r.w - rr * 2);
      const y = r.y + rr + rand() * (r.h - rr * 2);
      if (lot.paths.some((p) => x + rr > p.x && x - rr < p.x + p.w && y + rr > p.y && y - rr < p.y + p.h)) continue;
      if (lot.solids.some((s) => Math.hypot(s.x - x, s.y - y) < s.r + rr + L * 0.8)) continue;
      if (big) lot.solids.push({ x, y, r: rr });
      else this.addProp("sapling", x, y, rr);
    }
    for (let k = 0; k < 3; k++) {
      const p = lot.paths[k % 2];
      const along = p.w > p.h;
      const t = 0.2 + rand() * 0.6;
      if (along) this.addProp("bench", p.x + p.w * t, p.y - L * 0.35, L * 0.22, undefined, 0);
      else this.addProp("bench", p.x - L * 0.35, p.y + p.h * t, L * 0.22, undefined, Math.PI / 2);
    }
  }

  private plaza(lot: Lot, r: Rect) {
    const { L } = this;
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    const fr = Math.min(r.w, r.h) * 0.16 + L * 0.4;
    lot.solids.push({ x: cx, y: cy, r: fr });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      const d = fr + L * 1.4;
      if (k % 2) this.addProp("bench", cx + Math.cos(a) * d, cy + Math.sin(a) * d, L * 0.22, undefined, a + Math.PI / 2);
      else this.addProp("lamp", cx + Math.cos(a) * d, cy + Math.sin(a) * d, L * 0.12);
    }
  }

  private parking(lot: Lot, r: Rect) {
    const { rand, L } = this;
    // rows of bays facing an aisle
    const bay = L * 0.62;
    const depth = L * 1.25;
    const rows = Math.max(1, Math.floor(r.h / (depth * 2 + L * 2.2)));
    for (let k = 0; k < rows; k++) {
      const y0 = r.y + L * 0.4 + k * (depth * 2 + L * 2.2);
      for (const top of [true, false]) {
        const y = top ? y0 : y0 + depth + L * 2.2;
        if (y + depth > r.y + r.h) continue;
        for (let x = r.x + L * 0.3; x + bay < r.x + r.w - L * 0.3; x += bay) {
          lot.bays.push({ x, y, w: bay, h: depth });
          if (rand() < 0.42) this.addProp("parked", x + bay / 2, y + depth / 2, L * 0.36, PARKED[Math.floor(rand() * PARKED.length)], Math.PI / 2 + (rand() - 0.5) * 0.1);
        }
      }
    }
  }

  private works(lot: Lot, r: Rect) {
    const { rand, L } = this;
    // a crane's foot, stacks of crates, a ring of cones and barriers
    lot.solids.push({ x: r.x + r.w * (0.25 + rand() * 0.5), y: r.y + r.h * (0.25 + rand() * 0.5), r: L * 0.45 });
    const n = Math.round((r.w * r.h) / (L * L * 6));
    for (let k = 0; k < n; k++) {
      const x = r.x + L * 0.5 + rand() * (r.w - L);
      const y = r.y + L * 0.5 + rand() * (r.h - L);
      if (lot.solids.some((s) => Math.hypot(s.x - x, s.y - y) < s.r + L)) continue;
      const roll = rand();
      this.addProp(roll < 0.5 ? "crate" : roll < 0.8 ? "cone" : "barrier", x, y, roll < 0.5 ? L * 0.24 : roll < 0.8 ? L * 0.13 : L * 0.2, undefined, rand() * Math.PI);
    }
  }

  /** Lamp posts along the pavements, a hydrant and a bin here and there. */
  private placeStreetProps() {
    const { rand, L } = this;
    const inset = L * 0.2;
    const step = L * 4.4;
    for (const lot of this.lots) {
      const edges: [number, number, number, number][] = [
        [lot.x + inset, lot.y + inset, lot.x + lot.w - inset, lot.y + inset],
        [lot.x + lot.w - inset, lot.y + inset, lot.x + lot.w - inset, lot.y + lot.h - inset],
        [lot.x + inset, lot.y + lot.h - inset, lot.x + lot.w - inset, lot.y + lot.h - inset],
        [lot.x + inset, lot.y + inset, lot.x + inset, lot.y + lot.h - inset],
      ];
      for (const [ax, ay, bx, by] of edges) {
        const len = Math.hypot(bx - ax, by - ay);
        const n = Math.floor(len / step);
        for (let k = 1; k <= n; k++) {
          const t = k / (n + 1);
          const x = ax + (bx - ax) * t;
          const y = ay + (by - ay) * t;
          const roll = rand();
          if (roll < 0.62) this.addProp("lamp", x, y, L * 0.12);
          else if (roll < 0.74) this.addProp("hydrant", x, y, L * 0.12);
          else if (roll < 0.88) this.addProp("bin", x, y, L * 0.15);
        }
      }
    }
  }
}
