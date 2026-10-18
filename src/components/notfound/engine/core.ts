// Shared by the three 404 games: maths, the controls, the frame loop and
// what a game tells the page (score pill, hint, end of a run, coins).
// Canvas 2D only; a loop never runs when nothing moves or the tab is hidden.

import type { Skin } from "./skins";

export const INK = "#121214";

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/** m:ss.s */
export const formatTime = (ms: number) => {
  const s = Math.max(0, ms) / 1000;
  const m = Math.floor(s / 60);
  return `${m}:${(s - m * 60).toFixed(1).padStart(4, "0")}`;
};

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** What the page lays over the canvas, so a game keeps its layout clear of it. */
export interface Room {
  /** Bottom edge of the top bar. */
  top: number;
  /** The message: its text and buttons, not its whole box. */
  avoid: Box | null;
  /** Half the width of the hint shown under the car. */
  hintHalf: number;
}

/** One slot of the score pill. A clock is drawn live by the page. */
export interface HudCell {
  pre?: string;
  main?: string;
  post?: string;
  clock?: { from: number; to?: number };
  tone?: "good" | "bad";
  stars?: { n: number; of: number };
  /** A small gauge (the chase's car health), 0…1. */
  bar?: number;
}

export interface Hud {
  cells: HudCell[];
  /** 0…1, a thin bar under the pill (the chase's "busted" gauge). */
  meter?: number;
  /** Label of the restart button. */
  reset: string;
}

export interface GameEnd {
  lead: string;
  value: string;
  tail?: string;
  /** Title of the end card (circuit, chase). */
  title?: string;
  /** Coins won during the run. */
  coins?: number;
}

export type Difficulty = "easy" | "normal" | "hard";

export interface GameHooks {
  reduced?: boolean;
  room?: () => Room;
  onHud?: (hud: Hud) => void;
  onReady?: (hint: { x: number; y: number }) => void;
  onFirstInput?: () => void;
  onEnd?: (end: GameEnd) => void;
  /** Start lights: how many are lit (0…5), "go", or null when hidden. */
  onLights?: (lit: number | "go" | null) => void;
  /** Coins won, with what for ("cone", "lap"…). */
  onEarn?: (coins: number, why: string) => void;
  /** The paint on the player's car, read at every frame. */
  skin?: () => Skin;
  difficulty?: () => Difficulty;
}

/** localStorage that never throws (private mode, blocked storage). */
export const store = {
  num(key: string): number | null {
    try {
      const v = Number(localStorage.getItem(key));
      return v > 0 ? v : null;
    } catch {
      return null;
    }
  },
  json<T>(key: string): T | null {
    try {
      const v = localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : null;
    } catch {
      return null;
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    } catch {
      // storage blocked: the game still works, it just forgets
    }
  },
};

export interface Controls {
  throttle: number;
  steer: number;
  hand: boolean;
}

/**
 * Arrow keys / WASD / Space, plus one finger or mouse button held on the
 * canvas. Typing in a field stays typing; on a focused link or button, Space
 * and Enter keep their job but the arrows still drive.
 */
export class Input {
  keys = { up: false, down: false, left: false, right: false, hand: false };
  pointer = { active: false, x: 0, y: 0, id: -1 };
  /** Off while a panel covers the game. */
  enabled = true;

  constructor(
    private canvas: HTMLCanvasElement,
    private onUse: () => void,
  ) {
    window.addEventListener("keydown", this.onKey);
    window.addEventListener("keyup", this.onKey);
    window.addEventListener("blur", this.release);
    canvas.addEventListener("pointerdown", this.onDown);
    canvas.addEventListener("pointermove", this.onMove);
    canvas.addEventListener("pointerup", this.onUp);
    canvas.addEventListener("pointercancel", this.onUp);
  }

  destroy() {
    window.removeEventListener("keydown", this.onKey);
    window.removeEventListener("keyup", this.onKey);
    window.removeEventListener("blur", this.release);
    this.canvas.removeEventListener("pointerdown", this.onDown);
    this.canvas.removeEventListener("pointermove", this.onMove);
    this.canvas.removeEventListener("pointerup", this.onUp);
    this.canvas.removeEventListener("pointercancel", this.onUp);
  }

  /** Anything held right now. */
  held() {
    const k = this.keys;
    return k.up || k.down || k.left || k.right || k.hand || this.pointer.active;
  }

  /** Keyboard controls (the pointer is turned into controls by the game). */
  controls(): Controls {
    const k = this.keys;
    return { throttle: (k.up ? 1 : 0) - (k.down ? 1 : 0), steer: (k.right ? 1 : 0) - (k.left ? 1 : 0), hand: k.hand };
  }

  private release = () => {
    Object.assign(this.keys, { up: false, down: false, left: false, right: false, hand: false });
    this.pointer.active = false;
  };

  disable() {
    this.enabled = false;
    this.release();
  }

