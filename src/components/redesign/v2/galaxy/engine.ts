// WebGL scene behind the hero: the hero photo dissolves into 22,180 dots —
// one per model in the Wheeloh catalogue — which then fly into the real 2D
// layout of the semantic search index, seen as a tilted galaxy.
//
// Framework-free on purpose: React only feeds it scroll progress and reads
// projected positions back for the HTML labels.
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Matrix4,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from "three";
import { CATEGORY_COLORS, type GalaxyPoints } from "./data";

const VERT = /* glsl */ `
uniform float uAssemble;
uniform float uScan;
uniform float uTint;
uniform float uDim;
uniform float uTime;
uniform float uDpr;
uniform float uCell;
uniform float uGalaxySize;

attribute vec2 aPhoto;
attribute vec3 aPhotoColor;
attribute float aLuma;
attribute vec3 aCatColor;
attribute float aCatAlpha;
attribute float aRand;
attribute float aHi;

varying vec3 vColor;
varying float vAlpha;
varying float vSoft;

void main() {
  float t = clamp((uAssemble - aRand * 0.45) / 0.55, 0.0, 1.0);
  float e = t * t * (3.0 - 2.0 * t);

  vec2 ndcPhoto = vec2(aPhoto.x * 2.0 - 1.0, 1.0 - aPhoto.y * 2.0);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec4 clip = projectionMatrix * mv;
  vec2 ndcGal = clip.xy / max(clip.w, 0.0001);

  // Curved, slightly chaotic flight between the two layouts.
  float arc = sin(e * 3.14159265);
  vec2 dir = ndcGal - ndcPhoto;
  vec2 perp = normalize(vec2(-dir.y, dir.x) + 0.00001);
  vec2 ndc = mix(ndcPhoto, ndcGal, e)
    + perp * arc * (aRand - 0.5) * 0.9
    + vec2(sin(aRand * 91.0), cos(aRand * 57.0)) * arc * 0.12;
  gl_Position = vec4(ndc, 0.0, 1.0);

  // Halftone dots: brighter pixels get bigger dots.
  float photoSize = uCell * (0.32 + 0.68 * sqrt(aLuma)) * uDpr;
  float twinkle = 1.0 + 0.2 * sin(uTime * (0.5 + aRand * 1.5) + aRand * 40.0);
  float galSize = uGalaxySize * uDpr / max(-mv.z, 0.1) * twinkle * (1.0 + aHi * 2.6);
  galSize = min(galSize, 16.0 * uDpr);
  gl_PointSize = max(mix(photoSize, galSize, e), 0.0);

  vec3 base = vec3(0.82, 0.87, 1.0) * 0.8;
  vec3 gal = mix(base, aCatColor, uTint);
  gal = mix(gal, vec3(1.0), aHi * 0.9);
  float galA = mix(0.9, aCatAlpha, uTint) * (1.0 - uDim * 0.72 * (1.0 - aHi));

  // Scan line sweeping down the photo, leaving dots behind it.
  float scanY = uScan * 1.1;
  float scanA = clamp((scanY - aPhoto.y) / 0.1, 0.0, 1.0);
  float front = clamp(1.0 - abs(scanY - 0.05 - aPhoto.y) / 0.05, 0.0, 1.0) * step(uScan, 0.999);
  vec3 photo = aPhotoColor * (1.08 + front * 1.6);

  vColor = mix(photo, gal, e);
  vAlpha = mix(scanA, galA, e);
  vSoft = mix(0.14, 0.5, e);
}
`;

