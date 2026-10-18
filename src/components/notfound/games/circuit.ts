import { Car, GRASS, ROAD } from "../engine/car";
import { clamp, formatTime, Game, INK, store, wrap, type GameHooks, type HudCell } from "../engine/core";
import { SkidLayer } from "../engine/skids";
import { boostOf } from "../engine/skins";

// Game 2: a circuit. Five red lights, three laps, and the ghost of your best
// lap to beat. The track is drawn once; each frame only moves the cars.

// The layout, in a 1.6 × 1 design box, driven clockwise. A long main
// straight, a sweeping turn 1, esses, a dip on the back section, a hairpin
// into the infield and a kink onto the straight.
const POINTS: [number, number][] = [
  [0.42, 0.87], [0.9, 0.88], [1.26, 0.85],
  [1.46, 0.74], [1.5, 0.55], [1.44, 0.42],
  [1.34, 0.37], [1.285, 0.285], [1.345, 0.18], [1.3, 0.09],
  [1.08, 0.07], [0.92, 0.13], [0.8, 0.24],
  [0.66, 0.22], [0.56, 0.11], [0.34, 0.08],
  [0.15, 0.16], [0.1, 0.34], [0.2, 0.47],
  [0.42, 0.48], [0.55, 0.52], [0.585, 0.615], [0.47, 0.685],
  [0.27, 0.69], [0.165, 0.745], [0.14, 0.835], [0.24, 0.89],
];
const TRACK = 0.1; // track width, design units
const START_AT: [number, number] = [0.72, 0.876]; // the start / finish line
const N = 720; // samples along the centreline
const LAPS = 3;
const GHOST_STEP = 50; // ms between ghost samples

const ASPHALT = "#CDD0D6";
const RUNOFF = "#EDEEF1";
const KERB_RED = "#E5322D";

const KEY_LAP = "wh-404-lap";
const KEY_RACE = "wh-404-race";
const KEY_GHOST = "wh-404-ghost";

type Phase = "grid" | "lights" | "race" | "done";

interface Ghost {
  lap: number;
  pts: number[]; // u, v, heading (design frame), every GHOST_STEP ms
}