  private onKey = (e: KeyboardEvent) => {
    if (!this.enabled) return;
    const t = e.target as HTMLElement | null;
    if (t && t.closest("input, textarea, select, [contenteditable]")) return;
    if (t && t.closest("a, button") && (e.code === "Space" || e.code === "Enter")) return;
    const on = e.type === "keydown";
    const k = this.keys;
    switch (e.code) {
      case "ArrowUp":
      case "KeyW":
        k.up = on;
        break;
      case "ArrowDown":
      case "KeyS":
        k.down = on;
        break;
      case "ArrowLeft":
      case "KeyA":
        k.left = on;
        break;
      case "ArrowRight":
      case "KeyD":
        k.right = on;
        break;
      case "Space":
        k.hand = on;
        break;
      default:
        return;
    }
    e.preventDefault();
    this.onUse();
  };

  private onDown = (e: PointerEvent) => {
    if (e.button !== 0 || !this.enabled) return;
    this.pointer = { active: true, x: e.offsetX, y: e.offsetY, id: e.pointerId };
    this.canvas.setPointerCapture(e.pointerId);
    this.onUse();
  };

  private onMove = (e: PointerEvent) => {
    if (!this.pointer.active || e.pointerId !== this.pointer.id) return;
    this.pointer.x = e.offsetX;
    this.pointer.y = e.offsetY;
  };

  private onUp = (e: PointerEvent) => {
    if (e.pointerId !== this.pointer.id) return;
    this.pointer.active = false;
    this.onUse();
  };
}

/**
 * The frame loop every game runs on. A subclass sets its fields, then calls
 * boot() at the end of its constructor. The loop stops whenever idle() says
 * nothing moves, and wakes up on input, resize or when the tab comes back.
 */
export abstract class Game {
  protected ctx: CanvasRenderingContext2D;
  protected input: Input;
  protected dpr = 1;
  protected W = 0;
  protected H = 0;
  /** First key or touch received. */
  protected started = false;
  private raf = 0;
  private running = false;
  private last = 0;
  private dead = false;
  private paused = false;
  private pausedAt = 0;

  constructor(
    protected canvas: HTMLCanvasElement,
    protected hooks: GameHooks,
  ) {
    this.ctx = canvas.getContext("2d")!;
    this.input = new Input(canvas, this.used);
  }

  protected boot() {
    this.measure();
    this.setup();
    window.addEventListener("resize", this.onResize);
    document.addEventListener("visibilitychange", this.onVisibility);
    this.wake();
  }

  destroy() {
    this.dead = true;
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.input.destroy();
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /** Lay the world out for the current size. */
  protected abstract setup(): void;
  protected abstract update(dt: number): void;
  protected abstract render(): void;
  protected abstract idle(): boolean;
  /** After the canvas changed size. Defaults to laying everything out again. */
  protected resized() {
    this.setup();
  }
  /** The very first key or touch. */
  protected firstInput() {}
  /** Run clocks move forward by `ms` after a pause, so a pause isn't counted. */
  protected shiftTime(_ms: number) {}

  /** Freeze the game (a panel is open): no input, no frames, clocks stopped. */
  setPaused(on: boolean) {
    if (on === this.paused) return;
    this.paused = on;
    if (on) {
      this.input.disable();
      this.pausedAt = performance.now();
      this.running = false;
      cancelAnimationFrame(this.raf);
    } else {
      this.input.enabled = true;
      this.shiftTime(performance.now() - this.pausedAt);
      this.wake();
    }
  }

  protected get skin() {
    return this.hooks.skin?.();
  }

  /** Coins won during this run. Fractions pile up until they make a whole coin. */
  protected earned = 0;
  private bank = 0;
  protected earn(coins: number, why: string) {
    if (coins <= 0) return;
    this.bank += coins;
    const whole = Math.floor(this.bank + 1e-9);
    if (whole < 1) return;
    this.bank -= whole;
    this.earned += whole;
    this.hooks.onEarn?.(whole, why);
  }

  private used = () => {
    if (!this.started) {
      this.started = true;
      this.firstInput();
      this.hooks.onFirstInput?.();
    }
    this.wake();
  };

  protected measure() {
    const rect = this.canvas.getBoundingClientRect();
    this.W = Math.max(1, rect.width);
    this.H = Math.max(1, rect.height);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.W * this.dpr);
    this.canvas.height = Math.round(this.H * this.dpr);
  }

  protected wake() {
    if (this.running || this.dead || this.paused || document.hidden) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private frame = (now: number) => {
    if (!this.running) return;
    const dt = Math.min(1 / 30, (now - this.last) / 1000);
    this.last = now;
    this.update(dt);
    this.render();
    if (this.idle()) {
      this.running = false;
      return;
    }
    this.raf = requestAnimationFrame(this.frame);
  };

  private onResize = () => {
    this.measure();
    this.resized();
    this.render();
    this.wake();
  };

  private onVisibility = () => {
    if (document.hidden) {
      this.running = false;
      cancelAnimationFrame(this.raf);
    } else this.wake();
  };
}
