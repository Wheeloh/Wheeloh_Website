// Art-directed hero photos (cropped from the app's own marketing shots).
// Boxes and focus points are fractions of the image, used to place the
// detection box and to start the McLaren's dot on the car itself.

export interface HeroPhoto {
  src: string;
  width: number;
  height: number;
  objectPosition: [number, number];
  /** Car bounding box: left, top, right, bottom. */
  box: [number, number, number, number];
  focusUV: [number, number];
}

export const PHOTO_WIDE: HeroPhoto = {
  src: "/media/senna-square.jpg",
  width: 1661,
  height: 1722,
  objectPosition: [0.5, 0.7],
  box: [0.07, 0.4, 0.97, 0.85],
  focusUV: [0.56, 0.66],
};

export const PHOTO_TALL: HeroPhoto = {
  src: "/media/senna-portrait.jpg",
  width: 1860,
  height: 2922,
  objectPosition: [0.5, 0.72],
  box: [0.005, 0.46, 0.94, 0.81],
  focusUV: [0.5, 0.64],
};

/** Below this width the portrait crop is used (matches the <picture> media query). */
export const TALL_QUERY = "(max-width: 639px)";

export const SENNA = {
  name: "McLaren Senna",
  line: "McLaren · Ultimate Series",
  points: 2212,
  specs: ["789 hp", "0–100 in 2.8 s", "1,198 kg"],
};

/** Car box + focus point in element pixels for an object-fit: cover image. */
export function coverBox(photo: HeroPhoto, w: number, h: number) {
  const scale = Math.max(w / photo.width, h / photo.height);
  const dw = photo.width * scale;
  const dh = photo.height * scale;
  const ox = (w - dw) * photo.objectPosition[0];
  const oy = (h - dh) * photo.objectPosition[1];
  const [l, t, r, b] = photo.box;
  const [fu, fv] = photo.focusUV;
  return {
    left: Math.max(6, ox + l * dw),
    top: oy + t * dh,
    right: Math.min(w - 6, ox + r * dw),
    bottom: oy + b * dh,
    originX: ox + fu * dw,
    originY: oy + fv * dh,
  };
}
