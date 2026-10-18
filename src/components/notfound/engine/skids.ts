import type { Car } from "./car";

type Pair = [number, number][];

/**
 * Tyre marks painted once onto a canvas the size of the world, at 1x (marks
 * are soft anyway: a quarter of the memory on a retina screen). For games
 * whose world is about the size of the screen.
 */
export class SkidLayer {
  canvas = document.createElement("canvas");
  private g = this.canvas.getContext("2d")!;
  private last = new Map<Car, Pair>();

  /** Resize, keeping what is already painted. */
  resize(w: number, h: number) {
    w = Math.max(1, Math.round(w));
    h = Math.max(1, Math.round(h));
    if (this.canvas.width === w && this.canvas.height === h) return;
    if (!this.canvas.width) {
      this.canvas.width = w;
      this.canvas.height = h;
      return;
    }
    const old = document.createElement("canvas");
    old.width = this.canvas.width;
    old.height = this.canvas.height;
    old.getContext("2d")!.drawImage(this.canvas, 0, 0);
    this.canvas.width = w;
    this.canvas.height = h;
    this.g.drawImage(old, 0, 0);
  }

  /** `alpha` 0 lifts the tyres. `rgb` tints the rubber (dirt on grass). */
  mark(car: Car, alpha: number, rgb = "18,18,20") {
    const now = car.rearWheels();
    const prev = this.last.get(car);
    if (alpha > 0 && prev) {
      const g = this.g;
      g.strokeStyle = `rgba(${rgb},${alpha})`;
      g.lineWidth = car.B * 0.2;
      g.lineCap = "round";
      g.beginPath();
      for (let i = 0; i < 2; i++) {
        g.moveTo(prev[i][0], prev[i][1]);
        g.lineTo(now[i][0], now[i][1]);
      }
      g.stroke();
    }
    if (alpha > 0) this.last.set(car, now);
    else this.last.delete(car);
  }

  lift(car: Car) {
    this.last.delete(car);
  }

  clear() {
    this.g.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.last.clear();
  }
}

/**
 * Tyre marks for a world far bigger than the screen: a ring of the last few
 * thousand segments, drawn only where the camera looks, in four shades.
 */
export class SkidTrail {
  private cap: number;
  private data: Float32Array; // x1 y1 x2 y2 alpha width
  private head = 0;
  private count = 0;
  private last = new Map<Car, Pair>();

  constructor(cap = 3000) {
    this.cap = cap;
    this.data = new Float32Array(cap * 6);
  }

  mark(car: Car, alpha: number) {
    const now = car.rearWheels();
    const prev = this.last.get(car);
    if (alpha > 0 && prev) {
      for (let i = 0; i < 2; i++) {
        // skip hair-thin slivers: they cost a draw and show nothing
        if (Math.abs(prev[i][0] - now[i][0]) + Math.abs(prev[i][1] - now[i][1]) < 0.5) continue;
        const o = this.head * 6;
        this.data.set([prev[i][0], prev[i][1], now[i][0], now[i][1], alpha, car.B * 0.2], o);
        this.head = (this.head + 1) % this.cap;
        this.count = Math.min(this.cap, this.count + 1);
      }
    }
    if (alpha > 0) this.last.set(car, now);
    else this.last.delete(car);
  }

  lift(car: Car) {
    this.last.delete(car);
  }

  clear() {
    this.head = 0;
    this.count = 0;
    this.last.clear();
  }

  /** Draws the marks inside the view rectangle (world coordinates). */
  draw(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) {
    if (!this.count) return;
    const d = this.data;
    g.lineCap = "round";
    for (let shade = 0; shade < 4; shade++) {
      const lo = 0.06 + shade * 0.06;
      const hi = shade === 3 ? 1 : lo + 0.06;
      let width = 0;
      g.beginPath();
      let any = false;
      for (let n = 0; n < this.count; n++) {
        const o = n * 6;
        const a = d[o + 4];
        if (a < lo || a >= hi) continue;
        const ax = d[o];
        const ay = d[o + 1];
        if ((ax < x0 && d[o + 2] < x0) || (ax > x1 && d[o + 2] > x1) || (ay < y0 && d[o + 3] < y0) || (ay > y1 && d[o + 3] > y1)) continue;
        g.moveTo(ax, ay);
        g.lineTo(d[o + 2], d[o + 3]);
        width = d[o + 5];
        any = true;
      }
      if (!any) continue;
      g.strokeStyle = `rgba(18,18,20,${lo + 0.03})`;
      g.lineWidth = width;
      g.stroke();
    }
  }
}
