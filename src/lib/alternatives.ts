import type { ScanResult } from "./types";

export type Advice = {
  kind: "good" | "swap" | "special";
  title: string;
  detail: string;
};

/** Kontekstualni savjet ovisno o materijalu, ocjeni i kategoriji predmeta. */
export function getAdvice(scan: {
  tier: ScanResult["tier"];
  numeric: number;
  category: string | null;
  components: { material: string; weight_pct: number }[];
  bin: ScanResult["bin"];
}): Advice {
  const cat = (scan.category ?? "").toLowerCase();
  const dominant = [...scan.components].sort(
    (a, b) => b.weight_pct - a.weight_pct,
  )[0]?.material;

  // Posebni tokovi — nema "zamjene", nego ispravno zbrinjavanje.
  if (scan.bin === "dvoriste" || /elektron|baterij|ulje|boja|lijek|tekstil|odjeć|obuć/.test(cat)) {
    return {
      kind: "special",
      title: "Ne ide u kantu",
      detail:
        "Ovo se ne baca u spremnik. Odnesi u najbliže reciklažno dvorište — tamo se zbrinjava ispravno i besplatno.",
    };
  }

  // Već dobra ambalaža.
  if (scan.numeric >= 65) {
    return {
      kind: "good",
      title: "Dobar izbor",
      detail:
        "Ova se ambalaža dobro reciklira u Splitu. Isperi je i baci u ispravan spremnik — ne treba ti zamjena.",
    };
  }

  // Slabo — prijedlog ovisno o dominantnom materijalu.
  switch (dominant) {
    case "tetra_pak":
      return {
        kind: "swap",
        title: "Izbjegni tetrapak u Splitu",
        detail:
          "Split trenutačno ne reciklira tetrapak — završi u miješanom. Uzmi isti proizvod u staklenoj ili PET ambalaži.",
      };
    case "PET":
    case "HDPE":
    case "LDPE":
    case "mixed-plastic":
      return {
        kind: "swap",
        title: "Bolja zamjena: staklo ili povratna",
        detail:
          "Plastična ambalaža slabo prolazi. Isti proizvod u staklu (≈85% reciklira se u Splitu) ili u povratnoj boci ima puno manji otpadni otisak.",
      };
    case "PVC":
      return {
        kind: "swap",
        title: "Izbjegni PVC",
        detail:
          "PVC se praktički ne reciklira. Potraži varijantu u PET-u, staklu ili papiru.",
      };
    case "aluminium":
      return {
        kind: "swap",
        title: "Razmisli o povratnoj",
        detail:
          "Limenka je djelomično ok, ali povratna staklena boca istog pića ima manji otisak po litri.",
      };
    default:
      return {
        kind: "swap",
        title: "Postoji bolja opcija",
        detail:
          "Ova ambalaža slabo se reciklira u Splitu. Potraži isti proizvod u staklu, papiru ili povratnoj ambalaži.",
      };
  }
}
