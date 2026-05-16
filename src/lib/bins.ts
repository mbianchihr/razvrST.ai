export type BinKey =
  | "plastika"
  | "papir"
  | "staklo"
  | "biootpad"
  | "mijesano"
  | "dvoriste";

export type Bin = {
  key: BinKey;
  name: string;
  short: string;
  color: string;
  hint: string;
};

export const BINS: Record<BinKey, Bin> = {
  plastika: {
    key: "plastika",
    name: "Žuti spremnik",
    short: "Plastika i metal",
    color: "#e3a008",
    hint: "Plastična i metalna ambalaža — isprazni i, ako možeš, spljošti.",
  },
  papir: {
    key: "papir",
    name: "Plavi spremnik",
    short: "Papir i karton",
    color: "#2563eb",
    hint: "Čist i suh papir/karton. Masni ili mokri papir ide u miješani.",
  },
  staklo: {
    key: "staklo",
    name: "Zeleni spremnik / zeleni otok",
    short: "Staklo",
    color: "#047a55",
    hint: "Staklenke i boce bez čepova. Prozorsko/okno staklo ide u dvorište.",
  },
  biootpad: {
    key: "biootpad",
    name: "Smeđi spremnik",
    short: "Biootpad",
    color: "#7a5a2b",
    hint: "Ostaci hrane i biljni otpad, bez plastičnih vrećica.",
  },
  mijesano: {
    key: "mijesano",
    name: "Spremnik za miješani otpad",
    short: "Miješani komunalni",
    color: "#5d6f66",
    hint: "Ono što se u Splitu trenutačno ne reciklira (npr. tetrapak).",
  },
  dvoriste: {
    key: "dvoriste",
    name: "Reciklažno dvorište",
    short: "Posebni otpad",
    color: "#06b27a",
    hint: "Elektronika, baterije, ulje, boje, tekstil, glomazni otpad.",
  },
};

const MATERIAL_TO_BIN: Record<string, BinKey> = {
  PET: "plastika",
  HDPE: "plastika",
  LDPE: "plastika",
  PVC: "mijesano",
  "mixed-plastic": "plastika",
  aluminium: "plastika",
  paper: "papir",
  glass: "staklo",
  tetra_pak: "mijesano", // Split ne reciklira tetrapak
};

/** Bin for the dominant component, with special-stream overrides. */
export function binFor(
  components: { material: string; weight_pct: number }[],
  category?: string,
): BinKey {
  const c = (category ?? "").toLowerCase();
  if (/elektron|baterij|žarulj|zarulj|uređaj|uredaj|punjač|punjac|kabel/.test(c))
    return "dvoriste";
  if (/tekstil|odjeć|odjec|odjeca|obuć|obuc/.test(c)) return "dvoriste";
  if (/ulje|boja|lak|kemikal|lijek/.test(c)) return "dvoriste";
  if (/hrana|voće|voce|povrć|povrc|organ|biootpad/.test(c)) return "biootpad";

  const dominant = [...components].sort(
    (a, b) => b.weight_pct - a.weight_pct,
  )[0];
  return MATERIAL_TO_BIN[dominant?.material ?? ""] ?? "mijesano";
}