/** Closed centripetal Catmull-Rom through the points, resampled evenly. */
function centreline(points: [number, number][], n: number): [number, number][] {
  const dense: [number, number][] = [];
  const m = points.length;
  for (let i = 0; i < m; i++) {
    const p0 = points[(i - 1 + m) % m];
    const p1 = points[i];
    const p2 = points[(i + 1) % m];
    const p3 = points[(i + 2) % m];
    const tj = (t: number, a: [number, number], b: [number, number]) => t + Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1]));
    const t0 = 0;
    const t1 = tj(t0, p0, p1);
    const t2 = tj(t1, p1, p2);
    const t3 = tj(t2, p2, p3);
    for (let s = 0; s < 24; s++) {
      const t = t1 + ((t2 - t1) * s) / 24;
      const L = (a: [number, number], b: [number, number], ta: number, tb: number): [number, number] => [
        ((tb - t) / (tb - ta)) * a[0] + ((t - ta) / (tb - ta)) * b[0],
        ((tb - t) / (tb - ta)) * a[1] + ((t - ta) / (tb - ta)) * b[1],
      ];
      const A1 = L(p0, p1, t0, t1);
      const A2 = L(p1, p2, t1, t2);
      const A3 = L(p2, p3, t2, t3);
      dense.push(L(L(A1, A2, t0, t2), L(A2, A3, t1, t3), t1, t2));
    }
  }
  const cum = [0];
  for (let i = 0; i < dense.length; i++) {
    const a = dense[i];
    const b = dense[(i + 1) % dense.length];
    cum.push(cum[i] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const total = cum[dense.length];
  const out: [number, number][] = [];
  let j = 0;
  for (let k = 0; k < n; k++) {
    const target = (total * k) / n;
    while (cum[j + 1] < target) j++;
    const f = (target - cum[j]) / (cum[j + 1] - cum[j] || 1);
    const a = dense[j];
    const b = dense[(j + 1) % dense.length];
    out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
  }
  return out;
}

const DESIGN = centreline(POINTS, N);

export class CircuitGame extends Game {
  private car = new Car(40);
  private skids = new SkidLayer();
  private layer = document.createElement("canvas");

  // geometry (world px)
  private portrait = false;
  private scale = 1;
  private ox = 0;
  private oy = 0;
  private worldW = 1;
  private worldH = 1;
  private xs = new Float32Array(N);
  private ys = new Float32Array(N);
  private tx = new Float32Array(N);
  private ty = new Float32Array(N);
  private half = 20; // half the track width
  private s0 = 0; // sample of the start line

  // camera: the world point at the centre of the view
  private view = { x: 0, y: 0, w: 1, h: 1 };
  private cam = { x: 0, y: 0 };
  private follow = false;

  // race
  private phase: Phase = "grid";
  private lightsAt = 0;
  private holdFor = 0;
  private lap = 1;
  private lapStart = 0;
  private raceStart = 0;
  private idx = 0;
  private rel = 0;
  private sectors = 0;
  private best: number | null = store.num(KEY_LAP);
  private bestRace: number | null = store.num(KEY_RACE);
  private ghost: Ghost | null = store.json<Ghost>(KEY_GHOST);
  private recording: number[] = [];
  private lastSample = 0;
  private delta: { ms: number; until: number } | null = null;
  private wrongFor = 0;
  private time = 0;

  constructor(canvas: HTMLCanvasElement, hooks: GameHooks) {
    super(canvas, hooks);
    this.boot();
    this.toGrid();
  }

  // --------------------------------------------------------------- geometry

  /** Design box → world px. */
  private toWorld(u: number, v: number): [number, number] {
    const p = this.portrait ? 1 - v : u;
    const q = this.portrait ? u : v;
    return [this.ox + p * this.scale, this.oy + q * this.scale];
  }

  private toDesign(x: number, y: number): [number, number] {
    const p = (x - this.ox) / this.scale;
    const q = (y - this.oy) / this.scale;
    return this.portrait ? [q, 1 - p] : [p, q];
  }

  private get turn() {
    return this.portrait ? Math.PI / 2 : 0;
  }

  protected setup() {
    const room = this.hooks.room?.() ?? { top: 0, avoid: null, hintHalf: 0 };
    const pad = 12;
    const top = room.top + 4;
    const bottom = (room.avoid ? Math.min(this.H, room.avoid.y) : this.H) - pad;
    this.view = { x: pad, y: top, w: Math.max(80, this.W - pad * 2), h: Math.max(80, bottom - top) };
    const v = this.view;

    // design extent of the track, with its width and a little run-off
    let u0 = 9, v0 = 9, u1 = -9, v1 = -9;
    for (const [u, w] of DESIGN) {
      u0 = Math.min(u0, u); v0 = Math.min(v0, w); u1 = Math.max(u1, u); v1 = Math.max(v1, w);
    }
    const m = TRACK * 0.75;
    u0 -= m; v0 -= m; u1 += m; v1 += m;
    this.portrait = v.h > v.w * 1.15;
    const bw = this.portrait ? v1 - v0 : u1 - u0;
    const bh = this.portrait ? u1 - u0 : v1 - v0;
    // fit the view, unless the car would get too small: then the camera follows
    let scale = Math.min(v.w / bw, v.h / bh);
    const L = (s: number) => s * TRACK * 0.46;
    if (L(scale) < 24) scale = 24 / (TRACK * 0.46);
    if (L(scale) > 50) scale = 50 / (TRACK * 0.46);
    this.scale = scale;
    this.worldW = bw * scale;
    this.worldH = bh * scale;
    // origin so the design box minus margins lands at 0,0
    this.ox = 0;
    this.oy = 0;
    const [ax, ay] = this.toWorld(u0, v0);
    const [bx, by] = this.toWorld(u1, v1);
    this.ox = -Math.min(ax, bx);
    this.oy = -Math.min(ay, by);
    this.follow = this.worldW > v.w + 1 || this.worldH > v.h + 1;

    this.car.size(L(scale));
    this.half = (TRACK * scale) / 2;

    for (let i = 0; i < N; i++) {
      const [x, y] = this.toWorld(DESIGN[i][0], DESIGN[i][1]);
      this.xs[i] = x;
      this.ys[i] = y;
    }
    for (let i = 0; i < N; i++) {
      const a = (i - 1 + N) % N;
      const b = (i + 1) % N;
      const dx = this.xs[b] - this.xs[a];
      const dy = this.ys[b] - this.ys[a];
      const d = Math.hypot(dx, dy) || 1;
      this.tx[i] = dx / d;
      this.ty[i] = dy / d;
    }
    const [sx, sy] = this.toWorld(START_AT[0], START_AT[1]);
    this.s0 = this.nearest(sx, sy, true);

    this.skids.resize(this.worldW, this.worldH);
    this.skids.clear();
    this.paintTrack();
  }

  /** Index of the centreline sample nearest to (x, y). */
  private nearest(x: number, y: number, full = false): number {
    let best = 0;
    let bd = Infinity;
    const from = full ? 0 : this.idx - 40;
    const to = full ? N - 1 : this.idx + 40;
    for (let k = from; k <= to; k++) {
      const i = (k + N) % N;
      const d = (this.xs[i] - x) ** 2 + (this.ys[i] - y) ** 2;
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    if (!full && bd > (this.half * 3) ** 2) return this.nearest(x, y, true);
    return best;
  }

  /** Signed turn of the centreline at i (radians per px, + = right). */
  private curve(i: number) {
    const a = (i - 4 + N) % N;
    const b = (i + 4) % N;
    const h = wrap(Math.atan2(this.ty[b], this.tx[b]) - Math.atan2(this.ty[a], this.tx[a]));
    const len = Math.hypot(this.xs[b] - this.xs[a], this.ys[b] - this.ys[a]) || 1;
    return h / len;
  }

  // -------------------------------------------------------------- painting

  /** The track, drawn once per layout into an offscreen canvas. */
  private paintTrack() {
    const c = this.layer;
    c.width = Math.ceil(this.worldW * this.dpr);
    c.height = Math.ceil(this.worldH * this.dpr);
    const g = c.getContext("2d")!;
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const { xs, ys, half } = this;
    const path = () => {
      g.beginPath();
      g.moveTo(xs[0], ys[0]);
      for (let i = 1; i < N; i++) g.lineTo(xs[i], ys[i]);
      g.closePath();
    };
    g.lineJoin = "round";
    g.lineCap = "round";
    // run-off
    path();
    g.strokeStyle = RUNOFF;
    g.lineWidth = half * 2 + half * 0.9;
    g.stroke();
    // kerbs: red and white, outside every tight corner, inside the tightest
    const kw = Math.max(3, half * 0.22);
    const block = Math.max(6, half * 0.45);
    const zone = new Int8Array(N);
    for (let i = 0; i < N; i++) {
      const r = 1 / Math.max(1e-6, Math.abs(this.curve(i)));
      if (r < half * 2.4) zone[i] = 2;
      else if (r < half * 4) zone[i] = 1;
    }
    // widen the zones a little so kerbs start before the turn-in
    const grow = new Int8Array(N);
    for (let i = 0; i < N; i++) for (let k = -5; k <= 5; k++) grow[i] = Math.max(grow[i], zone[(i + k + N) % N]);
    let run = 0;
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      if (!grow[i]) continue;
      const side = Math.sign(this.curve(i)) || 1; // outside of a right-hander is on the left
      const sides = grow[i] === 2 ? [-side, side] : [-side];
      run += Math.hypot(xs[j] - xs[i], ys[j] - ys[i]);
      for (const s of sides) {
        const nxi = -this.ty[i] * s;
        const nyi = this.tx[i] * s;
        const nxj = -this.ty[j] * s;
        const nyj = this.tx[j] * s;
        g.fillStyle = Math.floor(run / block) % 2 ? "#FFFFFF" : KERB_RED;
        g.beginPath();
        g.moveTo(xs[i] + nxi * (half - 1), ys[i] + nyi * (half - 1));
        g.lineTo(xs[j] + nxj * (half - 1), ys[j] + nyj * (half - 1));
        g.lineTo(xs[j] + nxj * (half + kw), ys[j] + nyj * (half + kw));
        g.lineTo(xs[i] + nxi * (half + kw), ys[i] + nyi * (half + kw));
        g.closePath();
        g.fill();
      }
    }
    // asphalt
    path();
    g.strokeStyle = ASPHALT;
    g.lineWidth = half * 2;
    g.stroke();
    // white edge lines, painted just inside the asphalt
    const edge = Math.max(1.2, half * 0.06);
    for (const s of [-1, 1]) {
      g.beginPath();
      for (let i = 0; i <= N; i++) {
        const k = i % N;
        const o = half - edge * 1.6;
        const x = xs[k] - this.ty[k] * s * o;
        const y = ys[k] + this.tx[k] * s * o;
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.strokeStyle = "rgba(255,255,255,0.95)";
      g.lineWidth = edge;
      g.stroke();
    }
    // start / finish: the Wheeloh flag across the track, a grid box behind
    const i0 = this.s0;
    const fx = this.tx[i0];
    const fy = this.ty[i0];
    const nx = -fy;
    const ny = fx;
    const cells = 8;
    const sq = (half * 2) / cells;
    for (let r = 0; r < 2; r++)
      for (let k = 0; k < cells; k++) {
        g.fillStyle = (k + r) % 2 ? "#FFFFFF" : INK;
        const off = -half + k * sq;
        const x = xs[i0] + nx * off + fx * (r - 1) * sq;
        const y = ys[i0] + ny * off + fy * (r - 1) * sq;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + nx * sq, y + ny * sq);
        g.lineTo(x + nx * sq + fx * sq, y + ny * sq + fy * sq);
        g.lineTo(x + fx * sq, y + fy * sq);
        g.closePath();
        g.fill();
      }
    // pole position box
    const L = this.car.L;
    const bx = xs[i0] - fx * L * 1.05;
    const by = ys[i0] - fy * L * 1.05;
    g.strokeStyle = "rgba(255,255,255,0.95)";
    g.lineWidth = Math.max(1.5, half * 0.07);
    g.beginPath();
    const w = this.car.B * 0.85;
    g.moveTo(bx + nx * w - fx * L * 0.55, by + ny * w - fy * L * 0.55);
    g.lineTo(bx + nx * w + fx * L * 0.55, by + ny * w + fy * L * 0.55);
    g.lineTo(bx - nx * w + fx * L * 0.55, by - ny * w + fy * L * 0.55);
    g.lineTo(bx - nx * w - fx * L * 0.55, by - ny * w - fy * L * 0.55);
    g.stroke();
  }

  // ------------------------------------------------------------------- race

  private gridPose(): [number, number, number] {
    const i0 = this.s0;
    const L = this.car.L;
    return [this.xs[i0] - this.tx[i0] * L * 1.05, this.ys[i0] - this.ty[i0] * L * 1.05, Math.atan2(this.ty[i0], this.tx[i0])];
  }

  private toGrid() {
    const [x, y, a] = this.gridPose();
    this.car.place(x, y, a);
    this.skids.lift(this.car);
    this.idx = this.nearest(x, y, true);
    this.rel = (this.idx - this.s0 + N) % N;
    this.cam = { x, y };
    this.clampCam();
    this.phase = "grid";
    this.lap = 1;
    this.sectors = 0;
    this.delta = null;
    this.hud();
    this.hooks.onLights?.(null);
    const [sx, sy] = this.toScreen(x, y);
    this.hooks.onReady?.({ x: sx, y: sy + this.car.L * 0.9 });
  }

  /** The view never runs past the edge of the world. */
  private clampCam() {
    const v = this.view;
    this.cam.x = clamp(this.cam.x, v.w / 2, Math.max(v.w / 2, this.worldW - v.w / 2));
    this.cam.y = clamp(this.cam.y, v.h / 2, Math.max(v.h / 2, this.worldH - v.h / 2));
  }

  private toScreen(x: number, y: number): [number, number] {
    const v = this.view;
    if (!this.follow) {
      const cx = v.x + (v.w - this.worldW) / 2;
      const cy = v.y + (v.h - this.worldH) / 2;
      return [cx + x, cy + y];
    }
    return [v.x + v.w / 2 + (x - this.cam.x), v.y + v.h / 2 + (y - this.cam.y)];
  }

  private toWorldPx(sx: number, sy: number): [number, number] {
    const [ax, ay] = this.toScreen(0, 0);
    return [sx - ax, sy - ay];
  }

  protected firstInput() {
    if (this.phase !== "grid") return;
    this.phase = "lights";
    this.lightsAt = this.time;
    this.holdFor = 0.35 + Math.random() * 0.8;
    this.hooks.onLights?.(0);
  }

  private hud() {
    const cells: HudCell[] = [];
    if (this.phase === "done") {
      cells.push({ pre: "Total ", main: formatTime(this.raceStart ? this.lapStart - this.raceStart : 0) });
      if (this.best) cells.push({ pre: "Best lap ", main: formatTime(this.best) });
    } else {
      cells.push({ pre: "Lap ", main: `${this.lap}/${LAPS}` });
      cells.push({ clock: this.phase === "race" ? { from: this.lapStart } : { from: 0, to: 0 } });
      if (this.wrongFor > 0.8) cells.push({ main: "Wrong way", tone: "bad" });
      else if (this.delta && this.time < this.delta.until)
        cells.push({ main: `${this.delta.ms < 0 ? "−" : "+"}${(Math.abs(this.delta.ms) / 1000).toFixed(2)}`, tone: this.delta.ms < 0 ? "good" : "bad" });
      else if (this.best) cells.push({ pre: "Best ", main: formatTime(this.best) });
    }
    this.hooks.onHud?.({ cells, reset: "Restart the race" });
  }

  private lapDone(now: number) {
    const lapMs = now - this.lapStart;
    const prev = this.best;
    this.delta = prev ? { ms: lapMs - prev, until: this.time + 3 } : null;
    this.earn(7, "lap");
    if (!prev || lapMs < prev) {
      if (prev) this.earn(4, "best lap");
      this.best = lapMs;
      store.set(KEY_LAP, String(Math.round(lapMs)));
      this.ghost = { lap: lapMs, pts: this.recording.map((v) => Math.round(v * 1e4) / 1e4) };
      store.set(KEY_GHOST, this.ghost);
    }
    this.recording = [];
    this.lastSample = 0;
    this.lapStart = now;
    if (this.lap >= LAPS) {
      this.phase = "done";
      const total = now - this.raceStart;
      const bestRace = this.bestRace === null ? total : Math.min(this.bestRace, total);
      this.bestRace = bestRace;
      store.set(KEY_RACE, String(Math.round(bestRace)));
      this.earn(8, "finish");
      this.hooks.onEnd?.({ title: "Chequered flag.", lead: `${LAPS} laps in`, value: formatTime(total), tail: `best lap ${formatTime(this.best!)}`, coins: this.earned });
    } else this.lap++;
    this.hud();
  }

  // ------------------------------------------------------------------- loop

  protected idle() {
    if (this.phase === "lights") return false;
    if (this.phase === "race" && this.ghost) return false; // the ghost keeps driving
    if (this.input.held()) return false;
    return this.car.speed < 2;
  }

  protected update(dt: number) {
    this.time += dt;
    if (this.phase === "lights") {
      const t = this.time - this.lightsAt;
      const lit = Math.min(5, Math.floor(t / 0.6) + 1);
      if (t < 3 + this.holdFor) this.hooks.onLights?.(t < 3 ? lit : 5);
      else {
        this.phase = "race";
        this.raceStart = this.lapStart = performance.now();
        this.recording = [];
        this.lastSample = 0;
        this.hooks.onLights?.("go");
        this.hud();
      }
      return;
    }
    this.step(dt / 2);
    this.step(dt / 2);
    if (this.follow) {
      const k = 1 - Math.exp(-6 * dt);
      const car = this.car;
      this.cam.x += (car.x + car.vx * 0.3 - this.cam.x) * k;
      this.cam.y += (car.y + car.vy * 0.3 - this.cam.y) * k;
      this.clampCam();
    }
    if (this.phase === "race") this.record();
  }

  private step(dt: number) {
    const car = this.car;
    const b = boostOf(this.skin);
    car.top = b.speed;
    car.power = b.accel;
    car.grip = b.grip;
    const p = this.input.pointer;
    let c = this.input.controls();
    if (p.active) {
      const [wx, wy] = this.toWorldPx(p.x, p.y);
      c = car.toward(wx, wy);
    }
    this.idx = this.nearest(car.x, car.y);
    const off = Math.hypot(car.x - this.xs[this.idx], car.y - this.ys[this.idx]);
    const grass = off > this.half + Math.max(3, this.half * 0.22);
    const alpha = car.step(dt, c, grass ? GRASS : ROAD);
    // the edge of the world
    const m = car.L / 2;
    if (car.x < m || car.x > this.worldW - m) {
      car.x = clamp(car.x, m, this.worldW - m);
      car.vx *= -0.3;
    }
    if (car.y < m || car.y > this.worldH - m) {
      car.y = clamp(car.y, m, this.worldH - m);
      car.vy *= -0.3;
    }
    if (grass && car.speed > 40 * car.k) this.skids.mark(car, Math.max(alpha, 0.12), "150,140,120");
    else this.skids.mark(car, alpha);

    // laps: four sectors, in order, then the line
    const rel = (this.idx - this.s0 + N) % N;
    if (this.phase === "race") {
      const q = Math.floor((rel / N) * 4);
      if (q === this.sectors + 1 && q <= 3) this.sectors = q;
      if (this.rel > N * 0.85 && rel < N * 0.15 && this.sectors === 3) {
        this.sectors = 0;
        this.lapDone(performance.now());
      }
    }
    this.rel = rel;
    // wrong way: driving against the track for a moment
    const along = car.vx * this.tx[this.idx] + car.vy * this.ty[this.idx];
    const was = this.wrongFor > 0.8;
    this.wrongFor = along < -60 * car.k ? this.wrongFor + dt : 0;
    if (was !== this.wrongFor > 0.8) this.hud();
    if (this.delta && this.time >= this.delta.until) {
      this.delta = null;
      this.hud();
    }
  }

  private record() {
    const t = performance.now() - this.lapStart;
    while (this.lastSample <= t) {
      const [u, v] = this.toDesign(this.car.x, this.car.y);
      this.recording.push(u, v, this.car.a - this.turn);
      this.lastSample += GHOST_STEP;
    }
  }

  /** Where the best lap's car was at this point of the lap. */
  private ghostPose(): [number, number, number] | null {
    const g = this.ghost;
    if (!g || this.phase !== "race") return null;
    const t = performance.now() - this.lapStart;
    const n = g.pts.length / 3;
    const f = t / GHOST_STEP;
    const i = Math.floor(f);
    if (i >= n - 1) return null;
    const k = f - i;
    const a = i * 3;
    const b = a + 3;
    const u = g.pts[a] + (g.pts[b] - g.pts[a]) * k;
    const v = g.pts[a + 1] + (g.pts[b + 1] - g.pts[a + 1]) * k;
    const h = g.pts[a + 2] + wrap(g.pts[b + 2] - g.pts[a + 2]) * k;
    const [x, y] = this.toWorld(u, v);
    return [x, y, h + this.turn];
  }

  protected shiftTime(ms: number) {
    if (this.phase !== "race") return;
    this.lapStart += ms;
    this.raceStart += ms;
    this.hud();
  }

  protected resized() {
    // keep the race going: the car is carried over in design coordinates
    const [u, v] = this.toDesign(this.car.x, this.car.y);
    const a = this.car.a - this.turn;
    this.setup();
    const [x, y] = this.toWorld(u, v);
    this.car.place(x, y, a + this.turn);
    this.idx = this.nearest(x, y, true);
    this.cam = { x, y };
    if (this.phase === "grid") this.toGrid();
  }

  // ------------------------------------------------------------------- draw

  protected render() {
    const g = this.ctx;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const [ox, oy] = this.toScreen(0, 0);
    g.setTransform(this.dpr, 0, 0, this.dpr, ox * this.dpr, oy * this.dpr);
    g.drawImage(this.layer, 0, 0, this.worldW, this.worldH);
    g.drawImage(this.skids.canvas, 0, 0, this.worldW, this.worldH);
    const ghost = this.ghostPose();
    if (ghost) {
      const gc = this.ghostCar;
      gc.size(this.car.L);
      gc.x = ghost[0];
      gc.y = ghost[1];
      gc.a = ghost[2];
      gc.draw(g, "ghost", this.time, this.skin);
    }
    this.car.draw(g, "player", this.time, this.skin);
  }

  private ghostCar = new Car(40);
}
