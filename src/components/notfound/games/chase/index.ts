import { Car, GRASS, ROAD, type CarLook, type Surface } from "../../engine/car";
import { clamp, formatTime, Game, store, wrap, type Controls, type Difficulty, type GameHooks, type HudCell } from "../../engine/core";
import { SkidTrail } from "../../engine/skids";
import { boostOf } from "../../engine/skins";
import { BREAK, City, MASS, type Lot, type Prop } from "./city";

// Game 3: the chase. A town made up on the spot, the police on your tail,
// everything on the pavement there to be smashed. The wanted level climbs;
// police cars, SWAT vans and a helicopter join in. Rams wear the car down
// ("Wrecked") and a police car pinning you while you crawl ends it too
// ("Busted"). Coins on the roads and in the wreckage go to the garage.

const COLS = 11;
const MAX_LEVEL = 5;

const TUNING: Record<
  Difficulty,
  { top: [number, number, number]; maxCops: number; spawn: number; levelEvery: number; dmg: number; bust: number; heliAt: number; swatAt: number; coin: number; label: string }
> = {
  easy: { top: [0.76, 0.025, 0.9], maxCops: 3, spawn: 4, levelEvery: 30, dmg: 0.55, bust: 2.2, heliAt: 5, swatAt: 4, coin: 0.75, label: "Easy" },
  normal: { top: [0.82, 0.03, 0.97], maxCops: 5, spawn: 2.5, levelEvery: 20, dmg: 1, bust: 1.6, heliAt: 4, swatAt: 3, coin: 1, label: "Normal" },
  hard: { top: [0.88, 0.03, 1.03], maxCops: 7, spawn: 1.8, levelEvery: 15, dmg: 1.45, bust: 1.2, heliAt: 3, swatAt: 2, coin: 1.5, label: "Hard" },
};

const DIRT: Surface = { grip: 0.7, accel: 0.8, drag: 0.5 };

// a daylight town, in the site's greys
const C = {
  road: "#E1E3E8",
  walk: "#F1F2F4",
  paved: "#ECEDF0",
  edge: "#D6D8DE",
  detail: "#E9EBEF",
  grass: "#DCEAD3",
  path: "#EFE9DC",
  tree: "#B5D2A6",
  treeDark: "#9CC08C",
  plaza: "#ECECEF",
  water: "#CBE2F2",
  lot: "#D8DADF",
  dirt: "#E9E1D2",
  crane: "#F5B83D",
};

