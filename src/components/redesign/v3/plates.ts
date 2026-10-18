// Real photos (AI-retouched, fictitious registrations) with their plates
// erased by the Wheeloh V3 engine (plate_mask, engine m4r3, ink model pass 7:
// the model the app ships). Box: the detector's plate box, as fractions of
// the exported 4:5 crop (x, y, w, h); aspect: the plate box's width / height.
export interface PlateDemo {
  id: string;
  car: string;
  box: [number, number, number, number];
  aspect: number;
}

export const PLATE_DEMOS: PlateDemo[] = [
  { id: "lambo", car: "Lamborghini Huracán EVO", box: [0.4976, 0.4403, 0.278, 0.1195], aspect: 1.861 },
  { id: "gt3", car: "Porsche 911 GT3 RS", box: [0.6877, 0.4556, 0.1789, 0.0882], aspect: 1.623 },
];

export const PLATE_PHOTO = { width: 960, height: 1200 };
