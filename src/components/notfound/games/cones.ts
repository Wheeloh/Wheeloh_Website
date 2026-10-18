import { Car } from "../engine/car";
import { clamp, easeOutCubic, easeOutExpo, formatTime, Game, INK, store, wrap, type GameHooks } from "../engine/core";
import { SkidLayer } from "../engine/skids";
import { boostOf } from "../engine/skins";

// Game 1: a "404" written in traffic cones. Knock them all over.

interface Cone {
  x: number;
  y: number;
  vx: number;
  vy: number;
  a: number; // heading of a fallen cone (base → tip)
  w: number; // spin
  down: boolean;
  at: number; // intro: when it pops in (s)
}

interface Intro {
  conesDone: number;
  carT0: number;
  carDur: number;
  p: [number, number][];
}

const ORANGE = "#FF6A13";
const ORANGE_DARK = "#D9520A";
const BEST = "wh-404-best";

function bezier(p: [number, number][], t: number): [number, number] {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0], a * p[0][1] + b * p[1][1] + c * p[2][1] + d * p[3][1]];
}

export class ConeGame extends Game {
  private car = new Car(60);
  private skids = new SkidLayer();
  private r = 10; // cone radius
  private cones: Cone[] = [];
  private down = 0;
  private start = { x: 0, y: 0 };
  private won = false;
  private startedAt = 0;
  private endedAt = 0;
  private clock = 0;
  private best: number | null = store.num(BEST);
  private intro: Intro | null = null;
  private sprite: HTMLCanvasElement | null = null;

  constructor(canvas: HTMLCanvasElement, hooks: GameHooks) {
    super(canvas, hooks);
    this.boot();
    this.beginIntro();
  }

  // ------------------------------------------------------------------ setup

  protected measure() {
    super.measure();
    this.skids.resize(this.W, this.H);
  }

