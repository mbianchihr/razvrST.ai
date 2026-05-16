import type { ScanResult } from "./types";
import type { BinKey } from "./bins";

export type FalseFriend = {
  title: string;
  detail: string;
  /** Kamo zapravo ide — nikad u reciklabilni spremnik. */
  bin: BinKey;
};

/**
 * "Lažni prijatelji" — proizvodi koje ljudi često misle da se recikliraju,
 * a u Splitu idu u miješani otpad. Heuristika po nazivu/kategoriji/materijalu.
 */
export function falseFriend(scan: ScanResult): FalseFriend | null {
  const name = `${scan.name} ${scan.category ?? ""} ${scan.brand ?? ""}`.toLowerCase();
  const mats = (
    scan.components.map((c) => c.material).join(" ") +
    " " +
    scan.breakdown.map((b) => `${b.material} ${b.label}`).join(" ")
  ).toLowerCase();
  const text = `${name} ${mats}`;

  if (/tetra|tetrapak|tetra[ _]?pak|uht/.test(text) || /tetra_pak/.test(mats))
    return {
      title: "Tetrapak nije karton",
      detail:
        "Izgleda kao karton, ali ima slojeve plastike i aluminija. Split ga ne reciklira — ide u miješani otpad, ne u plavi ili žuti spremnik.",
      bin: "mijesano",
    };

  if (/(čaš|casa|cup|kava|coffee)/.test(name) && /(papir|paper|karton)/.test(text))
    return {
      title: "Papirnata čaša nije papir",
      detail:
        "Iznutra je obložena tankim slojem plastike (PE) pa se ne reciklira kao papir. Ide u miješani otpad.",
      bin: "mijesano",
    };

  if (/(račun|racun|blok|receipt|termaln)/.test(name))
    return {
      title: "Računi nisu papir za reciklažu",
      detail:
        "Termalni papir ima kemijske premaze i ne ide u plavi spremnik. Ide u miješani otpad.",
      bin: "mijesano",
    };

  if (
    /(papir|paper|karton|carton|case|kutij|omot|vreć|vrec|čaš|tanjur)/.test(name) &&
    /(plast|laminir|folij|\bpe\b|\bpp\b|\bpet\b|metaliz|alu)/.test(text)
  )
    return {
      title: "Papir s plastikom se ne reciklira",
      detail:
        "Papirnata ambalaža s plastičnim slojem, folijom ili prozorčićem je kombinirani materijal koji se ne može razdvojiti. Ide u miješani otpad.",
      bin: "mijesano",
    };

  if (/(stiropor|styrofoam|polistiren|\beps\b)/.test(text))
    return {
      title: "Stiropor se ne reciklira",
      detail:
        "Ekspandirani polistiren NE ide u žuti spremnik u Splitu. Manje količine idu u miješani otpad; veće (npr. ambalaža od uređaja) nosi u reciklažno dvorište.",
      bin: "dvoriste",
    };

  if (/pizz/.test(name) && /(kutij|box|karton)/.test(name))
    return {
      title: "Masna kutija od pizze",
      detail:
        "Zamašćeni karton se ne reciklira. Čisti gornji dio može u papir, a masni donji dio ide u miješani otpad.",
      bin: "mijesano",
    };

  return null;
}
