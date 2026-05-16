export type Material =
  | "PET"
  | "HDPE"
  | "LDPE"
  | "PVC"
  | "glass"
  | "paper"
  | "aluminium"
  | "tetra_pak"
  | "mixed-plastic";

export type Component = {
  material: string;
  weight_pct: number;
  description?: string;
};

export type Tier = "A" | "B" | "C" | "D" | "F";

export type BreakdownRow = {
  material: string;
  label: string;
  weight_pct: number;
  recycle_rate: number;
};

export type ScoreResult = {
  tier: Tier;
  numeric: number;
  problemComponents: string[];
  decompositionYears: number;
  breakdown: BreakdownRow[];
};

export type DataSource = "off" | "ai" | "estimate";

/** On-device (COCO-SSD) detekcija proslijeđena Geminiju kao pomoć. */
export type DetectionHint = {
  cls: string; // COCO klasa (engleski)
  label: string; // hrvatski naziv
  score: number; // 0–1
  box: [number, number, number, number]; // ymin,xmin,ymax,xmax (0–1000)
};

import type { BinKey } from "./bins";

export type ScanResult = {
  id: string;
  barcode: string | null;
  name: string;
  brand: string | null;
  category: string | null;
  imageUrl: string | null;
  userImage: string | null;
  components: Component[];
  city: string;
  source: DataSource;
  confidence: number; // 0–1
  bin: BinKey;
  scannedAt: number;
  recycled?: boolean;
  dirty?: boolean;
  // AI procjena (samo za "ai" izvor)
  soiled?: boolean;
  recycleReady?: boolean;
  aiWarning?: string | null;
  prepSteps?: string[];
  reusable?: boolean;
  reuseTip?: string | null;
  hazardous?: boolean;
  depositReturn?: boolean;
} & ScoreResult;
