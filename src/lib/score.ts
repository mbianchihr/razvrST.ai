import type { BreakdownRow, Component, ScoreResult, Tier } from "./types";

export const MATERIAL_RECYCLE_RATES_BY_CITY = {
  split: {
    PET: 0.78,
    HDPE: 0.65,
    LDPE: 0.2,
    PVC: 0.0,
    glass: 0.85,
    paper: 0.7,
    aluminium: 0.55,
    tetra_pak: 0.0, // Split ne reciklira tetrapak
    "mixed-plastic": 0.1,
  },
  zagreb: {
    PET: 0.82,
    HDPE: 0.7,
    LDPE: 0.25,
    PVC: 0.0,
    glass: 0.88,
    paper: 0.75,
    aluminium: 0.6,
    tetra_pak: 0.45,
    "mixed-plastic": 0.15,
  },
} as const;

export const DECOMPOSITION_YEARS: Record<string, number> = {
  PET: 450,
  HDPE: 100,
  LDPE: 1000,
  PVC: 1000,
  glass: 1000000,
  paper: 0.5,
  aluminium: 200,
  tetra_pak: 25,
  "mixed-plastic": 500,
};

export const MATERIAL_LABEL_HR: Record<string, string> = {
  PET: "PET plastika",
  HDPE: "HDPE plastika",
  LDPE: "LDPE folija",
  PVC: "PVC",
  glass: "staklo",
  paper: "papir / karton",
  aluminium: "aluminij",
  tetra_pak: "tetrapak",
  "mixed-plastic": "miješana plastika",
};

export const CITY_LABEL: Record<string, string> = {
  split: "Splitu",
  zagreb: "Zagrebu",
};

export type City = keyof typeof MATERIAL_RECYCLE_RATES_BY_CITY;

export function computeScore(
  components: Component[],
  city: City = "split",
): ScoreResult {
  const rates = MATERIAL_RECYCLE_RATES_BY_CITY[city] as Record<string, number>;

  // Normalise weights so they always sum to 100.
  const totalW =
    components.reduce((s, c) => s + (c.weight_pct || 0), 0) || 1;

  let totalRecycleRate = 0;
  const problemComponents: string[] = [];
  let dominantW = -1;
  let dominantDecomp = 100;
  const breakdown: BreakdownRow[] = [];

  for (const c of components) {
    const w = (c.weight_pct || 0) / totalW; // 0–1 share
    const rate = rates[c.material] ?? 0.05;
    totalRecycleRate += rate * w;
    if (rate < 0.3) problemComponents.push(c.material);
    // Decomposition of the dominant (heaviest) material — product-specific.
    if (w > dominantW) {
      dominantW = w;
      dominantDecomp = DECOMPOSITION_YEARS[c.material] ?? 100;
    }
    breakdown.push({
      material: c.material,
      label: MATERIAL_LABEL_HR[c.material] ?? c.material,
      weight_pct: Math.round(w * 100),
      recycle_rate: rate,
    });
  }

  const numeric = Math.round(totalRecycleRate * 100);
  const tier: Tier =
    numeric >= 80
      ? "A"
      : numeric >= 65
        ? "B"
        : numeric >= 50
          ? "C"
          : numeric >= 30
            ? "D"
            : "F";

  return {
    tier,
    numeric,
    problemComponents: Array.from(new Set(problemComponents)),
    decompositionYears: dominantDecomp,
    breakdown: breakdown.sort((a, b) => b.weight_pct - a.weight_pct),
  };
}
