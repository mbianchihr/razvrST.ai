import type { BinKey } from "./bins";

/**
 * Česte greške koje vode do lošeg razvrstavanja — kontekstualno po
 * spremniku i materijalima.
 */
export function tipsFor(
  bin: BinKey,
  components: { material: string }[],
): string[] {
  const mats = new Set(components.map((c) => c.material));
  const tips: string[] = [];

  // Uvijek vrijedi
  tips.push(
    "Isperi ambalažu od ostataka hrane — prljav sadržaj kontaminira cijelu vreću i sve ide u miješani.",
  );
  tips.push(
    "Ne bacaj u zavezanoj vrećici — u vrećici se ne može razvrstati pa završi kao miješani otpad.",
  );

  if (bin === "papir") {
    tips.push(
      "Prljav ili mastan papir (kutija pizze, ubrus) NE ide u plavi — ide u miješani.",
    );
    tips.push("Ukloni plastične prozore, selotejp i spajalice s papira/kartona.");
    tips.push("Karton rastavi i poravnaj — zauzima manje i lakše se prerađuje.");
  }

  if (bin === "plastika") {
    tips.push("Odvoji čep i foliju — često su drugi materijal od boce.");
    tips.push("Spljošti bocu i vrati čep da zauzme manje prostora.");
    tips.push("Masna plastika (uljne bočice) bez ispiranja ide u miješani.");
  }

  if (bin === "staklo") {
    tips.push("Skini metalne čepove i poklopce — ne idu sa staklom.");
    tips.push(
      "Prozorsko staklo, ogledala, keramika i porculan NE idu u staklo — to je reciklažno dvorište.",
    );
  }

  if (bin === "biootpad") {
    tips.push(
      "Bez plastičnih vrećica u biootpadu — ni 'biorazgradivih' osim ako su certificirane.",
    );
  }

  if (bin === "mijesano") {
    tips.push(
      "Provjeri još jednom — često dio (čep, etiketa, papir) ipak može u odvojeni spremnik.",
    );
  }

  if (bin === "dvoriste") {
    tips.push(
      "Elektronika, baterije, ulja i boje NIKAD ne idu u kućne spremnike — samo reciklažno dvorište.",
    );
  }

  if (mats.has("tetra_pak")) {
    tips.push("Tetrapak u Splitu nema odvojeno prikupljanje — ide u miješani.");
  }

  return tips.slice(0, 5);
}
