import { clamp, INK, wrap, type Controls } from "./core";
import { STOCK, type Skin } from "./skins";

// The car every 404 game drives: top-down, arcade grip that lets go into a
// drift under the handbrake. Speeds scale with the car's length, so a small
// car on a phone feels like a big one on a desktop.

export interface Surface {
  /** Lateral grip (1 = tarmac). */
  grip: number;
  /** Engine force (1 = tarmac). */
  accel: number;
  /** Extra rolling drag, per second. */
  drag: number;
}

export const ROAD: Surface = { grip: 1, accel: 1, drag: 0 };
export const GRASS: Surface = { grip: 0.42, accel: 0.55, drag: 1.7 };

export type CarLook = "player" | "police" | "swat" | "ghost";

const RED = "#FF3B30";
const BLUE = "#2F6BFF";

export class Car {
  x = 0;
  y = 0;
  a = -Math.PI / 2;
  vx = 0;
  vy = 0;
  steer = 0;
  braking = false;
  L = 60;
  B = 28;
  /** Speed scale: px/s per unit of the reference car (68 px long). */
  k = 1;
  /** Top speed, as a share of the player's. */
  top = 1;
  /** Engine and tyres (a rarer skin is a better car). */
  power = 1;
  grip = 1;

  constructor(L: number) {
    this.size(L);
  }

  size(L: number) {
    this.L = L;
    this.B = L * 0.47;
    this.k = L / 68.2;
  }

  place(x: number, y: number, a: number) {
    Object.assign(this, { x, y, a, vx: 0, vy: 0, steer: 0, braking: false });
  }

  get speed() {
    return Math.hypot(this.vx, this.vy);
  }

  /** Speed along the nose. */
  get forward() {
    return this.vx * Math.cos(this.a) + this.vy * Math.sin(this.a);
  }

  /**
   * One physics step. Returns how dark the tyre marks are (0 = none).
   * Walls are the game's business.
   */
  step(dt: number, c: Controls, s: Surface = ROAD): number {
    const k = this.k;
    const fx = Math.cos(this.a);
    const fy = Math.sin(this.a);
    const rx = -fy;
    const ry = fx;
    let vf = this.vx * fx + this.vy * fy;
    let vl = this.vx * rx + this.vy * ry;
    const { throttle, hand } = c;

    this.braking = false;
    if (throttle > 0) {
      vf += (vf < -5 * k ? 1700 : 900 * s.accel * this.power) * k * throttle * dt;
      if (vf < -5 * k) this.braking = true;
    } else if (throttle < 0) {
      if (vf > 5 * k) {
        vf -= 1700 * k * -throttle * dt;
        this.braking = true;
      } else vf -= 650 * k * s.accel * -throttle * dt;
    } else {
      const roll = 300 * k * dt;
      vf = Math.abs(vf) <= roll ? 0 : vf - Math.sign(vf) * roll;
    }
    vf -= vf * (0.6 + s.drag) * dt;
    vf = clamp(vf, -240 * k, 600 * k * this.top);
    if (hand) {
      vf *= Math.exp(-1.1 * dt);
      this.braking = true;
    }
    vl *= Math.exp(-(hand ? 1.4 : 9) * s.grip * this.grip * dt);

    const grip = clamp(Math.abs(vf) / (90 * k), 0, 1);
    const fast = clamp(Math.abs(vf) / (600 * k), 0, 1);
    this.a += c.steer * 3.4 * grip * Math.sign(vf || 1) * (hand ? 1.35 : 1) * (1 - 0.3 * fast) * dt;
    this.steer += (c.steer - this.steer) * Math.min(1, dt * 14);

    this.vx = fx * vf + rx * vl;
    this.vy = fy * vf + ry * vl;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    const slip = Math.abs(vl);
    const skidding = slip > 70 * k || (hand && Math.abs(vf) > 60 * k) || (this.braking && Math.abs(vf) > 240 * k);
    return skidding ? clamp((slip + (this.braking ? 120 * k : 0)) / (900 * k), 0.06, 0.3) : 0;
  }

  /** Controls that drive toward a point: a finger held on the screen. */
  toward(tx: number, ty: number): Controls {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.hypot(dx, dy);
    const diff = wrap(Math.atan2(dy, dx) - this.a);
    return {
      steer: clamp(diff * 2.2, -1, 1),
      throttle: dist > this.L * 0.9 ? 1 : dist < this.L * 0.5 ? -0.6 : 0,
      hand: false,
    };
  }

  /** The two rear wheels, where the tyre marks come from. */
  rearWheels(): [number, number][] {
    const fx = Math.cos(this.a);
    const fy = Math.sin(this.a);
    const bx = this.x - fx * this.L * 0.3;
    const by = this.y - fy * this.L * 0.3;
    const ox = -fy * this.B * 0.38;
    const oy = fx * this.B * 0.38;
    return [
      [bx + ox, by + oy],
      [bx - ox, by - oy],
    ];
  }

