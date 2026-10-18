// The 404 mini game: a top-down car and a "404" written in traffic cones.
// Canvas 2D only, a few hundred draw calls per frame at most, and the loop
// stops as soon as nothing moves (no CPU while the page just sits there).

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** What the page lays over the canvas, so the number stays clear of it. */
export interface Room {
  /** Bottom edge of the top bar. */
  top: number;
  /** The message: its text and buttons, not its whole box. */
  avoid: Box | null;
  /** Half the width of the hint shown under the car. */
  hintHalf: number;
}

export interface ConeGameOptions {
  reduced?: boolean;
  room?: () => Room;
  onStats?: (down: number, total: number) => void;
  onFirstInput?: () => void;
  onReady?: (hint: { x: number; y: number }) => void;
  onWin?: () => void;
}

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
  t0: number;
  conesDone: number;
  carT0: number;
  carDur: number;
  p: [number, number][];
}

const ORANGE = "#FF6A13";
const ORANGE_DARK = "#D9520A";
const INK = "#121214";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

function bezier(p: [number, number][], t: number): [number, number] {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0], a * p[0][1] + b * p[1][1] + c * p[2][1] + d * p[3][1]];
}

export class ConeGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private skid = document.createElement("canvas");
  private sctx: CanvasRenderingContext2D;
  private opts: ConeGameOptions;

  private dpr = 1;
  private W = 0;
  private H = 0;
  private r = 10; // cone radius
  private k = 1; // speed scale (px/s per unit)
  private L = 60; // car length
  private B = 28; // car width

  private cones: Cone[] = [];
  private down = 0;
  private car = { x: 0, y: 0, a: -Math.PI / 2, vx: 0, vy: 0, steer: 0, braking: false };
  private start = { x: 0, y: 0 };
  private rear: [number, number][] | null = null;

  private keys = { up: false, down: false, left: false, right: false, hand: false };
  private pointer = { active: false, x: 0, y: 0, id: -1 };
  private touched = false;
  private won = false;

  private clock = 0;
  private intro: Intro | null = null;
  private raf = 0;
  private running = false;
  private last = 0;
  private coneSprite: HTMLCanvasElement | null = null;

  constructor(canvas: HTMLCanvasElement, opts: ConeGameOptions = {}) {
    this.canvas = canvas;
    this.opts = opts;
    this.ctx = canvas.getContext("2d")!;
    this.sctx = this.skid.getContext("2d")!;
    this.measure();
    this.layout();
    this.beginIntro();
    window.addEventListener("resize", this.onResize);
    window.addEventListener("keydown", this.onKey);
    window.addEventListener("keyup", this.onKey);
    document.addEventListener("visibilitychange", this.onVisibility);
    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerup", this.onPointerUp);
    canvas.addEventListener("pointercancel", this.onPointerUp);
    this.wake();
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("keydown", this.onKey);
    window.removeEventListener("keyup", this.onKey);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("pointercancel", this.onPointerUp);
  }

  /** Cones back up, tyre marks gone, car on its mark. */
  reset() {
    this.touched = false;
    this.won = false;
    this.layout();
    this.sctx.clearRect(0, 0, this.skid.width, this.skid.height);
    this.beginIntro();
    this.wake();
  }

  // ------------------------------------------------------------------ setup

  private measure() {
    const rect = this.canvas.getBoundingClientRect();
    this.W = Math.max(1, rect.width);
    this.H = Math.max(1, rect.height);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Tyre marks are soft anyway: they live at 1x and are scaled up on the
    // blit, a quarter of the memory on a retina screen.
    const sw = Math.round(this.W);
    const sh = Math.round(this.H);
    if (this.skid.width && (this.skid.width !== sw || this.skid.height !== sh)) {
      // keep the marks across a resize
      const old = document.createElement("canvas");
      old.width = this.skid.width;
      old.height = this.skid.height;
      old.getContext("2d")!.drawImage(this.skid, 0, 0);
      this.skid.width = sw;
      this.skid.height = sh;
      this.sctx.drawImage(old, 0, 0);
    } else if (!this.skid.width) {
      this.skid.width = sw;
      this.skid.height = sh;
    }
    this.canvas.width = Math.round(this.W * this.dpr);
    this.canvas.height = Math.round(this.H * this.dpr);
  }

  /**
   * Writes "404" in cones where the page leaves room for it: above the
   * message, or beside it on a short wide screen. The car's mark and its
   * hint go under the number.
   */
  private layout() {
    const { W, H } = this;
    const narrow = W < 640;
    const mx = narrow ? 20 : 48;
    const my = narrow ? 12 : 20;
    const HINT = 32; // the hint under the car, and some air
    const room = this.opts.room?.() ?? { top: 0, avoid: null, hintHalf: 0 };

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
    this.k = this.r / 11;
    this.L = this.r * 6.2;
    this.B = this.L * 0.47;
    this.coneSprite = this.makeConeSprite();

    const spacing = this.r * 2.55;
    const dw = 0.62 * unit;
    const gap = 0.2 * unit;
    const x0 = cx - (3 * dw + 2 * gap) / 2;
    const pts: [number, number][] = [];
    const push = (x: number, y: number) => {
      for (const p of pts) if ((p[0] - x) ** 2 + (p[1] - y) ** 2 < (spacing * 0.72) ** 2) return;
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
    const order = pts.map((p, i) => [p[0] + p[1] * 0.25, i] as const).sort((a, b) => a[0] - b[0]);
    const pop = new Array<number>(pts.length);
    order.forEach(([, i], rank) => (pop[i] = (rank / pts.length) * 0.85));
    this.cones = pts.map(([x, y], i) => ({ x, y, vx: 0, vy: 0, a: 0, w: 0, down: false, at: pop[i] }));
    this.down = 0;
    this.opts.onStats?.(0, this.cones.length);

    this.start = { x: cx, y: Math.min(this.H - this.L, y0 + unit + this.L * 1.6) };
    Object.assign(this.car, { x: this.start.x, y: this.start.y, a: -Math.PI / 2, vx: 0, vy: 0, steer: 0 });
    this.rear = null;
  }

  private beginIntro() {
    this.clock = 0;
    if (this.opts.reduced) {
      this.intro = null;
      this.ready();
      return;
    }
    const S = this.start;
    const E: [number, number] = [S.x + Math.min(this.W * 0.36, this.L * 7), this.H + this.L];
    this.intro = {
      t0: 0,
      conesDone: 1.35,
      carT0: 0.55,
      carDur: 1.25,
      p: [E, [E[0], S.y + this.L * 1.3], [S.x + this.L * 2.8, S.y + this.L * 0.15], [S.x, S.y]],
    };
  }

  private ready() {
    this.opts.onReady?.({ x: this.start.x, y: this.start.y + this.L * 0.9 });
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

  // ------------------------------------------------------------------ input

  private firstInput() {
    if (this.touched) return;
    this.touched = true;
    if (this.intro) this.finishIntro();
    this.opts.onFirstInput?.();
  }

  private finishIntro() {
    this.intro = null;
    Object.assign(this.car, { x: this.start.x, y: this.start.y, a: -Math.PI / 2, vx: 0, vy: 0 });
    this.rear = null;
    this.ready();
  }

  private onKey = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    // typing stays typing; on a focused link or button, Space and Enter keep
    // their job, but the arrows still drive
    if (t && t.closest("input, textarea, select, [contenteditable]")) return;
    if (t && t.closest("a, button") && (e.code === "Space" || e.code === "Enter")) return;
    const on = e.type === "keydown";
    let hit = true;
    switch (e.code) {
      case "ArrowUp":
      case "KeyW":
        this.keys.up = on;
        break;
      case "ArrowDown":
      case "KeyS":
        this.keys.down = on;
        break;
      case "ArrowLeft":
      case "KeyA":
        this.keys.left = on;
        break;
      case "ArrowRight":
      case "KeyD":
        this.keys.right = on;
        break;
      case "Space":
        this.keys.hand = on;
        break;
      default:
        hit = false;
    }
    if (!hit) return;
    e.preventDefault();
    if (on) this.firstInput();
    this.wake();
  };

  private onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    this.pointer = { active: true, x: e.offsetX, y: e.offsetY, id: e.pointerId };
    this.canvas.setPointerCapture(e.pointerId);
    this.firstInput();
    this.wake();
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.pointer.active || e.pointerId !== this.pointer.id) return;
    this.pointer.x = e.offsetX;
    this.pointer.y = e.offsetY;
  };

  private onPointerUp = (e: PointerEvent) => {
    if (e.pointerId !== this.pointer.id) return;
    this.pointer.active = false;
  };

  private onResize = () => {
    this.measure();
    if (!this.touched) {
      this.sctx.clearRect(0, 0, this.skid.width, this.skid.height);
      this.layout();
      if (this.intro) this.beginIntro();
      else this.ready();
    } else {
      this.coneSprite = this.makeConeSprite();
      const m = this.r;
      for (const c of this.cones) {
        c.x = clamp(c.x, m, this.W - m);
        c.y = clamp(c.y, m, this.H - m);
      }
      this.car.x = clamp(this.car.x, this.L / 2, this.W - this.L / 2);
      this.car.y = clamp(this.car.y, this.L / 2, this.H - this.L / 2);
    }
    this.wake();
  };

  private onVisibility = () => {
    if (document.hidden) {
      this.running = false;
      cancelAnimationFrame(this.raf);
    } else this.wake();
  };

  // ------------------------------------------------------------------- loop

  private wake() {
    if (this.running || document.hidden) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private frame = (now: number) => {
    if (!this.running) return;
    const dt = Math.min(1 / 30, (now - this.last) / 1000);
    this.last = now;
    this.clock += dt;
    if (this.intro) this.stepIntro();
    else {
      this.step(dt / 2);
      this.step(dt / 2);
    }
    this.draw();
    if (this.idle()) {
      this.running = false;
      return;
    }
    this.raf = requestAnimationFrame(this.frame);
  };

  private idle() {
    if (this.intro) return false;
    const { keys, pointer, car } = this;
    if (keys.up || keys.down || keys.left || keys.right || keys.hand || pointer.active) return false;
    if (Math.hypot(car.vx, car.vy) > 2) return false;
    for (const c of this.cones) if (c.vx !== 0 || c.vy !== 0 || Math.abs(c.w) > 0.05) return false;
    return true;
  }

  private stepIntro() {
    const it = this.intro!;
    const t = this.clock;
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
      const car = this.car;
      const slip = Math.abs(wrap(a - path));
      car.x = x;
      car.y = y;
      car.a = a;
      car.steer = u < 0.9 ? -0.8 * s : 0;
      this.markRear(slip > 0.3 && u < 0.98 ? clamp(slip * 0.18, 0.06, 0.24) : 0);
    }
    if (t >= Math.max(it.conesDone, it.carT0 + it.carDur)) this.finishIntro();
  }

  // ---------------------------------------------------------------- physics

  private step(dt: number) {
    const { car, keys, pointer, k } = this;
    let throttle = (keys.up ? 1 : 0) - (keys.down ? 1 : 0);
    let steer = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    const hand = keys.hand;
    if (pointer.active) {
      const dx = pointer.x - car.x;
      const dy = pointer.y - car.y;
      const dist = Math.hypot(dx, dy);
      const diff = wrap(Math.atan2(dy, dx) - car.a);
      steer = clamp(diff * 2.2, -1, 1);
      throttle = dist > this.L * 0.9 ? 1 : dist < this.L * 0.5 ? -0.6 : 0;
    }

    const fx = Math.cos(car.a);
    const fy = Math.sin(car.a);
    const rx = -fy;
    const ry = fx;
    let vf = car.vx * fx + car.vy * fy;
    let vl = car.vx * rx + car.vy * ry;

    car.braking = false;
    if (throttle > 0) {
      vf += (vf < -5 * k ? 1700 : 900) * k * throttle * dt;
      if (vf < -5 * k) car.braking = true;
    } else if (throttle < 0) {
      if (vf > 5 * k) {
        vf -= 1700 * k * -throttle * dt;
        car.braking = true;
      } else vf -= 650 * k * -throttle * dt;
    } else {
      const roll = 300 * k * dt;
      vf = Math.abs(vf) <= roll ? 0 : vf - Math.sign(vf) * roll;
    }
    vf -= vf * 0.6 * dt;
    vf = clamp(vf, -240 * k, 600 * k);
    if (hand) {
      vf *= Math.exp(-1.1 * dt);
      car.braking = true;
    }
    vl *= Math.exp(-(hand ? 1.4 : 9) * dt);

    const grip = clamp(Math.abs(vf) / (90 * k), 0, 1);
    const fast = clamp(Math.abs(vf) / (600 * k), 0, 1);
    car.a += steer * 3.4 * grip * Math.sign(vf || 1) * (hand ? 1.35 : 1) * (1 - 0.3 * fast) * dt;
    car.steer += (steer - car.steer) * Math.min(1, dt * 14);

    car.vx = fx * vf + rx * vl;
    car.vy = fy * vf + ry * vl;
    car.x += car.vx * dt;
    car.y += car.vy * dt;

    // walls
    const m = this.L / 2;
    if (car.x < m || car.x > this.W - m) {
      car.x = clamp(car.x, m, this.W - m);
      car.vx *= -0.3;
    }
    if (car.y < m || car.y > this.H - m) {
      car.y = clamp(car.y, m, this.H - m);
      car.vy *= -0.3;
    }

    const slip = Math.abs(vl);
    const skidding = slip > 70 * k || (hand && Math.abs(vf) > 60 * k) || (car.braking && Math.abs(vf) > 240 * k);
    this.markRear(skidding ? clamp((slip + (car.braking ? 120 * k : 0)) / (900 * k), 0.06, 0.3) : 0);

    this.collideCar(fx, fy, rx, ry);
    this.moveCones(dt);
  }

  private collideCar(fx: number, fy: number, rx: number, ry: number) {
    const { car, r } = this;
    const hx = this.L / 2;
    const hy = this.B / 2;
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
      let dist = Math.hypot(nx, ny);
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
        dist = 0;
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
      if (-vn > 110 * this.k) this.topple(c);
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
    this.opts.onStats?.(this.down, this.cones.length);
    if (this.down === this.cones.length && !this.won) {
      this.won = true;
      this.opts.onWin?.();
    }
  }

  private moveCones(dt: number) {
    const { r, k } = this;
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

  /** Rubber on the floor from both rear wheels, `alpha` 0 = lifted. */
  private markRear(alpha: number) {
    const { car } = this;
    const fx = Math.cos(car.a);
    const fy = Math.sin(car.a);
    const bx = car.x - fx * this.L * 0.3;
    const by = car.y - fy * this.L * 0.3;
    const ox = -fy * this.B * 0.38;
    const oy = fx * this.B * 0.38;
    const now: [number, number][] = [
      [bx + ox, by + oy],
      [bx - ox, by - oy],
    ];
    if (alpha > 0 && this.rear) {
      const g = this.sctx;
      g.strokeStyle = `rgba(18,18,20,${alpha})`;
      g.lineWidth = this.B * 0.2;
      g.lineCap = "round";
      g.beginPath();
      for (let i = 0; i < 2; i++) {
        g.moveTo(this.rear[i][0], this.rear[i][1]);
        g.lineTo(now[i][0], now[i][1]);
      }
      g.stroke();
    }
    this.rear = alpha > 0 ? now : null;
  }

  // ------------------------------------------------------------------- draw

  private draw() {
    const g = this.ctx;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, this.canvas.width, this.canvas.height);
    g.drawImage(this.skid, 0, 0, this.canvas.width, this.canvas.height);
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    const t = this.clock;
    const popping = this.intro !== null;
    for (const c of this.cones) if (c.down) this.drawFallen(g, c);
    const sprite = this.coneSprite!;
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
    if (!this.intro || t >= this.intro.carT0) this.drawCar(g);
  }

  /** A fallen cone, seen from the side, lying along `a`. */
  private drawFallen(g: CanvasRenderingContext2D, c: Cone) {
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

  /** The car from above: black, checkered roof, front wheels that steer. */
  private drawCar(g: CanvasRenderingContext2D) {
    const { car, L, B } = this;
    g.save();
    g.translate(car.x, car.y);
    g.rotate(car.a);
    // shadow
    g.fillStyle = "rgba(0,0,0,0.14)";
    g.beginPath();
    g.roundRect(-L / 2 + 2, -B / 2 + 3, L, B, B * 0.42);
    g.fill();
    // wheels
    g.fillStyle = "#050506";
    const ww = L * 0.2;
    const wh = B * 0.2;
    for (const [x, y, front] of [
      [-L * 0.3, -B * 0.47, false],
      [-L * 0.3, B * 0.47, false],
      [L * 0.29, -B * 0.47, true],
      [L * 0.29, B * 0.47, true],
    ] as const) {
      g.save();
      g.translate(x, y);
      if (front) g.rotate(car.steer * 0.5);
      g.beginPath();
      g.roundRect(-ww / 2, -wh / 2, ww, wh, wh * 0.4);
      g.fill();
      g.restore();
    }
    // body
    g.fillStyle = INK;
    g.beginPath();
    g.roundRect(-L / 2, -B / 2, L, B, B * 0.42);
    g.fill();
    // glass
    g.fillStyle = "#3B3F49";
    g.beginPath();
    g.moveTo(L * 0.06, -B * 0.36);
    g.lineTo(L * 0.22, -B * 0.31);
    g.lineTo(L * 0.22, B * 0.31);
    g.lineTo(L * 0.06, B * 0.36);
    g.closePath();
    g.fill();
    g.beginPath();
    g.moveTo(-L * 0.34, -B * 0.3);
    g.lineTo(-L * 0.24, -B * 0.34);
    g.lineTo(-L * 0.24, B * 0.34);
    g.lineTo(-L * 0.34, B * 0.3);
    g.closePath();
    g.fill();
    // roof with the Wheeloh flag
    g.fillStyle = "#1D1D22";
    g.beginPath();
    g.roundRect(-L * 0.22, -B * 0.36, L * 0.27, B * 0.72, B * 0.12);
    g.fill();
    const cell = B * 0.15;
    const cols = 4;
    const rows = 3;
    const sx = -L * 0.085 - (cols * cell) / 2;
    const sy = -(rows * cell) / 2;
    g.fillStyle = "#FFFFFF";
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) if ((i + j) % 2 === 0) g.fillRect(sx + i * cell, sy + j * cell, cell, cell);
    // lights
    g.fillStyle = "#FFF7E0";
    g.fillRect(L * 0.43, -B * 0.4, L * 0.05, B * 0.18);
    g.fillRect(L * 0.43, B * 0.22, L * 0.05, B * 0.18);
    g.fillStyle = car.braking ? "#FF3B30" : "#B3261E";
    g.fillRect(-L * 0.49, -B * 0.4, L * 0.04, B * 0.2);
    g.fillRect(-L * 0.49, B * 0.2, L * 0.04, B * 0.2);
    if (car.braking) {
      g.fillStyle = "rgba(255,59,48,0.22)";
      g.fillRect(-L * 0.58, -B * 0.46, L * 0.09, B * 0.32);
      g.fillRect(-L * 0.58, B * 0.14, L * 0.09, B * 0.32);
    }
    g.restore();
  }
}