  /**
   * Writes "404" in cones where the page leaves room for it: above the
   * message, or beside it on a short wide screen. The car's mark and its
   * hint go under the number.
   */
  protected setup() {
    const { W, H } = this;
    const narrow = W < 640;
    const mx = narrow ? 20 : 48;
    const my = narrow ? 12 : 20;
    const HINT = 32; // the hint under the car, and some air
    const room = this.hooks.room?.() ?? { top: 0, avoid: null, hintHalf: 0 };

    // Tallest number for which number + car + hint fit in `h`: the car's
    // length follows the cone size, which follows the number (r = unit / 30,
    // clamped to 5…11, L = 6.2 r; the hint sits 2.5 L under the number).
    const unitFor = (h: number) => {
      const u = (h - HINT) / (1 + 2.5 * (6.2 / 30));
      if (u > 330) return Math.max(330, h - HINT - 2.5 * 11 * 6.2);
      if (u < 150) return Math.min(150, h - HINT - 2.5 * 5 * 6.2);
      return u;
    };
    // The number centred across [bx, bx + bw] and between top and bottom;
    // the car and its hint must end above `floor`.
    const plan = (bx: number, bw: number, top: number, bottom: number, floor: number) => {
      const unit = Math.max(60, Math.min((bw - 2 * mx) / 2.3, bottom - top, unitFor(floor - top), H * 0.4, 440));
      const L = clamp(unit / 30, 5, 11) * 6.2;
      const block = unit + L * 2.5 + HINT;
      const y0 = Math.min(top + Math.max(0, floor - top - block) * 0.45, bottom - unit);
      return { unit, cx: bx + bw / 2, y0: Math.max(top, y0) };
    };
    const top = room.top + my;
    let p = plan(0, W, top, H - my, H - 8);
    const M = room.avoid;
    if (M) {
      const right = M.x + M.w;
      // Above the message. The car may park beside it when its hint clears the text.
      const clears = W / 2 - room.hintHalf > right + 12;
      const above = plan(0, W, top, M.y - my, clears ? H - 8 : M.y - 8);
      // Or right of it, the full height.
      const beside = plan(right, W - right, top, H - my, H - 8);
      p = beside.unit > above.unit * 1.15 ? beside : above;
    }
    const { unit, cx, y0 } = p;

    this.r = clamp(unit / 30, 5, 11);
    this.car.size(this.r * 6.2);
    this.sprite = this.makeConeSprite();

    const spacing = this.r * 2.55;
    const dw = 0.62 * unit;
    const gap = 0.2 * unit;
    const x0 = cx - (3 * dw + 2 * gap) / 2;
    const pts: [number, number][] = [];
    const push = (x: number, y: number) => {
      for (const q of pts) if ((q[0] - x) ** 2 + (q[1] - y) ** 2 < (spacing * 0.72) ** 2) return;
      pts.push([x, y]);
    };
    const seg = (ax: number, ay: number, bx: number, by: number) => {
      const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / spacing));
      for (let i = 0; i <= n; i++) push(ax + ((bx - ax) * i) / n, ay + ((by - ay) * i) / n);
    };
    const four = (ox: number) => {
      const X = (u: number) => ox + u * unit;
      const Y = (v: number) => y0 + v * unit;
      seg(X(0.44), Y(0), X(0.44), Y(1)); // stem
      seg(X(0.44), Y(0), X(0), Y(0.66)); // diagonal
      seg(X(0), Y(0.66), X(0.62), Y(0.66)); // bar
    };
    const zero = (ox: number) => {
      const ex = ox + 0.31 * unit;
      const ey = y0 + 0.5 * unit;
      const rx = 0.31 * unit;
      const ry = 0.5 * unit;
      const perimeter = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
      const n = Math.round(perimeter / spacing);
      for (let i = 0; i < n; i++) {
        const t = (i / n) * Math.PI * 2;
        push(ex + rx * Math.cos(t), ey + ry * Math.sin(t));
      }
    };
    four(x0);
    zero(x0 + dw + gap);
    four(x0 + 2 * (dw + gap));

    // pop-in order: left to right, a sweep across the number
    const order = pts.map((q, i) => [q[0] + q[1] * 0.25, i] as const).sort((a, b) => a[0] - b[0]);
    const pop = new Array<number>(pts.length);
    order.forEach(([, i], rank) => (pop[i] = (rank / pts.length) * 0.85));
    this.cones = pts.map(([x, y], i) => ({ x, y, vx: 0, vy: 0, a: 0, w: 0, down: false, at: pop[i] }));
    this.down = 0;
    this.hud();

    this.start = { x: cx, y: Math.min(this.H - this.car.L, y0 + unit + this.car.L * 1.6) };
    this.car.place(this.start.x, this.start.y, -Math.PI / 2);
    this.skids.lift(this.car);
  }

  /** After the first touch, a resize keeps the play as it is. */
  protected resized() {
    if (!this.started) {
      this.skids.clear();
      this.setup();
      if (this.intro) this.beginIntro();
      else this.ready();
      return;
    }
    this.sprite = this.makeConeSprite();
    const m = this.r;
    for (const c of this.cones) {
      c.x = clamp(c.x, m, this.W - m);
      c.y = clamp(c.y, m, this.H - m);
    }
    const h = this.car.L / 2;
    this.car.x = clamp(this.car.x, h, this.W - h);
    this.car.y = clamp(this.car.y, h, this.H - h);
  }

  private beginIntro() {
    this.clock = 0;
    if (this.hooks.reduced) {
      this.intro = null;
      this.ready();
      return;
    }
    const S = this.start;
    const L = this.car.L;
    const E: [number, number] = [S.x + Math.min(this.W * 0.36, L * 7), this.H + L];
    this.intro = {
      conesDone: 1.35,
      carT0: 0.55,
      carDur: 1.25,
      p: [E, [E[0], S.y + L * 1.3], [S.x + L * 2.8, S.y + L * 0.15], [S.x, S.y]],
    };
  }

  private ready() {
    this.hooks.onReady?.({ x: this.start.x, y: this.start.y + this.car.L * 0.9 });
  }

  private hud() {
    const run = this.startedAt ? { from: this.startedAt, to: this.endedAt || undefined } : { from: 0, to: 0 };
    this.hooks.onHud?.({
      cells: [
        { main: String(this.down), post: ` / ${this.cones.length} down` },
        { clock: run },
        ...(this.best ? [{ pre: "Best ", main: formatTime(this.best) }] : []),
      ],
      reset: "Put the cones back",
    });
  }

  /** A cone seen from above, pre-drawn once per size. */
  private makeConeSprite() {
    const r = this.r;
    const pad = 3;
    const size = Math.ceil((r * 2 + pad * 2) * this.dpr);
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d")!;
    g.scale(this.dpr, this.dpr);
    const m = r + pad;
    g.fillStyle = "rgba(0,0,0,0.12)";
    g.beginPath();
    g.arc(m + 1, m + 1.6, r * 1.02, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = INK; // rubber base
    g.beginPath();
    g.roundRect(m - r * 0.94, m - r * 0.94, r * 1.88, r * 1.88, r * 0.32);
    g.fill();
    g.fillStyle = ORANGE;
    g.beginPath();
    g.arc(m, m, r * 0.76, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = "#FFFFFF"; // reflective band
    g.lineWidth = r * 0.2;
    g.beginPath();
    g.arc(m, m, r * 0.46, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = ORANGE_DARK;
    g.beginPath();
    g.arc(m, m, r * 0.2, 0, Math.PI * 2);
    g.fill();
    return c;
  }

  // ------------------------------------------------------------------- loop

  protected firstInput() {
    if (this.intro) this.finishIntro();
    this.startedAt = performance.now();
    this.hud();
  }

  protected shiftTime(ms: number) {
    if (this.startedAt && !this.won) {
      this.startedAt += ms;
      this.hud();
    }
  }

  private finishIntro() {
    this.intro = null;
    this.car.place(this.start.x, this.start.y, -Math.PI / 2);
    this.skids.lift(this.car);
    this.ready();
  }

  protected idle() {
    if (this.intro) return false;
    if (this.input.held()) return false;
    if (this.car.speed > 2) return false;
    for (const c of this.cones) if (c.vx !== 0 || c.vy !== 0 || Math.abs(c.w) > 0.05) return false;
    return true;
  }

  protected update(dt: number) {
    this.clock += dt;
    if (this.intro) {
      this.stepIntro();
      return;
    }
    this.step(dt / 2);
    this.step(dt / 2);
  }

  private stepIntro() {
    const it = this.intro!;
    const t = this.clock;
    const car = this.car;
    const u = clamp((t - it.carT0) / it.carDur, 0, 1);
    if (u > 0) {
      const e = easeOutCubic(u);
      const [x, y] = bezier(it.p, e);
      const [x2, y2] = bezier(it.p, Math.min(1, e + 0.01));
      const path = Math.atan2(y2 - y, x2 - x);
      // the body swings round to face the 404 while the car slides on
      const swing = clamp((u - 0.35) / 0.65, 0, 1);
      const s = swing * swing * (3 - 2 * swing);
      const target = -Math.PI / 2;
      const a = u >= 1 ? target : path + wrap(target - path) * s;
      const slip = Math.abs(wrap(a - path));
      car.x = x;
      car.y = y;
      car.a = a;
      car.steer = u < 0.9 ? -0.8 * s : 0;
      this.skids.mark(car, slip > 0.3 && u < 0.98 ? clamp(slip * 0.18, 0.06, 0.24) : 0);
    }
    if (t >= Math.max(it.conesDone, it.carT0 + it.carDur)) this.finishIntro();
  }

  private step(dt: number) {
    const car = this.car;
    const b = boostOf(this.skin);
    car.top = b.speed;
    car.power = b.accel;
    car.grip = b.grip;
    const p = this.input.pointer;
    const c = p.active ? car.toward(p.x, p.y) : this.input.controls();
    const alpha = car.step(dt, c);

    // walls
    const m = car.L / 2;
    if (car.x < m || car.x > this.W - m) {
      car.x = clamp(car.x, m, this.W - m);
      car.vx *= -0.3;
    }
    if (car.y < m || car.y > this.H - m) {
      car.y = clamp(car.y, m, this.H - m);
      car.vy *= -0.3;
    }
    this.skids.mark(car, alpha);
    this.collideCar();
    this.moveCones(dt);
  }

  private collideCar() {
    const car = this.car;
    const r = this.r;
    const fx = Math.cos(car.a);
    const fy = Math.sin(car.a);
    const rx = -fy;
    const ry = fx;
    const hx = car.L / 2;
    const hy = car.B / 2;
    const reach = (Math.hypot(hx, hy) + r) ** 2;
    for (const c of this.cones) {
      const dx = c.x - car.x;
      const dy = c.y - car.y;
      if (dx * dx + dy * dy > reach) continue;
      const lx = dx * fx + dy * fy;
      const ly = dx * rx + dy * ry;
      const qx = clamp(lx, -hx, hx);
      const qy = clamp(ly, -hy, hy);
      let nx = lx - qx;
      let ny = ly - qy;
      const dist = Math.hypot(nx, ny);
      let pen: number;
      if (dist > 0) {
        if (dist >= r) continue;
        pen = r - dist;
        nx /= dist;
        ny /= dist;
      } else {
        const px = hx - Math.abs(lx);
        const py = hy - Math.abs(ly);
        if (px < py) {
          nx = Math.sign(lx) || 1;
          ny = 0;
          pen = px + r;
        } else {
          nx = 0;
          ny = Math.sign(ly) || 1;
          pen = py + r;
        }
      }
      const wx = nx * fx + ny * rx;
      const wy = nx * fy + ny * ry;
      c.x += wx * pen * 0.94;
      c.y += wy * pen * 0.94;
      car.x -= wx * pen * 0.06;
      car.y -= wy * pen * 0.06;
      const rvx = c.vx - car.vx;
      const rvy = c.vy - car.vy;
      const vn = rvx * wx + rvy * wy;
      if (vn >= 0) continue;
      const j = (-(1 + 0.5) * vn) / (1 + 1 / 14);
      c.vx += j * wx;
      c.vy += j * wy;
      car.vx -= (j * wx) / 14;
      car.vy -= (j * wy) / 14;
      const vt = rvx * -wy + rvy * wx;
      c.w += (-vt / r) * 0.3;
      if (-vn > 110 * car.k) this.topple(c);
    }
  }

  private topple(c: Cone) {
    if (c.down) return;
    c.down = true;
    const speed = Math.hypot(c.vx, c.vy);
    c.a = (speed > 0 ? Math.atan2(c.vy, c.vx) : Math.random() * Math.PI * 2) + (Math.random() - 0.5) * 0.9;
    c.w += (Math.random() - 0.5) * 14;
    c.vx *= 1.12;
    c.vy *= 1.12;
    this.down++;
    this.earn(0.2, "cones");
    if (this.down === this.cones.length && !this.won) this.win();
    this.hud();
  }

  private win() {
    this.won = true;
    this.endedAt = performance.now();
    const run = this.endedAt - (this.startedAt || this.endedAt);
    const record = this.best === null || run < this.best;
    const best = this.best === null ? run : Math.min(this.best, run);
    if (this.startedAt) {
      this.best = best;
      store.set(BEST, String(Math.round(best)));
    }
    this.earn(5, "all down");
    if (record) this.earn(3, "record");
    this.hooks.onEnd?.({
      lead: `All ${this.cones.length} cones down in`,
      value: formatTime(run),
      tail: `best ${formatTime(best)}`,
      coins: this.earned,
    });
  }

  private moveCones(dt: number) {
    const { r } = this;
    const k = this.car.k;
    const cones = this.cones;
    const n = cones.length;
    // cone on cone: equal masses, a fast one knocks the other over
    const min2 = (r * 2) ** 2;
    for (let i = 0; i < n; i++) {
      const a = cones[i];
      for (let j = i + 1; j < n; j++) {
        const b = cones[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d2 = dx * dx + dy * dy;
        if (d2 >= min2 || d2 === 0) continue;
        const d = Math.sqrt(d2);
        const nx = dx / d;
        const ny = dy / d;
        const pen = (r * 2 - d) / 2;
        a.x -= nx * pen;
        a.y -= ny * pen;
        b.x += nx * pen;
        b.y += ny * pen;
        const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (vn >= 0) continue;
        const j2 = (-(1 + 0.45) * vn) / 2;
        a.vx -= j2 * nx;
        a.vy -= j2 * ny;
        b.vx += j2 * nx;
        b.vy += j2 * ny;
        if (-vn > 100 * k) {
          this.topple(a);
          this.topple(b);
        }
      }
    }
    for (const c of cones) {
      if (c.vx === 0 && c.vy === 0 && c.w === 0) continue;
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.a += c.w * dt;
      const f = Math.exp(-(c.down ? 2.2 : 5.5) * dt);
      c.vx *= f;
      c.vy *= f;
      c.w *= Math.exp(-2.4 * dt);
      if (c.x < r || c.x > this.W - r) {
        c.x = clamp(c.x, r, this.W - r);
        c.vx *= -0.45;
      }
      if (c.y < r || c.y > this.H - r) {
        c.y = clamp(c.y, r, this.H - r);
        c.vy *= -0.45;
      }
      if (c.vx * c.vx + c.vy * c.vy < (3 * k) ** 2) {
        c.vx = 0;
        c.vy = 0;
      }
      if (Math.abs(c.w) < 0.05) c.w = 0;
    }
  }

  // ------------------------------------------------------------------- draw

  protected render() {
    const g = this.ctx;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, this.canvas.width, this.canvas.height);
    g.drawImage(this.skids.canvas, 0, 0, this.canvas.width, this.canvas.height);
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    const t = this.clock;
    const popping = this.intro !== null;
    for (const c of this.cones) if (c.down) this.drawFallen(c);
    const sprite = this.sprite!;
    const half = sprite.width / this.dpr / 2;
    for (const c of this.cones) {
      if (c.down) continue;
      let s = 1;
      if (popping) {
        const p = clamp((t - c.at) / 0.45, 0, 1);
        if (p <= 0) continue;
        s = 0.35 + 0.65 * easeOutExpo(p);
        g.globalAlpha = Math.min(1, p * 2.2);
      }
      const h = half * s;
      g.drawImage(sprite, c.x - h, c.y - h, h * 2, h * 2);
      g.globalAlpha = 1;
    }
    if (!this.intro || t >= this.intro.carT0) this.car.draw(g, "player", t, this.skin);
  }

  /** A fallen cone, seen from the side, lying along `a`. */
  private drawFallen(c: Cone) {
    const g = this.ctx;
    const r = this.r;
    g.save();
    g.translate(c.x, c.y);
    g.rotate(c.a);
    g.fillStyle = "rgba(0,0,0,0.12)";
    g.beginPath();
    g.moveTo(-r * 0.95 + 1, -r * 0.8 + 2);
    g.lineTo(r * 1.3 + 1, 2);
    g.lineTo(-r * 0.95 + 1, r * 0.8 + 2);
    g.closePath();
    g.fill();
    g.fillStyle = ORANGE;
    g.beginPath();
    g.moveTo(-r * 0.95, -r * 0.72);
    g.lineTo(r * 1.2, -r * 0.12);
    g.quadraticCurveTo(r * 1.36, 0, r * 1.2, r * 0.12);
    g.lineTo(-r * 0.95, r * 0.72);
    g.closePath();
    g.fill();
    g.fillStyle = "#FFFFFF";
    g.beginPath();
    g.moveTo(-r * 0.05, -r * 0.47);
    g.lineTo(r * 0.38, -r * 0.35);
    g.lineTo(r * 0.38, r * 0.35);
    g.lineTo(-r * 0.05, r * 0.47);
    g.closePath();
    g.fill();
    g.fillStyle = INK;
    g.beginPath();
    g.roundRect(-r * 1.28, -r * 0.94, r * 0.36, r * 1.88, r * 0.12);
    g.fill();
    g.restore();
  }
}