interface Cop {
  car: Car;
  kind: "car" | "swat";
  hp: number;
  mass: number;
  path: number[];
  goal: number;
  flank: boolean;
  stuck: number;
  reverse: number;
  phase: number;
}
interface Wreck {
  car: Car;
  look: CarLook;
  smoke: number;
}
interface Heli {
  x: number;
  y: number;
  vx: number;
  vy: number;
  a: number;
  rotor: number;
  sx: number; // the searchlight on the ground
  sy: number;
  orbit: number;
}
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  kind: "spark" | "smoke" | "fire" | "bit" | "water";
}

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class ChaseGame extends Game {
  private rand = rng(Date.now());
  private city!: City;
  private L = 36;
  private player = new Car(36);
  private hp = 100;
  private cops: Cop[] = [];
  private wrecks: Wreck[] = [];
  private heli: Heli | null = null;
  private skids = new SkidTrail(3600);
  private parts: Particle[] = [];
  private geysers: { x: number; y: number; until: number }[] = [];
  private moving = new Set<Prop>();
  private coins: { x: number; y: number; t: number }[] = [];

  private level: Difficulty = "normal";
  private T = TUNING.normal;
  private cam = { x: 0, y: 0 };
  private inset = 14;
  private shake = 0;
  private time = 0;
  private startedAt = 0;
  private stars = 1;
  private nextSpawn = 0;
  private spawned = 0;
  private survivalPaid = 0;
  private meter = 0;
  private spotted = false;
  private over: "busted" | "wrecked" | null = null;
  private overAt = 0;
  private frozen = false;
  private lastHud = 0;

  constructor(canvas: HTMLCanvasElement, hooks: GameHooks) {
    super(canvas, hooks);
    this.level = hooks.difficulty?.() ?? "normal";
    this.T = TUNING[this.level];
    this.boot();
    this.ready();
  }

  private get bestKey() {
    return this.level === "normal" ? "wh-404-chase" : `wh-404-chase-${this.level}`;
  }

  // ------------------------------------------------------------------ setup

  protected setup() {
    this.inset = (this.hooks.room?.().top ?? 0) + 14;
    if (this.city) return; // a resize keeps the same town at the same scale
    const L = clamp(Math.min(this.W, this.H) / 15, 26, 42);
    this.L = L;
    this.player.size(L);
    this.city = new City(L, COLS, this.rand);
    for (let k = 0; k < 42; k++) this.coinRow();
  }

  /** A short row of coins down a lane, Smashy Road style. */
  private coinRow(avoid?: Car) {
    for (let tries = 0; tries < 12; tries++) {
      const [x, y] = this.city.streetPoint();
      if (avoid && Math.hypot(x - avoid.x, y - avoid.y) < this.L * 10) continue;
      const lot = this.city.lotAt(x, y + 1);
      const along = this.city.lotAt(x + this.L, y) === lot && this.city.lotAt(x - this.L, y) === lot; // a street running east-west
      const n = 3 + Math.floor(this.rand() * 4);
      const gap = this.L * 0.75;
      for (let k = 0; k < n; k++) {
        const cx = along ? x + (k - n / 2) * gap : x;
        const cy = along ? y : y + (k - n / 2) * gap;
        if (this.city.lotAt(cx, cy)) continue;
        this.coins.push({ x: cx, y: cy, t: k * 0.4 });
      }
      return;
    }
  }

  protected resized() {
    this.inset = (this.hooks.room?.().top ?? 0) + 14;
  }

  private ready() {
    const city = this.city;
    const mid = Math.floor(COLS / 2);
    const n = COLS + 1;
    const id = mid * n + mid;
    const [x, y] = city.nodeXY(id);
    // face down an open street
    const next = city.links(id)[0];
    const [nx, ny] = next !== undefined ? city.nodeXY(next) : [x + 1, y];
    this.player.place(x, y, Math.atan2(ny - y, nx - x));
    this.cam = { x, y };
    this.clampCam();
    this.hud();
    const [sx, sy] = this.toScreen(x, y);
    this.hooks.onReady?.({ x: sx, y: sy + this.L * 0.9 });
  }

  protected firstInput() {
    this.startedAt = performance.now();
    this.nextSpawn = this.time + 1.2;
    this.hud();
  }

  protected shiftTime(ms: number) {
    if (this.startedAt && !this.over) {
      this.startedAt += ms;
      this.hud();
    }
  }

  private elapsed() {
    return this.startedAt ? ((this.over ? this.overAt : performance.now()) - this.startedAt) / 1000 : 0;
  }

  private pay(n: number, why: string) {
    this.earn(n * this.T.coin, why);
  }

  private hud() {
    const cells: HudCell[] = [
      { stars: { n: this.startedAt ? this.stars : 0, of: MAX_LEVEL } },
      { bar: this.hp / 100 },
      { clock: this.startedAt ? { from: this.startedAt, to: this.over ? this.overAt : undefined } : { from: 0, to: 0 } },
    ];
    if (this.spotted && !this.over) cells.push({ main: "Spotted", tone: "bad" });
    this.hooks.onHud?.({ cells, meter: this.meter, reset: "Start over" });
  }

  // ------------------------------------------------------------------- loop

  protected idle() {
    if (this.frozen) return true;
    if (this.startedAt) return false; // the chase is on
    return !this.input.held() && this.player.speed < 2;
  }

  protected update(dt: number) {
    this.time += dt;
    const T = this.T;
    if (this.startedAt && !this.over) {
      const t = this.elapsed();
      const stars = Math.min(MAX_LEVEL, 1 + Math.floor(t / T.levelEvery));
      if (stars !== this.stars) {
        this.stars = stars;
        for (const c of this.cops) c.car.top = this.copTop(c.kind);
      }
      const want = Math.min(T.maxCops, Math.ceil((stars * T.maxCops) / MAX_LEVEL));
      if (this.cops.length < want && this.time >= this.nextSpawn) {
        this.spawn();
        this.nextSpawn = this.time + T.spawn;
      }
      if (!this.heli && stars >= T.heliAt) this.spawnHeli();
      // a little for every ten seconds on the run
      const paid = Math.floor(t / 10);
      if (paid > this.survivalPaid) {
        this.survivalPaid = paid;
        this.pay(1, "on the run");
      }
    }
    this.step(dt / 2);
    this.step(dt / 2);
    this.updateHeli(dt);
    this.updateProps(dt);
    this.updateParticles(dt);

    // camera: ahead of the car, a shake on big hits
    const p = this.player;
    const k = 1 - Math.exp(-5 * dt);
    this.cam.x += (p.x + p.vx * 0.35 - this.cam.x) * k;
    this.cam.y += (p.y + p.vy * 0.35 - this.cam.y) * k;
    this.clampCam();
    this.shake *= Math.exp(-8 * dt);

    if (this.over && (performance.now() - this.overAt) / 1000 > 2.2) this.frozen = true;
    if (this.startedAt && !this.over && this.time - this.lastHud > 0.1) {
      this.lastHud = this.time;
      this.hud();
    }
  }

  private copTop(kind: Cop["kind"]) {
    const [base, per, max] = this.T.top;
    return Math.min(max, base + this.stars * per) * (kind === "swat" ? 0.86 : 1);
  }

  private clampCam() {
    const { W, H } = this;
    const city = this.city;
    if (city.W > W) this.cam.x = clamp(this.cam.x, W / 2, city.W - W / 2);
    if (city.H > H) this.cam.y = clamp(this.cam.y, H * 0.55, city.H - H * 0.45);
  }

  private step(dt: number) {
    const p = this.player;
    const city = this.city;
    const b = boostOf(this.skin);
    p.top = b.speed;
    p.power = b.accel;
    p.grip = b.grip;
    // the player
    let c: Controls = { throttle: 0, steer: 0, hand: true };
    if (!this.over) {
      const ptr = this.input.pointer;
      if (ptr.active) {
        const [wx, wy] = this.toWorld(ptr.x, ptr.y);
        c = p.toward(wx, wy);
      } else c = this.input.controls();
    }
    const lot = city.lotAt(p.x, p.y);
    const surf = lot?.kind === "park" ? GRASS : lot?.kind === "works" ? DIRT : ROAD;
    this.skids.mark(p, p.step(dt, c, surf));
    this.hurt(this.collideWorld(p), true);
    this.collideProps(p, true);
    this.pickCoins();

    // the police
    for (const cop of this.cops) {
      const ctl = this.drive(cop, dt);
      this.skids.mark(cop.car, cop.car.step(dt, ctl));
      this.damageCop(cop, this.collideWorld(cop.car));
      this.collideProps(cop.car, false);
    }
    // cars on cars
    let touching = false;
    const bodies = [{ car: p, mass: 1, cop: null as Cop | null }, ...this.cops.map((cop) => ({ car: cop.car, mass: cop.mass, cop }))];
    for (let a = 0; a < bodies.length; a++)
      for (let b = a + 1; b < bodies.length; b++) {
        const hit = this.collideCars(bodies[a].car, bodies[b].car, bodies[a].mass, bodies[b].mass);
        if (!hit) continue;
        if (a === 0) touching = true;
        const [da, db] = hit;
        if (a === 0) this.hurt(da, false);
        else this.damageCop(bodies[a].cop!, da);
        this.damageCop(bodies[b].cop!, db);
      }
    this.cops = this.cops.filter((cop) => cop.hp > 0 || !this.explode(cop));

    // busted: police right on you while you crawl
    if (this.startedAt && !this.over) {
      const near = touching || this.cops.some((cop) => Math.hypot(cop.car.x - p.x, cop.car.y - p.y) < p.L * 1.7);
      const slow = p.speed < 120 * p.k;
      this.meter = clamp(this.meter + (near && slow ? dt / this.T.bust : -dt / 1.1), 0, 1);
      if (this.meter >= 1) this.end("busted");
    }
    // a hurt car smokes
    if (this.hp < 40 && this.rand() < (this.over ? 0.5 : 0.25)) this.smoke(p.x - Math.cos(p.a) * p.L * 0.3, p.y - Math.sin(p.a) * p.L * 0.3, this.hp < 15 ? "#3A3B40" : "#9A9CA3");
  }

  /** The player takes a hit. */
  private hurt(impact: number, wall: boolean) {
    if (!impact || this.over || !this.startedAt) return;
    const dmg = (Math.max(0, impact - (wall ? 300 : 170)) * (wall ? 0.05 : 0.075) * this.T.dmg) / boostOf(this.skin).armor;
    if (dmg <= 0) return;
    this.hp = Math.max(0, this.hp - dmg);
    if (this.hp <= 0) {
      this.boom(this.player.x, this.player.y, 1.2);
      this.end("wrecked");
    }
  }

  private damageCop(cop: Cop | null, impact: number) {
    if (!cop || !impact) return;
    cop.hp -= Math.max(0, impact - 160) * 0.09 * (cop.kind === "swat" ? 0.6 : 1);
  }

  /** A police car gives up the ghost: fire, smoke, a wreck, coins. Returns true. */
  private explode(cop: Cop) {
    this.boom(cop.car.x, cop.car.y, cop.kind === "swat" ? 1.4 : 1);
    cop.car.vx *= 0.2;
    cop.car.vy *= 0.2;
    this.wrecks.push({ car: cop.car, look: cop.kind === "swat" ? "swat" : "police", smoke: 6 });
    if (this.startedAt && !this.over) this.pay(cop.kind === "swat" ? 6 : 4, "police wrecked");
    return true;
  }

  private end(how: "busted" | "wrecked") {
    if (this.over) return;
    this.over = how;
    this.overAt = performance.now();
    const run = this.overAt - this.startedAt;
    const prev = store.num(this.bestKey);
    const best = prev === null ? run : Math.max(prev, run);
    store.set(this.bestKey, String(Math.round(best)));
    this.hud();
    this.hooks.onEnd?.({
      title: how === "busted" ? "Busted." : "Wrecked.",
      lead: "You lasted",
      value: formatTime(run),
      tail: `best ${formatTime(best)} · ${this.T.label}`,
      coins: this.earned,
    });
  }

  // ------------------------------------------------------------- the police

  private spawn() {
    const p = this.player;
    const city = this.city;
    const reach = Math.hypot(this.W, this.H) * 0.62;
    let pick = -1;
    for (let tries = 0; tries < 50; tries++) {
      const id = Math.floor(this.rand() * city.nodes);
      const [x, y] = city.nodeXY(id);
      const d = Math.hypot(x - p.x, y - p.y);
      if (d > reach && d < reach * 2.4) {
        pick = id;
        break;
      }
    }
    if (pick < 0) return;
    const [x, y] = city.nodeXY(pick);
    const swat = this.stars >= this.T.swatAt && this.spawned % 3 === 2;
    const car = new Car(this.L * (swat ? 1.32 : 1));
    car.place(x, y, Math.atan2(p.y - y, p.x - x));
    const cop: Cop = { car, kind: swat ? "swat" : "car", hp: swat ? 170 : 100, mass: swat ? 2.2 : 1.1, path: [], goal: -1, flank: this.spawned % 2 === 1, stuck: 0, reverse: 0, phase: this.rand() };
    car.top = this.copTop(cop.kind);
    this.cops.push(cop);
    this.spawned++;
  }

  /** Line of sight (or the helicopter's light) → straight at you; otherwise the streets. */
  private drive(cop: Cop, dt: number): Controls {
    const car = cop.car;
    const p = this.player;
    const city = this.city;
    if (this.over) return { throttle: 0, steer: 0, hand: true };
    const dist = Math.hypot(p.x - car.x, p.y - car.y);
    let tx: number;
    let ty: number;
    const near = dist < this.L * 22;
    if (near && (this.sees(car.x, car.y, p.x, p.y) || (this.spotted && dist < this.L * 8))) {
      const lead = clamp(dist / (600 * car.k), 0, 0.6);
      tx = p.x + p.vx * lead;
      ty = p.y + p.vy * lead;
      cop.path = [];
      cop.goal = -1;
    } else {
      const ahead = cop.flank ? 1.4 : 0;
      const goal = city.node(p.x + p.vx * ahead, p.y + p.vy * ahead);
      if (goal !== cop.goal || !cop.path.length) {
        const from = cop.path.length ? cop.path[0] : city.node(car.x, car.y);
        cop.path = city.route(from, goal, cop.phase);
        cop.goal = goal;
      }
      while (cop.path.length > 1) {
        const [nx, ny] = city.nodeXY(cop.path[0]);
        if (Math.hypot(nx - car.x, ny - car.y) < this.L * 1.2) cop.path.shift();
        else break;
      }
      [tx, ty] = cop.path.length ? city.nodeXY(cop.path[0]) : [p.x, p.y];
    }
    const diff = wrap(Math.atan2(ty - car.y, tx - car.x) - car.a);
    const fast = car.speed > 260 * car.k;
    if (cop.reverse > 0) {
      cop.reverse -= dt;
      return { throttle: -1, steer: -Math.sign(diff), hand: false };
    }
    cop.stuck = car.speed < 25 * car.k ? cop.stuck + dt : 0;
    if (cop.stuck > 0.9) {
      cop.stuck = 0;
      cop.reverse = 0.7;
    }
    return { steer: clamp(diff * 2.4, -1, 1), throttle: Math.abs(diff) > 1.1 && fast ? -0.6 : 1, hand: Math.abs(diff) > 0.75 && fast };
  }

  private sees(ax: number, ay: number, bx: number, by: number) {
    const d = Math.hypot(bx - ax, by - ay);
    const n = Math.ceil(d / (this.L * 0.9));
    for (let k = 1; k < n; k++) if (this.city.solidAt(ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n)) return false;
    return true;
  }

  private spawnHeli() {
    const p = this.player;
    const a = this.rand() * Math.PI * 2;
    const d = Math.hypot(this.W, this.H) * 0.7;
    this.heli = { x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d, vx: 0, vy: 0, a: 0, rotor: 0, sx: p.x, sy: p.y, orbit: a };
  }

  /** Flies over everything, circling the player; its light follows a beat behind. */
  private updateHeli(dt: number) {
    const h = this.heli;
    if (!h) return;
    const p = this.player;
    const L = this.L;
    h.rotor += dt * 32;
    h.orbit += dt * 0.55;
    const tx = p.x + Math.cos(h.orbit) * L * 2.4;
    const ty = p.y + Math.sin(h.orbit) * L * 2.4;
    const top = 520 * p.k;
    const dx = tx - h.x;
    const dy = ty - h.y;
    const d = Math.hypot(dx, dy) || 1;
    const want = Math.min(top, d * 2.2);
    h.vx += ((dx / d) * want - h.vx) * Math.min(1, dt * 1.6);
    h.vy += ((dy / d) * want - h.vy) * Math.min(1, dt * 1.6);
    h.x += h.vx * dt;
    h.y += h.vy * dt;
    if (Math.hypot(h.vx, h.vy) > 20) h.a += wrap(Math.atan2(h.vy, h.vx) - h.a) * Math.min(1, dt * 3);
    const lag = 1 - Math.exp(-2.4 * dt);
    h.sx += (p.x - h.sx) * lag;
    h.sy += (p.y - h.sy) * lag;
    const spotted = !this.over && Math.hypot(p.x - h.sx, p.y - h.sy) < L * 2.3;
    if (spotted !== this.spotted) {
      this.spotted = spotted;
      this.hud();
    }
  }

  // ------------------------------------------------------------ collisions

  private circles(car: Car): [number, number][] {
    const fx = Math.cos(car.a) * car.L * 0.3;
    const fy = Math.sin(car.a) * car.L * 0.3;
    return [
      [car.x - fx, car.y - fy],
      [car.x, car.y],
      [car.x + fx, car.y + fy],
    ];
  }

  /** Pushes a car out along a normal; returns the impact speed (reference units). */
  private push(car: Car, nx: number, ny: number, pen: number) {
    car.x += nx * pen;
    car.y += ny * pen;
    const vn = car.vx * nx + car.vy * ny;
    if (vn >= 0) return 0;
    car.vx -= 1.25 * vn * nx;
    car.vy -= 1.25 * vn * ny;
    car.vx *= 0.94;
    car.vy *= 0.94;
    const impact = -vn / car.k;
    if (impact > 220) this.sparks(car.x - nx * car.B * 0.5, car.y - ny * car.B * 0.5, impact);
    return impact;
  }

  /** Buildings, trees, the fountain, wrecks, the edge of town. Returns the hardest impact. */
  private collideWorld(car: Car) {
    const r = car.B * 0.5;
    let worst = 0;
    for (const [cx, cy] of this.circles(car)) {
      for (const lot of this.city.lotsIn(cx - r, cy - r, cx + r, cy + r)) {
        for (const b of lot.buildings) {
          const qx = clamp(cx, b.x, b.x + b.w);
          const qy = clamp(cy, b.y, b.y + b.h);
          let dx = cx - qx;
          let dy = cy - qy;
          const d = Math.hypot(dx, dy);
          if (d >= r) continue;
          if (d > 0) {
            dx /= d;
            dy /= d;
            worst = Math.max(worst, this.push(car, dx, dy, r - d));
          } else {
            const sides = [cx - b.x, b.x + b.w - cx, cy - b.y, b.y + b.h - cy];
            const m = Math.min(...sides);
            const k = sides.indexOf(m);
            worst = Math.max(worst, this.push(car, k === 0 ? -1 : k === 1 ? 1 : 0, k === 2 ? -1 : k === 3 ? 1 : 0, m + r));
          }
        }
        for (const s of lot.solids) worst = Math.max(worst, this.pushCircle(car, cx, cy, r, s.x, s.y, s.r));
      }
      for (const w of this.wrecks) {
        if (Math.abs(w.car.x - cx) > w.car.L || Math.abs(w.car.y - cy) > w.car.L) continue;
        for (const [wx, wy] of this.circles(w.car)) worst = Math.max(worst, this.pushCircle(car, cx, cy, r, wx, wy, w.car.B * 0.5));
      }
    }
    const m = car.L / 2;
    const city = this.city;
    if (car.x < m || car.x > city.W - m) {
      car.x = clamp(car.x, m, city.W - m);
      car.vx *= -0.3;
    }
    if (car.y < m || car.y > city.H - m) {
      car.y = clamp(car.y, m, city.H - m);
      car.vy *= -0.3;
    }
    return worst;
  }

  private pushCircle(car: Car, cx: number, cy: number, r: number, sx: number, sy: number, sr: number) {
    const dx = cx - sx;
    const dy = cy - sy;
    const d = Math.hypot(dx, dy);
    if (d >= r + sr || d === 0) return 0;
    return this.push(car, dx / d, dy / d, r + sr - d);
  }

  /** Returns [damage-ish impact on a, on b] when they touched, else null. */
  private collideCars(a: Car, b: Car, ma: number, mb: number): [number, number] | null {
    const reach = (a.L + b.L) * 0.7;
    if (Math.abs(a.x - b.x) > reach || Math.abs(a.y - b.y) > reach) return null;
    const ra = a.B * 0.5;
    const rb = b.B * 0.5;
    let hit = false;
    let impact = 0;
    for (const [ax, ay] of this.circles(a))
      for (const [bx, by] of this.circles(b)) {
        let dx = bx - ax;
        let dy = by - ay;
        const d = Math.hypot(dx, dy);
        const min = (ra + rb) * 1.05;
        if (d >= min || d === 0) continue;
        hit = true;
        dx /= d;
        dy /= d;
        const pen = min - d;
        const wa = mb / (ma + mb);
        a.x -= dx * pen * wa;
        a.y -= dy * pen * wa;
        b.x += dx * pen * (1 - wa);
        b.y += dy * pen * (1 - wa);
        const vn = (b.vx - a.vx) * dx + (b.vy - a.vy) * dy;
        if (vn >= 0) continue;
        const j = (-(1 + 0.35) * vn) / (1 / ma + 1 / mb);
        a.vx -= (j * dx) / ma;
        a.vy -= (j * dy) / ma;
        b.vx += (j * dx) / mb;
        b.vy += (j * dy) / mb;
        const iv = -vn / this.player.k;
        impact = Math.max(impact, iv);
        if (iv > 260) this.sparks((ax + bx) / 2, (ay + by) / 2, iv);
      }
    if (!hit) return null;
    // the lighter one takes more of it
    return [impact * (2 * mb) / (ma + mb), impact * (2 * ma) / (ma + mb)];
  }

  /** Lamp posts, hydrants, bins…: knocked about, or smashed above their breaking point. */
  private collideProps(car: Car, mine: boolean) {
    const r = car.B * 0.5;
    for (const [cx, cy] of this.circles(car)) {
      for (const p of this.city.propsNear(cx, cy, r + this.L)) {
        const dx = p.x - cx;
        const dy = p.y - cy;
        const d = Math.hypot(dx, dy);
        const min = r + p.r;
        if (d >= min || d === 0) continue;
        const nx = dx / d;
        const ny = dy / d;
        const vn = (car.vx - p.vx) * nx + (car.vy - p.vy) * ny; // closing speed
        const mass = MASS[p.kind];
        const iv = vn / car.k;
        if (!p.broken && iv > BREAK[p.kind]) {
          this.smash(p, car, nx, ny, mine);
          continue;
        }
        const rigid = !p.broken && (p.kind === "lamp" || p.kind === "hydrant" || p.kind === "sapling");
        if (rigid) {
          this.push(car, -nx, -ny, min - d);
          continue;
        }
        // shove it
        const share = 1 / (1 + mass);
        p.x += nx * (min - d) * share;
        p.y += ny * (min - d) * share;
        car.x -= nx * (min - d) * (1 - share);
        car.y -= ny * (min - d) * (1 - share);
        if (vn > 0) {
          const j = ((1 + 0.3) * vn) / (1 + 1 / mass);
          p.vx += (j * nx) / mass;
          p.vy += (j * ny) / mass;
          car.vx -= j * nx;
          car.vy -= j * ny;
          p.w += (this.rand() - 0.5) * 8;
          this.moving.add(p);
        }
      }
    }
  }

  private smash(p: Prop, car: Car, nx: number, ny: number, mine: boolean) {
    p.broken = true;
    p.vx = car.vx * 0.75 + nx * 60 * car.k;
    p.vy = car.vy * 0.75 + ny * 60 * car.k;
    p.w = (this.rand() - 0.5) * 12;
    p.a = Math.atan2(p.vy, p.vx);
    this.moving.add(p);
    const slow = 1 - MASS[p.kind] * 0.22;
    car.vx *= slow;
    car.vy *= slow;
    const bits: Record<Prop["kind"], string> = {
      lamp: "#DDE6F2",
      hydrant: "#E5322D",
      bin: "#3E5A47",
      bench: "#A67C52",
      cone: "#FF6A13",
      crate: "#C9A46C",
      barrier: "#E5322D",
      sapling: "#8FBF7A",
      parked: "#888888",
    };
    for (let k = 0; k < 9; k++) this.particle("bit", p.x, p.y, bits[p.kind], car.k);
    if (p.kind === "hydrant") this.geysers.push({ x: p.x, y: p.y, until: this.time + 4 });
    if (mine && this.startedAt && !this.over) this.pay(0.35, "smashed");
  }

  private pickCoins() {
    const p = this.player;
    const reach = this.L * 0.8;
    let got = 0;
    this.coins = this.coins.filter((c) => {
      if (Math.abs(c.x - p.x) > reach || Math.abs(c.y - p.y) > reach || Math.hypot(c.x - p.x, c.y - p.y) > reach) return true;
      got++;
      for (let k = 0; k < 4; k++) this.particle("spark", c.x, c.y, "#F5B83D", p.k);
      return false;
    });
    if (!got) return;
    if (this.startedAt && !this.over) this.pay(got * 0.4, "coins");
    // keep the town stocked: a new row somewhere out of sight
    if (this.coins.length < 150) this.coinRow(p);
  }

  // ------------------------------------------------------------ the world moves

  private updateProps(dt: number) {
    for (const p of Array.from(this.moving)) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.a += p.w * dt;
      const f = Math.exp(-(p.broken ? 2.6 : 4.5) * dt);
      p.vx *= f;
      p.vy *= f;
      p.w *= Math.exp(-2.5 * dt);
      if (p.vx * p.vx + p.vy * p.vy < 9 && Math.abs(p.w) < 0.1) {
        p.vx = p.vy = p.w = 0;
        this.city.refile(p);
        this.moving.delete(p);
      }
    }
    // knocked-out police cars slide to a stop
    for (const w of this.wrecks) {
      w.car.x += w.car.vx * dt;
      w.car.y += w.car.vy * dt;
      w.car.vx *= Math.exp(-3 * dt);
      w.car.vy *= Math.exp(-3 * dt);
      if (w.smoke > 0) {
        w.smoke -= dt;
        if (this.rand() < 0.3) this.smoke(w.car.x, w.car.y, "#7C7F87");
        if (this.rand() < 0.2) this.particle("fire", w.car.x, w.car.y, "#FF8A1F", this.player.k);
      }
    }
    for (const g of this.geysers) if (this.time < g.until) for (let k = 0; k < 2; k++) this.particle("water", g.x, g.y, "#A9D6F5", this.player.k);
    this.geysers = this.geysers.filter((g) => this.time < g.until);
  }

  private particle(kind: Particle["kind"], x: number, y: number, color: string, k: number) {
    if (this.parts.length > 420) return;
    const a = this.rand() * Math.PI * 2;
    const s = (kind === "smoke" ? 20 : kind === "water" ? 60 : 80 + this.rand() * 200) * k;
    const life = kind === "smoke" ? 1.2 + this.rand() * 0.8 : kind === "fire" ? 0.5 : kind === "water" ? 0.7 : 0.35 + this.rand() * 0.35;
    this.parts.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - (kind === "water" ? 90 * k : 0),
      life,
      max: life,
      size: kind === "smoke" ? this.L * 0.25 : kind === "fire" ? this.L * 0.3 : kind === "water" ? 2.5 : 3,
      color,
      kind,
    });
  }

  private smoke(x: number, y: number, color: string) {
    this.particle("smoke", x, y, color, this.player.k);
  }

  private sparks(x: number, y: number, strength: number) {
    if (!this.hooks.reduced) this.shake = Math.min(1, this.shake + strength / 1400);
    const n = Math.min(10, Math.round(strength / 70));
    for (let k = 0; k < n; k++) this.particle("spark", x, y, "#FFC24A", this.player.k);
  }

  private boom(x: number, y: number, size: number) {
    if (!this.hooks.reduced) this.shake = 1;
    for (let k = 0; k < 18 * size; k++) this.particle("fire", x, y, this.rand() < 0.5 ? "#FF8A1F" : "#FFD24A", this.player.k * 1.5);
    for (let k = 0; k < 10 * size; k++) this.smoke(x + (this.rand() - 0.5) * this.L, y + (this.rand() - 0.5) * this.L, "#7C7F87");
    for (let k = 0; k < 10; k++) this.particle("spark", x, y, "#FFE08A", this.player.k * 1.6);
  }

  private updateParticles(dt: number) {
    for (const q of this.parts) {
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      const drag = q.kind === "smoke" ? 1.2 : q.kind === "water" ? 1 : 3.5;
      q.vx *= Math.exp(-drag * dt);
      q.vy *= Math.exp(-drag * dt);
      if (q.kind === "water") q.vy += 260 * this.player.k * dt;
      if (q.kind === "smoke") q.size += this.L * 0.5 * dt;
      q.life -= dt;
    }
    this.parts = this.parts.filter((q) => q.life > 0);
  }

  // ------------------------------------------------------------------- draw

  private toScreen(x: number, y: number): [number, number] {
    return [this.W / 2 + x - this.cam.x, this.H * 0.55 + y - this.cam.y];
  }

  private toWorld(sx: number, sy: number): [number, number] {
    return [sx - this.W / 2 + this.cam.x, sy - this.H * 0.55 + this.cam.y];
  }

  protected render() {
    const g = this.ctx;
    const { W, H, dpr, L } = this;
    const sh = this.shake * L * 0.14;
    const ox = W / 2 - this.cam.x + (sh ? (this.rand() - 0.5) * sh : 0);
    const oy = H * 0.55 - this.cam.y + (sh ? (this.rand() - 0.5) * sh : 0);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = "#F7F7F8";
    g.fillRect(0, 0, this.canvas.width, this.canvas.height);
    g.setTransform(dpr, 0, 0, dpr, ox * dpr, oy * dpr);
    const x0 = -ox - L * 2;
    const y0 = -oy - L * 2;
    const x1 = x0 + W + L * 4;
    const y1 = y0 + H + L * 4;
    const t = this.time;

    this.drawStreets(g, x0, y0, x1, y1);
    this.skids.draw(g, x0, y0, x1, y1);
    // coins on the road
    for (const c of this.coins) {
      if (c.x < x0 || c.x > x1 || c.y < y0 || c.y > y1) continue;
      const s = 0.75 + 0.25 * Math.abs(Math.sin(t * 3 + c.t));
      const r = L * 0.2;
      g.fillStyle = "rgba(0,0,0,0.12)";
      g.beginPath();
      g.ellipse(c.x + 2, c.y + 3, r * s, r, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#F5B83D";
      g.beginPath();
      g.ellipse(c.x, c.y, r * s, r, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = "#D99A1E";
      g.lineWidth = r * 0.22;
      g.beginPath();
      g.ellipse(c.x, c.y, r * s * 0.66, r * 0.66, 0, 0, Math.PI * 2);
      g.stroke();
    }
    const lots = this.city.lotsIn(x0, y0, x1, y1);
    for (const lot of lots) this.drawGround(g, lot);
    for (const lot of lots) this.drawBuildings(g, lot);
    this.drawProps(g, x0, y0, x1, y1);
    for (const w of this.wrecks) {
      w.car.draw(g, w.look, 0);
      g.save();
      g.translate(w.car.x, w.car.y);
      g.rotate(w.car.a);
      g.fillStyle = "rgba(18,18,20,0.62)";
      g.beginPath();
      g.roundRect(-w.car.L / 2, -w.car.B / 2, w.car.L, w.car.B, w.car.B * 0.3);
      g.fill();
      g.restore();
    }
    // the searchlight
    const h = this.heli;
    if (h) {
      const r = L * 2.3;
      const grad = g.createRadialGradient(h.sx, h.sy, 0, h.sx, h.sy, r);
      grad.addColorStop(0, "rgba(255,246,200,0.55)");
      grad.addColorStop(0.75, "rgba(255,246,200,0.25)");
      grad.addColorStop(1, "rgba(255,246,200,0)");
      g.fillStyle = grad;
      g.beginPath();
      g.arc(h.sx, h.sy, r, 0, Math.PI * 2);
      g.fill();
    }
    for (const c of this.cops) c.car.drawSirenGlow(g, t + c.phase);
    for (const c of this.cops) c.car.draw(g, c.kind === "swat" ? "swat" : "police", t + c.phase);
    this.player.draw(g, "player", t, this.skin);
    if (this.over === "wrecked") {
      const p = this.player;
      g.save();
      g.translate(p.x, p.y);
      g.rotate(p.a);
      g.fillStyle = "rgba(18,18,20,0.6)";
      g.beginPath();
      g.roundRect(-p.L / 2, -p.B / 2, p.L, p.B, p.B * 0.4);
      g.fill();
      g.restore();
    }
    this.drawParticles(g);
    if (h) this.drawHeli(g, h);
    this.drawArrows(g);
  }

  private drawStreets(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) {
    const city = this.city;
    const L = this.L;
    g.fillStyle = C.road;
    g.fillRect(Math.max(0, x0), Math.max(0, y0), Math.min(city.W, x1) - Math.max(0, x0), Math.min(city.H, y1) - Math.max(0, y0));
    const n = COLS + 1;
    const dash = L * 0.55;
    const dw = Math.max(1.5, L * 0.06);
    g.fillStyle = "rgba(255,255,255,0.9)";
    // centre lines on open segments (avenues get two)
    for (let i = 0; i < n; i++) {
      const cx = city.xs[i] + city.sw[i] / 2;
      if (cx < x0 - L || cx > x1 + L) continue;
      const lines = city.sw[i] > L * 2.8 ? [-L * 0.12, L * 0.12] : [0];
      for (let j = 0; j < COLS; j++) {
        if (!city.vOpen[i][j]) continue;
        const from = city.ys[j] + city.sh[j] + L * 0.9;
        const to = city.ys[j + 1] - L * 0.9;
        if (to < y0 || from > y1) continue;
        for (const o of lines) for (let y = from; y < to; y += dash * 2) g.fillRect(cx + o - dw / 2, y, dw, Math.min(dash, to - y));
      }
    }
    for (let j = 0; j < n; j++) {
      const cy = city.ys[j] + city.sh[j] / 2;
      if (cy < y0 - L || cy > y1 + L) continue;
      const lines = city.sh[j] > L * 2.8 ? [-L * 0.12, L * 0.12] : [0];
      for (let i = 0; i < COLS; i++) {
        if (!city.hOpen[j][i]) continue;
        const from = city.xs[i] + city.sw[i] + L * 0.9;
        const to = city.xs[i + 1] - L * 0.9;
        if (to < x0 || from > x1) continue;
        for (const o of lines) for (let x = from; x < to; x += dash * 2) g.fillRect(x, cy + o - dw / 2, Math.min(dash, to - x), dw);
      }
    }
    // zebra crossings where a street leaves a crossing
    const stripe = L * 0.14;
    const zl = L * 0.5;
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) {
        const nx = city.xs[i];
        const ny = city.ys[j];
        const w = city.sw[i];
        const hh = city.sh[j];
        if (nx > x1 || ny > y1 || nx + w < x0 || ny + hh < y0) continue;
        for (let s = stripe; s < w - stripe; s += stripe * 2) {
          if (j > 0 && city.vOpen[i][j - 1]) g.fillRect(nx + s, ny - zl - L * 0.15, stripe, zl);
          if (j < COLS && city.vOpen[i][j]) g.fillRect(nx + s, ny + hh + L * 0.15, stripe, zl);
        }
        for (let s = stripe; s < hh - stripe; s += stripe * 2) {
          if (i > 0 && city.hOpen[j][i - 1]) g.fillRect(nx - zl - L * 0.15, ny + s, zl, stripe);
          if (i < COLS && city.hOpen[j][i]) g.fillRect(nx + w + L * 0.15, ny + s, zl, stripe);
        }
      }
  }

  private drawGround(g: CanvasRenderingContext2D, lot: Lot) {
    const L = this.L;
    const side = L * 0.42;
    g.fillStyle = C.walk;
    g.beginPath();
    g.roundRect(lot.x, lot.y, lot.w, lot.h, L * 0.3);
    g.fill();
    const ix = lot.x + side;
    const iy = lot.y + side;
    const iw = lot.w - side * 2;
    const ih = lot.h - side * 2;
    const fill = (c: string) => {
      g.fillStyle = c;
      g.beginPath();
      g.roundRect(ix, iy, iw, ih, L * 0.2);
      g.fill();
    };
    if (lot.kind === "build") fill(C.paved);
    else if (lot.kind === "park") {
      fill(C.grass);
      g.fillStyle = C.path;
      for (const p of lot.paths) g.fillRect(p.x, p.y, p.w, p.h);
    } else if (lot.kind === "plaza") {
      fill(C.plaza);
      const f = lot.solids[0];
      if (f) {
        g.strokeStyle = "rgba(0,0,0,0.05)";
        g.lineWidth = L * 0.12;
        for (let k = 1; k <= 3; k++) {
          g.beginPath();
          g.arc(f.x, f.y, f.r + k * L * 0.7, 0, Math.PI * 2);
          g.stroke();
        }
      }
    } else if (lot.kind === "parking") {
      fill(C.lot);
      g.strokeStyle = "rgba(255,255,255,0.85)";
      g.lineWidth = Math.max(1, L * 0.05);
      g.beginPath();
      for (const b of lot.bays) {
        g.moveTo(b.x, b.y);
        g.lineTo(b.x, b.y + b.h);
      }
      g.stroke();
    } else fill(C.dirt);
  }

  private drawBuildings(g: CanvasRenderingContext2D, lot: Lot) {
    const L = this.L;
    // taller buildings cast longer shadows (light from the top left)
    g.fillStyle = "rgba(20,22,30,0.08)";
    for (const b of lot.buildings) g.fillRect(b.x + L * b.tall * 0.6, b.y + L * b.tall, b.w, b.h);
    for (const b of lot.buildings) {
      g.fillStyle = b.roof;
      g.fillRect(b.x, b.y, b.w, b.h);
      g.strokeStyle = C.edge;
      g.lineWidth = 1;
      g.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);
      g.fillStyle = C.detail;
      for (const d of b.details) g.fillRect(d.x, d.y, d.w, d.h);
      if (b.pad) {
        const r = Math.min(b.w, b.h) * 0.22;
        const cx = b.x + b.w / 2;
        const cy = b.y + b.h / 2;
        g.strokeStyle = "#D0D3DA";
        g.lineWidth = r * 0.12;
        g.beginPath();
        g.arc(cx, cy, r, 0, Math.PI * 2);
        g.stroke();
        g.fillStyle = "#D0D3DA";
        const s = r * 0.5;
        g.fillRect(cx - s * 0.6, cy - s, s * 0.25, s * 2);
        g.fillRect(cx + s * 0.35, cy - s, s * 0.25, s * 2);
        g.fillRect(cx - s * 0.6, cy - s * 0.12, s * 1.2, s * 0.24);
      }
    }
    for (const s of lot.solids) {
      if (lot.kind === "plaza") {
        g.fillStyle = "#FFFFFF";
        g.beginPath();
        g.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = C.water;
        g.beginPath();
        g.arc(s.x, s.y, s.r * 0.78, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "rgba(255,255,255,0.7)";
        g.beginPath();
        g.arc(s.x, s.y, s.r * (0.2 + 0.06 * Math.sin(this.time * 4)), 0, Math.PI * 2);
        g.fill();
      } else if (lot.kind === "works") {
        // a crane: its foot and its jib
        g.fillStyle = "rgba(20,22,30,0.1)";
        g.fillRect(s.x - s.r + L * 0.5, s.y - L * 0.12 + L * 0.7, L * 6, L * 0.24);
        g.fillStyle = C.crane;
        g.fillRect(s.x - s.r, s.y - s.r, s.r * 2, s.r * 2);
        g.fillRect(s.x - s.r, s.y - L * 0.12, L * 6, L * 0.24);
        g.fillStyle = "#3A3B40";
        g.fillRect(s.x - L * 1.6, s.y - L * 0.3, L * 0.9, L * 0.6);
      } else {
        g.fillStyle = "rgba(20,40,10,0.1)";
        g.beginPath();
        g.arc(s.x + L * 0.12, s.y + L * 0.2, s.r, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = C.tree;
        g.beginPath();
        g.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = C.treeDark;
        g.beginPath();
        g.arc(s.x + s.r * 0.2, s.y + s.r * 0.25, s.r * 0.55, 0, Math.PI * 2);
        g.fill();
      }
    }
  }

  private drawProps(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) {
    const L = this.L;
    const props = this.city.propsNear((x0 + x1) / 2, (y0 + y1) / 2, Math.max(x1 - x0, y1 - y0) / 2 + L);
    for (const p of props) {
      if (p.x < x0 || p.x > x1 || p.y < y0 || p.y > y1) continue;
      g.save();
      g.translate(p.x, p.y);
      g.rotate(p.a);
      const r = p.r;
      switch (p.kind) {
        case "lamp":
          if (p.broken) {
            g.strokeStyle = "#8E929C";
            g.lineWidth = r * 0.7;
            g.beginPath();
            g.moveTo(0, 0);
            g.lineTo(L * 1.1, 0);
            g.stroke();
            g.fillStyle = "#FFF3C4";
            g.beginPath();
            g.arc(L * 1.1, 0, r * 1.3, 0, Math.PI * 2);
            g.fill();
          } else {
            g.drawImage(this.glow(), -L * 0.55, -L * 0.55, L * 1.1, L * 1.1);
            g.fillStyle = "rgba(0,0,0,0.12)";
            g.fillRect(r * 0.4, r * 0.6, L * 0.55, r * 0.6);
            g.fillStyle = "#6B6F7A";
            g.beginPath();
            g.arc(0, 0, r, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = "#FFF3C4";
            g.beginPath();
            g.arc(0, 0, r * 0.5, 0, Math.PI * 2);
            g.fill();
          }
          break;
        case "hydrant":
          g.fillStyle = "#E5322D";
          g.beginPath();
          g.arc(0, 0, p.broken ? r * 0.6 : r, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = "#B8211D";
          g.beginPath();
          g.arc(0, 0, r * 0.45, 0, Math.PI * 2);
          g.fill();
          break;
        case "bin":
          g.fillStyle = "#3E5A47";
          g.beginPath();
          if (p.broken) g.ellipse(0, 0, r * 1.3, r * 0.75, 0, 0, Math.PI * 2);
          else g.arc(0, 0, r, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = "#2E4436";
          g.fillRect(-r * 0.6, -r * 0.1, r * 1.2, r * 0.2);
          break;
        case "bench":
          g.fillStyle = "#A67C52";
          if (p.broken) {
            g.fillRect(-L * 0.4, -r * 0.4, L * 0.32, r * 0.8);
            g.fillRect(L * 0.08, -r * 0.2, L * 0.3, r * 0.7);
          } else {
            g.fillRect(-L * 0.38, -r * 0.45, L * 0.76, r * 0.9);
            g.fillStyle = "#8A6440";
            g.fillRect(-L * 0.38, -r * 0.45, L * 0.76, r * 0.25);
          }
          break;
        case "cone":
          if (p.broken) {
            g.fillStyle = "#FF6A13";
            g.beginPath();
            g.moveTo(-r, -r * 0.8);
            g.lineTo(r * 1.3, 0);
            g.lineTo(-r, r * 0.8);
            g.closePath();
            g.fill();
          } else {
            g.fillStyle = "#121214";
            g.fillRect(-r, -r, r * 2, r * 2);
            g.fillStyle = "#FF6A13";
            g.beginPath();
            g.arc(0, 0, r * 0.8, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = "#FFFFFF";
            g.beginPath();
            g.arc(0, 0, r * 0.4, 0, Math.PI * 2);
            g.fill();
          }
          break;
        case "crate":
          g.fillStyle = "#C9A46C";
          if (p.broken) {
            g.fillRect(-r, -r * 0.3, r * 1.2, r * 0.35);
            g.fillRect(-r * 0.2, r * 0.3, r * 1.3, r * 0.35);
            g.fillRect(-r * 0.6, -r, r * 1.1, r * 0.35);
          } else {
            g.fillRect(-r, -r, r * 2, r * 2);
            g.strokeStyle = "#A6834D";
            g.lineWidth = r * 0.18;
            g.strokeRect(-r * 0.8, -r * 0.8, r * 1.6, r * 1.6);
            g.beginPath();
            g.moveTo(-r * 0.8, -r * 0.8);
            g.lineTo(r * 0.8, r * 0.8);
            g.stroke();
          }
          break;
        case "barrier":
          for (let k = 0; k < 4; k++) {
            g.fillStyle = k % 2 ? "#FFFFFF" : "#E5322D";
            g.fillRect(-r * 2 + k * r, -r * 0.4, r, r * 0.8);
          }
          break;
        case "sapling":
          if (p.broken) {
            g.fillStyle = "#8FBF7A";
            g.beginPath();
            g.ellipse(L * 0.3, 0, r * 1.3, r * 0.8, 0, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = "#7A5A3A";
            g.fillRect(-r * 0.2, -r * 0.15, L * 0.3, r * 0.3);
          } else {
            g.fillStyle = "rgba(20,40,10,0.12)";
            g.beginPath();
            g.arc(L * 0.08, L * 0.12, r, 0, Math.PI * 2);
            g.fill();
            g.fillStyle = "#A9CD98";
            g.beginPath();
            g.arc(0, 0, r, 0, Math.PI * 2);
            g.fill();
          }
          break;
        case "parked": {
          const l = L * 0.92;
          const b = L * 0.44;
          g.fillStyle = "rgba(0,0,0,0.12)";
          g.beginPath();
          g.roundRect(-l / 2 + 2, -b / 2 + 3, l, b, b * 0.4);
          g.fill();
          g.fillStyle = p.color ?? "#888888";
          g.beginPath();
          g.roundRect(-l / 2, -b / 2, l, b, b * 0.4);
          g.fill();
          g.fillStyle = "rgba(30,32,40,0.75)";
          g.fillRect(-l * 0.22, -b * 0.34, l * 0.4, b * 0.68);
          break;
        }
      }
      g.restore();
    }
  }

  private glowSprite: HTMLCanvasElement | null = null;
  /** A lamp's pool of light, drawn once. */
  private glow() {
    if (this.glowSprite) return this.glowSprite;
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,226,150,0.45)");
    grad.addColorStop(1, "rgba(255,226,150,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    this.glowSprite = c;
    return c;
  }

  private drawParticles(g: CanvasRenderingContext2D) {
    for (const q of this.parts) {
      const f = q.life / q.max;
      g.globalAlpha = q.kind === "smoke" ? f * 0.32 : Math.min(1, f * 2);
      g.fillStyle = q.color;
      if (q.kind === "smoke" || q.kind === "fire") {
        g.beginPath();
        g.arc(q.x, q.y, q.kind === "fire" ? q.size * f : q.size, 0, Math.PI * 2);
        g.fill();
      } else g.fillRect(q.x - q.size / 2, q.y - q.size / 2, q.size, q.size);
    }
    g.globalAlpha = 1;
  }

  private drawHeli(g: CanvasRenderingContext2D, h: Heli) {
    const L = this.L;
    // shadow on the ground, offset by the height it flies at
    g.save();
    g.translate(h.x + L * 1.1, h.y + L * 1.6);
    g.rotate(h.a);
    g.fillStyle = "rgba(0,0,0,0.13)";
    g.beginPath();
    g.ellipse(0, 0, L * 0.75, L * 0.32, 0, 0, Math.PI * 2);
    g.fill();
    g.fillRect(-L * 1.5, -L * 0.06, L * 0.9, L * 0.12);
    g.restore();
    g.save();
    g.translate(h.x, h.y);
    g.rotate(h.a);
    // tail
    g.fillStyle = "#1F2A44";
    g.fillRect(-L * 1.45, -L * 0.07, L * 0.95, L * 0.14);
    g.fillRect(-L * 1.5, -L * 0.22, L * 0.12, L * 0.44);
    // body
    g.fillStyle = "#1F2A44";
    g.beginPath();
    g.ellipse(0, 0, L * 0.72, L * 0.34, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#FFFFFF";
    g.fillRect(-L * 0.4, -L * 0.05, L * 0.8, L * 0.1);
    g.fillStyle = "#3B4E78";
    g.beginPath();
    g.ellipse(L * 0.38, 0, L * 0.28, L * 0.24, 0, 0, Math.PI * 2);
    g.fill();
    // beacon
    g.fillStyle = Math.floor(this.time * 4) % 2 ? "#FF3B30" : "#2F6BFF";
    g.beginPath();
    g.arc(-L * 0.2, 0, L * 0.07, 0, Math.PI * 2);
    g.fill();
    // rotor: a faint disc and two blades
    g.fillStyle = "rgba(30,34,48,0.08)";
    g.beginPath();
    g.arc(0, 0, L * 1.15, 0, Math.PI * 2);
    g.fill();
    g.rotate(h.rotor);
    g.fillStyle = "rgba(30,34,48,0.55)";
    g.fillRect(-L * 1.15, -L * 0.035, L * 2.3, L * 0.07);
    g.rotate(Math.PI / 2);
    g.fillRect(-L * 1.15, -L * 0.035, L * 2.3, L * 0.07);
    g.restore();
  }

  /** Police off screen: an arrow on the edge pointing at each one. */
  private drawArrows(g: CanvasRenderingContext2D) {
    const { W, H, dpr, L } = this;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const top = this.inset;
    const pad = 18;
    const t = this.time;
    const targets: [number, number, boolean][] = this.cops.map((c) => [c.car.x, c.car.y, false]);
    if (this.heli) targets.push([this.heli.x, this.heli.y, true]);
    for (const [x, y, air] of targets) {
      const [sx, sy] = this.toScreen(x, y);
      if (sx > -L * 0.3 && sx < W + L * 0.3 && sy > top && sy < H + L * 0.3) continue;
      const cx = W / 2;
      const cy = H * 0.55;
      const a = Math.atan2(sy - cy, sx - cx);
      const kx = (Math.cos(a) > 0 ? W - pad - cx : pad - cx) / (Math.cos(a) || 1e-6);
      const ky = (Math.sin(a) > 0 ? H - pad - cy : top - cy) / (Math.sin(a) || 1e-6);
      const k = Math.min(Math.abs(kx), Math.abs(ky));
      g.save();
      g.translate(cx + Math.cos(a) * k, cy + Math.sin(a) * k);
      g.rotate(a);
      g.fillStyle = air ? "#1F2A44" : Math.floor(t * 6) % 2 ? "#FF3B30" : "#2F6BFF";
      g.beginPath();
      g.moveTo(8, 0);
      g.lineTo(-6, -7);
      g.lineTo(-3, 0);
      g.lineTo(-6, 7);
      g.closePath();
      g.fill();
      g.restore();
    }
  }
}