  /**
   * The car from above. The player's wears a skin (the stock one is black
   * with the Wheeloh flag on the roof); the police's is white with a black
   * hood and boot and a light bar; the SWAT van is a navy box; the ghost is
   * the player's, see-through. `t` drives sirens and shifting paint.
   */
  draw(g: CanvasRenderingContext2D, look: CarLook = "player", t = 0, skin: Skin = STOCK) {
    const { L, B } = this;
    const police = look === "police";
    const swat = look === "swat";
    const sk = look === "player" || look === "ghost" ? skin : null;
    g.save();
    g.translate(this.x, this.y);
    g.rotate(this.a);
    if (look === "ghost") g.globalAlpha = 0.28;
    else {
      if (sk?.glow) {
        // neon under the car
        g.save();
        g.shadowColor = sk.glow;
        g.shadowBlur = B * 0.9;
        g.fillStyle = sk.glow;
        g.globalAlpha = 0.5;
        g.beginPath();
        g.roundRect(-L * 0.46, -B * 0.46, L * 0.92, B * 0.92, B * 0.4);
        g.fill();
        g.restore();
      }
      g.fillStyle = "rgba(0,0,0,0.14)";
      g.beginPath();
      g.roundRect(-L / 2 + 2, -B / 2 + 3, L, B, B * 0.42);
      g.fill();
    }
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
      if (front) g.rotate(this.steer * 0.5);
      g.beginPath();
      g.roundRect(-ww / 2, -wh / 2, ww, wh, wh * 0.4);
      g.fill();
      g.restore();
    }
    // body
    const body = () => {
      g.beginPath();
      if (swat) g.roundRect(-L / 2, -B / 2, L, B, B * 0.18);
      else g.roundRect(-L / 2, -B / 2, L, B, B * 0.42);
    };
    let paint: string | CanvasGradient = police ? "#F7F7F9" : swat ? "#1F2A44" : sk ? sk.body : INK;
    if (sk?.holo) paint = `hsl(${(t * 70) % 360} 82% 64%)`;
    if (sk?.metallic) {
      const gr = g.createLinearGradient(-L / 2, -B / 2, L / 2, B / 2);
      gr.addColorStop(0, shade(sk.body, 0.35));
      gr.addColorStop(0.45, sk.body);
      gr.addColorStop(0.55, shade(sk.body, 0.5));
      gr.addColorStop(1, shade(sk.body, -0.35));
      paint = gr;
    }
    g.fillStyle = paint;
    body();
    g.fill();
    if (police || (sk && isLight(sk.body))) {
      g.strokeStyle = "rgba(0,0,0,0.18)";
      g.lineWidth = 1;
      g.stroke();
    }
    g.save();
    body();
    g.clip();
    if (police) {
      // black hood and boot, white doors
      g.fillStyle = INK;
      g.fillRect(L * 0.2, -B / 2, L * 0.3, B);
      g.fillRect(-L / 2, -B / 2, L * 0.16, B);
    }
    if (swat) {
      g.fillStyle = "#FFFFFF";
      g.fillRect(-L * 0.36, -B * 0.06, L * 0.7, B * 0.12);
    }
    if (sk) paintSkin(g, sk, L, B, t);
    g.restore();
    // glass
    if (!swat) {
      g.fillStyle = police ? "#2A2D35" : "#3B3F49";
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
    } else {
      g.fillStyle = "#2A2D35";
      g.fillRect(L * 0.3, -B * 0.38, L * 0.1, B * 0.76);
    }
    // roof
    if (!swat) {
      g.fillStyle = police ? "#FFFFFF" : sk?.roof ?? "#1D1D22";
      if (sk?.holo) g.fillStyle = `hsl(${(t * 70 + 40) % 360} 75% 55%)`;
      g.beginPath();
      g.roundRect(-L * 0.22, -B * 0.36, L * 0.27, B * 0.72, B * 0.12);
      g.fill();
    }
    if (police || swat) {
      // light bar across the roof, red and blue taking turns
      const on = Math.floor(t * 6) % 2 === 0;
      const bw = L * (swat ? 0.05 : 0.07);
      const bx = swat ? L * 0.18 : -L * 0.1;
      g.fillStyle = on ? RED : "#7A1C18";
      g.fillRect(bx, -B * 0.4, bw, B * 0.4);
      g.fillStyle = on ? "#1B2C66" : BLUE;
      g.fillRect(bx, 0, bw, B * 0.4);
    } else if (sk?.flag) {
      // the Wheeloh flag
      const cell = B * 0.15;
      const sx = -L * 0.085 - (4 * cell) / 2;
      const sy = -(3 * cell) / 2;
      g.fillStyle = isLight(sk.roof ?? sk.body) ? INK : "#FFFFFF";
      for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) if ((i + j) % 2 === 0) g.fillRect(sx + i * cell, sy + j * cell, cell, cell);
    }
    // lights
    g.fillStyle = "#FFF7E0";
    g.fillRect(L * 0.43, -B * 0.4, L * 0.05, B * 0.18);
    g.fillRect(L * 0.43, B * 0.22, L * 0.05, B * 0.18);
    g.fillStyle = this.braking ? RED : "#B3261E";
    g.fillRect(-L * 0.49, -B * 0.4, L * 0.04, B * 0.2);
    g.fillRect(-L * 0.49, B * 0.2, L * 0.04, B * 0.2);
    if (this.braking && look !== "ghost") {
      g.fillStyle = "rgba(255,59,48,0.22)";
      g.fillRect(-L * 0.58, -B * 0.46, L * 0.09, B * 0.32);
      g.fillRect(-L * 0.58, B * 0.14, L * 0.09, B * 0.32);
    }
    g.restore();
  }

  /** The siren's glow on the ground, drawn under the cars. */
  drawSirenGlow(g: CanvasRenderingContext2D, t: number) {
    const on = Math.floor(t * 6) % 2 === 0;
    const r = this.L * 1.1;
    const grad = g.createRadialGradient(this.x, this.y, 0, this.x, this.y, r);
    grad.addColorStop(0, on ? "rgba(255,59,48,0.22)" : "rgba(47,107,255,0.22)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(this.x - r, this.y - r, r * 2, r * 2);
  }
}

