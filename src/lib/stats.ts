// Sources: nacelnik.hr (HR 2024: 49% odvojeno, 37% reciklirano),
// EU Okvirna direktiva o otpadu (cilj 55% do 2025.).
// Split/SDŽ je među najnižima u HR — vrijednost je konzervativna procjena.
export const STATS = {
  splitSeparatedPct: 24, // procjena za Split
  hrSeparatedPct: 49,
  hrRecycledPct: 37,
  euTarget2025Pct: 55,
  euTarget2030Pct: 60,
};

// Pretpostavljena masa ambalaže po proizvodu (kg) za procjenu doprinosa.
export const AVG_PACKAGING_KG = 0.03;

/** Koliko si "spasio" ako ovaj proizvod ispravno razvrstaš (grami). */
export function divertedGrams(recyclePct: number): number {
  return Math.round(AVG_PACKAGING_KG * 1000 * (recyclePct / 100));
}

/** Tvoj osobni prosjek razvrstavanja vs Split. */
export function personalVsSplit(avgScore: number) {
  const delta = avgScore - STATS.splitSeparatedPct;
  return {
    you: avgScore,
    split: STATS.splitSeparatedPct,
    deltaPct: Math.round(delta),
    better: delta > 0,
  };
}