const FRAG = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
varying float vSoft;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = (1.0 - smoothstep(0.5 - vSoft, 0.5, d)) * vAlpha;
  if (a < 0.004) discard;
  gl_FragColor = vec4(vColor * a, 1.0);
}
`;

export interface EngineState {
  scan: number; // 0..1 dots revealed top → bottom
  assemble: number; // 0..1 photo → galaxy
  tint: number; // 0..1 neutral → category colours
  yaw: number; // radians, scroll-driven orbit
  focus: number; // 0..1 dolly toward the focus point
  dim: number; // 0..1 dim everything that is not highlighted
}

export interface PhotoSource {
  img: HTMLImageElement;
  /** CSS object-position of the <img>, as fractions. */
  objectPosition: [number, number];
  /** Where the identified car sits in the image (fractions) — its dot comes from there. */
  focusUV: [number, number];
}

const R = 5; // galaxy radius in world units
const ELEVATION = 0.66; // camera angle above the disk (rad)

function hash(n: number) {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

export class GalaxyEngine {
  readonly canvas: HTMLCanvasElement;
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(38, 1, 0.1, 200);
  private geometry = new BufferGeometry();
  private material: ShaderMaterial;
  private points: Points;
  private count = 0;
  private world: Float32Array = new Float32Array(0);
  private layoutUV: Float32Array = new Float32Array(0);
  private hi: Float32Array = new Float32Array(0);
  private photo: PhotoSource | null = null;
  private bitmap: ImageBitmap | null = null;
  private raf = 0;
  private active = false;
  private last = 0;
  private time = 0;
  private driftTime = 0;
  private width = 1;
  private height = 1;
  private dpr = 1;
  private reduced: boolean;
  private pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  private focusIndex = -1;
  private focusWorld = new Vector3();
  private focusSmooth = 0;
  private target = new Vector3();
  private vp = new Matrix4();
  private state: EngineState = { scan: 0, assemble: 0, tint: 0, yaw: 0, focus: 0, dim: 0 };
  private dimSmooth = 0;
  private dimTarget = 0;
  onFrame?: () => void;

  constructor(canvas: HTMLCanvasElement, { reduced = false } = {}) {
    this.canvas = canvas;
    this.reduced = reduced;
    this.renderer = new WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
    this.renderer.setClearColor(0x09090b, 1);
    this.material = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uAssemble: { value: 0 },
        uScan: { value: 0 },
        uTint: { value: 0 },
        uDim: { value: 0 },
        uTime: { value: 0 },
        uDpr: { value: 1 },
        uCell: { value: 6 },
        uGalaxySize: { value: 30 },
      },
    });
    this.points = new Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.scene.add(this.points);
    this.resize();
  }

  /** Feed the catalogue layout. */
  setPoints(data: GalaxyPoints, focusIndex: number) {
    const n = data.count;
    this.count = n;
    this.focusIndex = focusIndex;
    this.world = new Float32Array(n * 3);
    this.layoutUV = new Float32Array(n * 2);
    this.hi = new Float32Array(n);
    const rand = new Float32Array(n);
    const catColor = new Float32Array(n * 3);
    const catAlpha = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const u = data.x[i] / 65535 - 0.5;
      const v = data.y[i] / 65535 - 0.5;
      // Small horizontal jitter so stacked near-duplicates read as clusters.
      const X = u * 2 * R + (hash(i * 0.37 + 2.1) - 0.5) * 0.08;
      const Z = -v * 2 * R + (hash(i * 0.73 + 5.3) - 0.5) * 0.08;
      const r = Math.hypot(X, Z) / R;
      const g = (hash(i + 1) + hash(i + 7.3) + hash(i + 3.1) - 1.5) * 0.26;
      const Y = g * (1 - 0.55 * Math.min(r, 1)) + 0.22 * Math.sin(X * 0.55) * Math.cos(Z * 0.45);
      this.world[i * 3] = X;
      this.world[i * 3 + 1] = Y;
      this.world[i * 3 + 2] = Z;
      this.layoutUV[i * 2] = u + 0.5;
      this.layoutUV[i * 2 + 1] = 0.5 - v;
      rand[i] = hash(i * 1.618 + 0.5);
      const c = data.cat[i];
      const col = CATEGORY_COLORS[c] ?? CATEGORY_COLORS[4];
      const boost = c === 4 ? 0.72 : 1.05;
      catColor[i * 3] = col[0] * boost;
      catColor[i * 3 + 1] = col[1] * boost;
      catColor[i * 3 + 2] = col[2] * boost;
      catAlpha[i] = c === 4 ? 0.7 : 1;
    }
    if (focusIndex >= 0) this.focusWorld.fromArray(this.world, focusIndex * 3);
    this.geometry.setAttribute("position", new BufferAttribute(this.world, 3));
    this.geometry.setAttribute("aRand", new BufferAttribute(rand, 1));
    this.geometry.setAttribute("aCatColor", new BufferAttribute(catColor, 3));
    this.geometry.setAttribute("aCatAlpha", new BufferAttribute(catAlpha, 1));
    this.geometry.setAttribute("aHi", new BufferAttribute(this.hi, 1));
    this.geometry.setAttribute("aPhoto", new BufferAttribute(new Float32Array(n * 2), 2));
    this.geometry.setAttribute("aPhotoColor", new BufferAttribute(new Float32Array(n * 3).fill(0.85), 3));
    this.geometry.setAttribute("aLuma", new BufferAttribute(new Float32Array(n).fill(0.6), 1));
    this.layoutPhoto();
  }

  setPhoto(source: PhotoSource) {
    this.photo = source;
    this.bitmap = null;
    this.layoutPhoto();
    // <img srcset> reports density-corrected natural sizes, while drawImage()
    // reads real pixels — sample from a bitmap so both agree.
    if (typeof createImageBitmap === "function" && source.img.complete && source.img.naturalWidth) {
      createImageBitmap(source.img)
        .then((bmp) => {
          if (this.photo !== source) return bmp.close();
          this.bitmap = bmp;
          this.layoutPhoto();
        })
        .catch(() => {});
    }
  }

  /**
   * Lays the dots out as a halftone of the visible part of the photo (same
   * cover crop as the full-bleed <img>), and pairs each grid cell with a car
   * so the flight from photo to galaxy stays coherent left-to-right.
   */
  private layoutPhoto() {
    const n = this.count;
    if (!n) return;
    const aspect = this.width / this.height;
    const cols = Math.max(8, Math.round(Math.sqrt(n * aspect)));
    const rows = Math.ceil(n / cols);
    const cells = cols * rows;
    // Drop the surplus cells at random so the grid has no ragged last row.
    const order = new Uint32Array(cells);
    for (let i = 0; i < cells; i++) order[i] = i;
    for (let i = cells - 1; i > 0; i--) {
      const j = Math.floor(hash(i * 3.7 + 11) * (i + 1));
      const t = order[i];
      order[i] = order[j];
      order[j] = t;
    }
    const keep = Array.from(order.subarray(0, n));

    // Strip pairing: same number of strips over photo-x and galaxy-x,
    // each strip sorted top → bottom, then zipped together.
    const strips = Math.max(16, Math.round(cols / 3));
    const cars = Array.from({ length: n }, (_, i) => i);
    cars.sort((a, b) => this.layoutUV[a * 2] - this.layoutUV[b * 2]);
    keep.sort((a, b) => (a % cols) - (b % cols));
    const pairCell = new Uint32Array(n);
    const per = n / strips;
    for (let s = 0; s < strips; s++) {
      const from = Math.round(s * per);
      const to = Math.round((s + 1) * per);
      const cs = cars.slice(from, to).sort((a, b) => this.layoutUV[a * 2 + 1] - this.layoutUV[b * 2 + 1]);
      const ks = keep.slice(from, to).sort((a, b) => Math.floor(a / cols) - Math.floor(b / cols));
      for (let k = 0; k < cs.length; k++) pairCell[cs[k]] = ks[k];
    }

    // Visible crop of the image (object-fit: cover + object-position).
    let crop = { sx: 0, sy: 0, sw: 1, sh: 1 };
    const bmp = this.bitmap;
    const ready = !!bmp && !!this.photo;
    if (ready && bmp) {
      const iw = bmp.width;
      const ih = bmp.height;
      const scale = Math.max(this.width / iw, this.height / ih);
      const sw = this.width / scale / iw;
      const sh = this.height / scale / ih;
      const [px, py] = this.photo!.objectPosition;
      crop = { sx: (1 - sw) * px, sy: (1 - sh) * py, sw, sh };

      // The identified car's dot starts on the car itself.
      if (this.focusIndex >= 0) {
        const [fu, fv] = this.photo!.focusUV;
        const cu = Math.min(0.999, Math.max(0, (fu - crop.sx) / crop.sw));
        const cv = Math.min(0.999, Math.max(0, (fv - crop.sy) / crop.sh));
        const target = Math.floor(cv * rows) * cols + Math.floor(cu * cols);
        let owner = -1;
        for (let i = 0; i < n; i++) if (pairCell[i] === target) owner = i;
        if (owner >= 0) {
          pairCell[owner] = pairCell[this.focusIndex];
          pairCell[this.focusIndex] = target;
        }
      }
    }

    const aPhoto = this.geometry.getAttribute("aPhoto") as BufferAttribute;
    for (let i = 0; i < n; i++) {
      const cell = pairCell[i];
      (aPhoto.array as Float32Array)[i * 2] = ((cell % cols) + 0.5) / cols;
      (aPhoto.array as Float32Array)[i * 2 + 1] = (Math.floor(cell / cols) + 0.5) / rows;
    }
    aPhoto.needsUpdate = true;
    this.material.uniforms.uCell.value = this.width / cols;

    if (!ready || !bmp) return;
    try {
      const c = document.createElement("canvas");
      c.width = cols;
      c.height = rows;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      const iw = bmp.width;
      const ih = bmp.height;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bmp, crop.sx * iw, crop.sy * ih, crop.sw * iw, crop.sh * ih, 0, 0, cols, rows);
      const px = ctx.getImageData(0, 0, cols, rows).data;
      const color = this.geometry.getAttribute("aPhotoColor") as BufferAttribute;
      const luma = this.geometry.getAttribute("aLuma") as BufferAttribute;
      for (let i = 0; i < n; i++) {
        const cell = pairCell[i];
        const r = px[cell * 4] / 255;
        const g = px[cell * 4 + 1] / 255;
        const b = px[cell * 4 + 2] / 255;
        (color.array as Float32Array)[i * 3] = r;
        (color.array as Float32Array)[i * 3 + 1] = g;
        (color.array as Float32Array)[i * 3 + 2] = b;
        (luma.array as Float32Array)[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      }
      color.needsUpdate = true;
      luma.needsUpdate = true;
    } catch {
      // Tainted canvas or decode issue: keep neutral dots.
    }
  }

  setState(next: Partial<EngineState>) {
    Object.assign(this.state, next);
    // Nothing is visible before the scan starts — skip the redundant draws.
    if (!this.active && (this.state.scan > 0 || this.state.assemble > 0)) this.renderOnce();
  }

  setPointer(nx: number, ny: number) {
    this.pointer.x = nx;
    this.pointer.y = ny;
  }

  /** Highlight a set of cars (search results / hover). `null` clears. */
  setHighlight(indices: number[] | null) {
    if (!this.count) return;
    this.hi.fill(0);
    if (indices) for (const i of indices) if (i >= 0 && i < this.count) this.hi[i] = 1;
    (this.geometry.getAttribute("aHi") as BufferAttribute).needsUpdate = true;
    this.dimTarget = indices && indices.length ? 1 : 0;
    if (!this.active) this.renderOnce();
  }

  /** Point the camera dolly at another car (search). */
  setFocusIndex(i: number) {
    if (i < 0 || i >= this.count) return;
    this.focusWorld.fromArray(this.world, i * 3);
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.width = w;
    this.height = h;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.material.uniforms.uDpr.value = this.dpr;
    // Bigger points on small screens so the galaxy keeps its density.
    this.material.uniforms.uGalaxySize.value = (w < 640 ? 36 : 40) * (this.dpr > 1.5 ? 0.85 : 1);
    this.layoutPhoto();
    if (!this.active) this.renderOnce();
  }

  start() {
    if (this.active) return;
    this.active = true;
    this.last = performance.now();
    const loop = (now: number) => {
      if (!this.active) return;
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.time += dt;
      this.frame(dt);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.active = false;
    cancelAnimationFrame(this.raf);
  }

  private renderOnce() {
    this.frame(0);
  }

  private frame(dt: number) {
    const s = this.state;
    const u = this.material.uniforms;
    u.uAssemble.value = s.assemble;
    u.uScan.value = s.scan;
    u.uTint.value = s.tint;
    u.uTime.value = this.reduced ? 0 : this.time;
    const k = 1 - Math.exp(-dt * 5);
    this.dimSmooth += (this.dimTarget * 1 - this.dimSmooth) * (dt ? k : 1);
    u.uDim.value = Math.max(this.dimSmooth, s.dim);

    // Camera: orbit + pointer parallax + dolly toward the focus car.
    this.pointer.sx += (this.pointer.x - this.pointer.sx) * (dt ? 1 - Math.exp(-dt * 3) : 1);
    this.pointer.sy += (this.pointer.y - this.pointer.sy) * (dt ? 1 - Math.exp(-dt * 3) : 1);
    this.focusSmooth = this.reduced ? s.focus : this.focusSmooth + (s.focus - this.focusSmooth) * (dt ? 1 - Math.exp(-dt * 4) : 1);
    const f = this.focusSmooth * this.focusSmooth * (3 - 2 * this.focusSmooth);
    const aspect = this.width / this.height;
    const hHalf = Math.atan(Math.tan((38 * Math.PI) / 360) * aspect);
    const fill = aspect > 1 ? 0.78 : 1.22;
    const base = Math.max(8.5, (R * 0.92) / (Math.tan(hHalf) * fill));
    const dist = base + (3.4 - base) * f;
    // Slow orbit once the galaxy has formed (keeps the photo→galaxy flight aligned).
    if (s.assemble > 0.98) this.driftTime += dt;
    const drift = this.reduced ? 0 : this.driftTime * 0.03;
    const yaw = s.yaw + drift + this.pointer.sx * 0.12;
    // Portrait screens look down more steeply so the disk fills the height.
    const elevation = aspect < 1 ? ELEVATION + 0.32 : ELEVATION;
    const el = elevation + this.pointer.sy * 0.06 - f * 0.12;
    // Aim a little in front of the centre (toward the camera) so the tilted
    // disk sits in the middle of the screen; the offset turns with the orbit.
    const off = R * 0.22;
    this.target.set(Math.sin(yaw) * off, -0.2, Math.cos(yaw) * off).lerp(this.focusWorld, f);
    this.camera.position.set(
      this.target.x + dist * Math.cos(el) * Math.sin(yaw),
      this.target.y + dist * Math.sin(el),
      this.target.z + dist * Math.cos(el) * Math.cos(yaw),
    );
    this.camera.lookAt(this.target);
    this.camera.updateMatrixWorld();
    this.vp.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);

    this.renderer.render(this.scene, this.camera);
    this.onFrame?.();
  }

  /** Screen position (CSS px) of a car once the galaxy has formed. */
  project(i: number) {
    if (i < 0 || i >= this.count) return null;
    const e = this.vp.elements;
    const x = this.world[i * 3];
    const y = this.world[i * 3 + 1];
    const z = this.world[i * 3 + 2];
    const w = e[3] * x + e[7] * y + e[11] * z + e[15];
    if (w <= 0) return null;
    const nx = (e[0] * x + e[4] * y + e[8] * z + e[12]) / w;
    const ny = (e[1] * x + e[5] * y + e[9] * z + e[13]) / w;
    return { x: (nx * 0.5 + 0.5) * this.width, y: (0.5 - ny * 0.5) * this.height, depth: w };
  }

  /** The `k` closest cars to car `i` in the catalogue layout. */
  nearest(i: number, k: number) {
    if (i < 0 || i >= this.count) return [];
    const x = this.world[i * 3];
    const z = this.world[i * 3 + 2];
    const d = new Float32Array(this.count);
    const idx = new Uint32Array(this.count);
    for (let j = 0; j < this.count; j++) {
      d[j] = (this.world[j * 3] - x) ** 2 + (this.world[j * 3 + 2] - z) ** 2;
      idx[j] = j;
    }
    return Array.from(idx)
      .sort((a, b) => d[a] - d[b])
      .slice(0, k);
  }

  /** Nearest car under the pointer, or -1. */
  pick(cssX: number, cssY: number, radius = 16) {
    const e = this.vp.elements;
    let best = -1;
    let bestD = radius * radius;
    const W = this.width * 0.5;
    const H = this.height * 0.5;
    for (let i = 0; i < this.count; i++) {
      const x = this.world[i * 3];
      const y = this.world[i * 3 + 1];
      const z = this.world[i * 3 + 2];
      const w = e[3] * x + e[7] * y + e[11] * z + e[15];
      if (w <= 0) continue;
      const sx = ((e[0] * x + e[4] * y + e[8] * z + e[12]) / w) * W + W;
      const sy = H - ((e[1] * x + e[5] * y + e[9] * z + e[13]) / w) * H;
      const d = (sx - cssX) ** 2 + (sy - cssY) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  }

  dispose() {
    this.stop();
    this.bitmap?.close();
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}