/** Lighter (amount > 0) or darker (< 0) version of a #rrggbb colour. */
export function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.round(amount >= 0 ? c + (255 - c) * amount : c * (1 + amount));
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `rgb(${r},${g},${b})`;
}

const isLight = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 170;
};

// a fixed camouflage, so the same skin looks the same every frame
const CAMO: [number, number, number, string][] = [
  [-0.3, -0.25, 0.22, "#4B5536"], [0.05, 0.2, 0.25, "#8A9468"], [0.32, -0.18, 0.18, "#3F462C"],
  [-0.12, 0.3, 0.16, "#3F462C"], [0.2, 0.32, 0.14, "#4B5536"], [-0.42, 0.18, 0.15, "#8A9468"], [0.42, 0.2, 0.13, "#8A9468"],
];

/** The skin's decoration, drawn inside the body's outline. */
function paintSkin(g: CanvasRenderingContext2D, sk: Skin, L: number, B: number, t: number) {
  if (sk.pattern === "carbon") {
    g.strokeStyle = "rgba(255,255,255,0.07)";
    g.lineWidth = Math.max(1, B * 0.04);
    g.beginPath();
    for (let x = -L; x < L; x += B * 0.14) {
      g.moveTo(x, -B / 2);
      g.lineTo(x + B, B / 2);
    }
    g.stroke();
  } else if (sk.pattern === "checker") {
    const c = B / 5;
    g.fillStyle = INK;
    for (let i = -6; i < 6; i++) for (let j = -3; j < 3; j++) if ((i + j) % 2 === 0) g.fillRect(i * c, j * c, c, c);
  } else if (sk.pattern === "camo") {
    for (const [x, y, r, col] of CAMO) {
      g.fillStyle = col;
      g.beginPath();
      g.ellipse(x * L, y * B * 2, r * L, r * B * 1.4, 0.6, 0, Math.PI * 2);
      g.fill();
    }
  } else if (sk.pattern === "flames") {
    // flames licking back from the nose
    const flame = (y: number, s: number, col: string) => {
      g.fillStyle = col;
      g.beginPath();
      g.moveTo(L * 0.5, y - B * 0.22 * s);
      for (let k = 0; k <= 4; k++) {
        const x = L * (0.42 - k * 0.11 * s);
        g.lineTo(x - L * 0.08 * s, y - B * 0.12 * s + (k % 2 ? 0 : B * 0.06));
        g.lineTo(x, y + (k % 2 ? B * 0.1 : -B * 0.02) * s);
      }
      g.lineTo(L * 0.5, y + B * 0.22 * s);
      g.closePath();
      g.fill();
    };
    flame(-B * 0.22, 1, "#FF6A13");
    flame(B * 0.22, 1, "#FF6A13");
    flame(-B * 0.22, 0.6, "#FFC531");
    flame(B * 0.22, 0.6, "#FFC531");
  }
  if (sk.stripes) {
    const w = B * sk.stripes.width;
    const n = sk.stripes.colors.length;
    sk.stripes.colors.forEach((col, i) => {
      g.fillStyle = col;
      const y = n === 1 ? -w / 2 : (i === 0 ? -w * 1.35 : w * 0.35);
      g.fillRect(-L / 2, y, L, w);
    });
  }
  if (sk.band) {
    const w = L * 0.16;
    if (sk.band.checker) {
      const c = B / 6;
      g.fillStyle = sk.band.color;
      for (let i = 0; i < 2; i++) for (let j = -3; j < 3; j++) if ((i + j) % 2 === 0) g.fillRect(-L * 0.36 + i * c, j * c, c, c);
    } else {
      g.fillStyle = sk.band.color;
      g.fillRect(-L * 0.42, -B / 2, w, B);
    }
  }
  if (sk.holo) {
    // a sheen sweeping across
    const x = ((t * 0.8) % 2) * L * 1.6 - L * 1.3;
    const gr = g.createLinearGradient(x, 0, x + L * 0.5, 0);
    gr.addColorStop(0, "rgba(255,255,255,0)");
    gr.addColorStop(0.5, "rgba(255,255,255,0.45)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr;
    g.fillRect(-L / 2, -B / 2, L, B);
  }
}
