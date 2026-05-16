"use client";

// On-device object detection (COCO-SSD via TensorFlow.js).
// Sve se izvršava u pregledniku na uređaju — slika ne napušta telefon
// dok korisnik ne snimi.

import type {
  ObjectDetection,
  DetectedObject,
} from "@tensorflow-models/coco-ssd";

export type { DetectedObject };

let modelPromise: Promise<ObjectDetection> | null = null;

/** Lazy, singleton model load (lite mobilenet = brže na mobitelu). */
export function loadDetector(): Promise<ObjectDetection> {
  if (!modelPromise) {
    modelPromise = (async () => {
      const tf = await import("@tensorflow/tfjs");
      await tf.ready();
      const cocoSsd = await import("@tensorflow-models/coco-ssd");
      return cocoSsd.load({ base: "lite_mobilenet_v2" });
    })();
  }
  return modelPromise;
}

// COCO klase → hrvatski, prijateljski nazivi (samo relevantne za otpad).
const HR: Record<string, string> = {
  bottle: "boca",
  cup: "čaša",
  "wine glass": "čaša",
  bowl: "zdjela",
  book: "knjiga",
  "cell phone": "mobitel",
  laptop: "laptop",
  keyboard: "tipkovnica",
  mouse: "miš",
  remote: "daljinski",
  scissors: "škare",
  "toothbrush": "četkica",
  "hair drier": "fen",
  vase: "vaza",
  clock: "sat",
  banana: "banana",
  apple: "jabuka",
  orange: "naranča",
  sandwich: "sendvič",
  "tin can": "limenka",
  can: "limenka",
  "potted plant": "biljka",
  backpack: "ruksak",
  handbag: "torba",
  umbrella: "kišobran",
  "teddy bear": "plišanac",
};

export function labelHr(cls: string): string {
  return HR[cls] ?? cls;
}

/**
 * Odabire "glavni" predmet: najbliži sredini kadra, uz bonus na veličinu.
 * Vraća i je li scena nejasna (više sličnih kandidata).
 */
export function pickPrimary(
  objs: DetectedObject[],
  vw: number,
  vh: number,
): { primary: DetectedObject | null; ambiguous: boolean } {
  const good = objs.filter((o) => o.score >= 0.5);
  if (good.length === 0) return { primary: null, ambiguous: false };

  const cx = vw / 2;
  const cy = vh / 2;
  const maxD = Math.hypot(cx, cy);

  const scored = good.map((o) => {
    const [x, y, w, h] = o.bbox;
    const ox = x + w / 2;
    const oy = y + h / 2;
    const dist = Math.hypot(ox - cx, oy - cy) / maxD; // 0 = u sredini
    const area = (w * h) / (vw * vh); // 0..1
    // Bliže sredini i veće = bolji kandidat.
    const rank = (1 - dist) * 0.7 + Math.min(area * 2, 1) * 0.3;
    return { o, rank };
  });
  scored.sort((a, b) => b.rank - a.rank);

  const top = scored[0];
  const second = scored[1];
  const ambiguous =
    !!second &&
    second.rank > 0.45 &&
    top.rank - second.rank < 0.12 &&
    second.o.class !== top.o.class;

  return { primary: top.o, ambiguous };
}
