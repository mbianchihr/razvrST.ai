// Mjesta za odvajanje otpada u Splitu i okolici (područje Čistoće Split).
// Reciklažna dvorišta: adrese, telefoni i radno vrijeme prema službenim
// izvorima. Mobilna dvorišta i zeleni otoci: lokacije po gradskim kotarevima/
// kvartovima — KOORDINATE SU PRIBLIŽNE (approx) jer Grad/Čistoća točne GPS
// točke pojedinih spremnika objavljuju samo na interaktivnim kartama.
// Izvori: cistoca-split.hr/usluge/reciklazno-dvoriste,
// otpadnijesmece.split.hr/gdje-odvajati, dalmatinskiportal.hr.

export type SiteKind =
  | "dvoriste"
  | "mobilno"
  | "otok"
  | "gradevinski"
  | "povrat";

export type WasteSite = {
  id: string;
  kind: SiteKind;
  name: string;
  address: string;
  hours?: string;
  phone?: string;
  fractions: string[];
  lat: number;
  lng: number;
  /** Koordinate približne (kvart/kotar, ne točna lokacija spremnika). */
  approx?: boolean;
};

/** Naziv / boja / kratki opis po vrsti — za markere i filtere. */
export const SITE_META: Record<
  SiteKind,
  { label: string; short: string; color: string }
> = {
  dvoriste: {
    label: "Reciklažno dvorište",
    short: "49 vrsta otpada · djelatnik",
    color: "#06b27a",
  },
  mobilno: {
    label: "Mobilno reciklažno dvorište",
    short: "Povremeno po kotaru",
    color: "#0a7d6e",
  },
  otok: {
    label: "Zeleni otok",
    short: "Papir · staklo · plastika · tetrapak",
    color: "#2563eb",
  },
  gradevinski: {
    label: "Građevinski otpad",
    short: "Šuta, drvo, metal",
    color: "#7a5a2b",
  },
  povrat: {
    label: "Povrat ambalaže",
    short: "Aparat · povratna naknada 0,10 €",
    color: "#e3a008",
  },
};

const MOB_FRACTIONS = [
  "staklo",
  "plastika",
  "papir",
  "metal",
  "tetrapak",
  "tekstil",
  "baterije",
  "lijekovi",
];
const OTOK_FRACTIONS = ["papir", "staklo", "plastika", "tetrapak"];

export const SITES: WasteSite[] = [
  // ── Reciklažna dvorišta (stalna) ─────────────────────────────
  {
    id: "rd-karepovac",
    kind: "dvoriste",
    name: "Reciklažno dvorište Karepovac",
    address: "Dračevac 122, Split",
    hours: "Pon–Pet 7–14 · Sub 7–12",
    phone: "021 374 363",
    fractions: ["49 vrsta otpada", "glomazni", "EE-otpad", "ulje", "boje"],
    lat: 43.5166,
    lng: 16.471,
  },
  {
    id: "rd-orisac",
    kind: "dvoriste",
    name: "Reciklažno dvorište Orišac",
    address: "Put Orišca 7c, Split",
    hours: "Pon/Sri/Pet 11–18 · Uto/Čet 8–15 · Sub 8–13",
    phone: "099 5435 868",
    fractions: ["papir", "plastika", "staklo", "metal", "EE-otpad", "tekstil"],
    lat: 43.5121,
    lng: 16.4798,
  },
  {
    id: "rd-pujanke",
    kind: "dvoriste",
    name: "Reciklažno dvorište Pujanke",
    address: "Pujanke 67b, Split",
    hours: "Pon/Sri/Pet 8–15 · Uto/Čet 11–18 · Sub 8–13",
    phone: "099 3435 382",
    fractions: ["papir", "plastika", "staklo", "metal", "EE-otpad", "tekstil"],
    lat: 43.5169,
    lng: 16.4492,
  },
  {
    id: "rd-kopilica",
    kind: "dvoriste",
    name: "Reciklažno dvorište Kopilica",
    address: "Kopilica 52, Split",
    hours: "Pon/Sri/Pet 8–15 · Uto/Čet 11–18 · Sub 8–13",
    phone: "099 3233 153",
    fractions: ["papir", "plastika", "staklo", "metal", "EE-otpad", "tekstil"],
    lat: 43.5214,
    lng: 16.4339,
  },
  {
    id: "rd-solin",
    kind: "dvoriste",
    name: "Reciklažno dvorište Solin",
    address: "Joze Kljakovića Šantića 35, Solin",
    hours: "Pon/Sri/Pet 8–15 · Uto/Čet 11–18 · Sub 8–13",
    phone: "099 5382 522",
    fractions: ["papir", "plastika", "staklo", "metal", "EE-otpad", "tekstil"],
    lat: 43.54,
    lng: 16.4895,
    approx: true,
  },
  {
    id: "rd-podstrana",
    kind: "dvoriste",
    name: "Reciklažno dvorište Podstrana",
    address: "Poljička cesta 104, Podstrana",
    hours: "Pon/Sri/Pet 8–15 · Uto/Čet 11–18 · Sub 8–13",
    phone: "099 5435 869",
    fractions: ["papir", "plastika", "staklo", "metal", "EE-otpad", "tekstil"],
    lat: 43.4916,
    lng: 16.5535,
    approx: true,
  },
  // ── Građevinski otpad ────────────────────────────────────────
  {
    id: "rd-kastel-sucurac",
    kind: "gradevinski",
    name: "Reciklažno dvorište za građevinski otpad",
    address: "Put kave 43, Kaštel Sućurac",
    hours: "Pon–Sub 7–15",
    fractions: ["građevinski otpad", "šuta", "drvo", "metal"],
    lat: 43.5455,
    lng: 16.4108,
    approx: true,
  },
  // ── Mobilna reciklažna dvorišta (po gradskom kotaru) ──────────
  ...(
    [
      ["mrd-poljud", "GK Poljud", "Poljudsko šetalište, Split", 43.5189, 16.429],
      ["mrd-mertojak", "GK Mertojak", "Mosećka ulica, Split", 43.5045, 16.4795],
      ["mrd-kocunar", "GK Kocunar", "Kocunar, Split", 43.5235, 16.4565],
      ["mrd-lovret", "GK Lovret", "Lovretska ulica, Split", 43.5108, 16.4388],
      ["mrd-sucidar", "GK Sućidar", "Sućidar, Split", 43.5205, 16.4548],
      ["mrd-mejasi", "GK Mejaši", "Mejaši, Split", 43.5092, 16.4868],
      ["mrd-kman", "GK Kman", "Kman, Split", 43.5052, 16.4625],
      ["mrd-neslanovac", "GK Neslanovac", "Neslanovac, Split", 43.5238, 16.4668],
      ["mrd-brda", "GK Brda", "Brda, Split", 43.5125, 16.4525],
      ["mrd-meje", "GK Meje", "Meje, Split", 43.5082, 16.415],
      [
        "mrd-sv-luke",
        "Kod crkve sv. Luke",
        "Mosećka ulica (sv. Luka), Split",
        43.5038,
        16.4725,
      ],
      [
        "mrd-gripe",
        "Kod SC Gripe",
        "Vukovarska ulica (SC Gripe), Split",
        43.5095,
        16.4488,
      ],
    ] as [string, string, string, number, number][]
  ).map(
    ([id, name, address, lat, lng]): WasteSite => ({
      id,
      kind: "mobilno",
      name: `Mobilno RD — ${name}`,
      address,
      hours: "Povremeno, po rasporedu kotara",
      fractions: MOB_FRACTIONS,
      lat,
      lng,
      approx: true,
    }),
  ),
  // ── Zeleni otoci (reprezentativne lokacije po kvartu) ─────────
  ...(
    [
      ["zo-centar", "Centar / Riva", "Obala HNP, Split", 43.5081, 16.44],
      ["zo-bacvice", "Bačvice", "Šetalište Petra Preradovića", 43.506, 16.449],
      ["zo-znjan", "Žnjan", "Put Žnjana, Split", 43.506, 16.476],
      ["zo-trstenik", "Trstenik", "Trstenik (Split 3), Split", 43.5043, 16.469],
      ["zo-spinut", "Spinut", "Spinutska ulica, Split", 43.518, 16.425],
      ["zo-skalice", "Skalice", "Skalice, Split", 43.521, 16.46],
      ["zo-sirobuja", "Sirobuja", "Sirobuja, Split", 43.4995, 16.476],
      ["zo-ravne-njive", "Ravne njive", "Ravne njive, Split", 43.5235, 16.4625],
      ["zo-pazdigrad", "Pazdigrad", "Pazdigrad, Split", 43.503, 16.483],
      ["zo-visoka", "Visoka", "Visoka, Split", 43.516, 16.4585],
      ["zo-plokite", "Plokite", "Plokite, Split", 43.517, 16.447],
      ["zo-manus", "Manuš", "Manuš, Split", 43.511, 16.443],
      ["zo-bol", "Bol", "Bol, Split", 43.505, 16.457],
      ["zo-pujanke", "Pujanke", "Pujanke, Split", 43.5175, 16.4505],
    ] as [string, string, string, number, number][]
  ).map(
    ([id, name, address, lat, lng]): WasteSite => ({
      id,
      kind: "otok",
      name: `Zeleni otok — ${name}`,
      address,
      hours: "0–24",
      fractions: OTOK_FRACTIONS,
      lat,
      lng,
      approx: true,
    }),
  ),
  // ── Mjesta za povrat ambalaže (aparati u trgovinama) ─────────
  // Velike trgovine u sustavu povratne naknade (PET/limenke/staklo,
  // 0,10 € po komadu). Lokacije i nazivi orijentacijski po kvartu.
  ...(
    [
      [
        "pa-interspar-mos",
        "Interspar — Mall of Split",
        "Josipa Jovića 93, Split",
        43.5085,
        16.492,
      ],
      [
        "pa-kaufland-ccone",
        "Kaufland — City Center one",
        "Vukovarska 207, Split",
        43.5096,
        16.472,
      ],
      [
        "pa-konzum-joker",
        "Konzum — Joker centar",
        "Put Brodarice 6, Split",
        43.5198,
        16.4666,
      ],
      [
        "pa-lidl-sukoisan",
        "Lidl — Sukoišanska",
        "Sukoišanska ulica, Split",
        43.5135,
        16.4578,
      ],
      [
        "pa-lidl-vukovarska",
        "Lidl — Vukovarska",
        "Vukovarska ulica, Split",
        43.5092,
        16.4602,
      ],
      [
        "pa-lidl-spinut",
        "Lidl — Spinut",
        "Spinutska ulica, Split",
        43.5182,
        16.4258,
      ],
      [
        "pa-kaufland-dracevac",
        "Kaufland — Dračevac",
        "Hercegovačka ulica, Split",
        43.516,
        16.464,
      ],
      [
        "pa-plodine-kopilica",
        "Plodine — Kopilica",
        "Kopilica, Split",
        43.5215,
        16.436,
      ],
      [
        "pa-plodine-pazdigrad",
        "Plodine — Pazdigrad",
        "Pazdigrad, Split",
        43.5045,
        16.483,
      ],
      [
        "pa-tommy-brodarica",
        "Tommy — Brodarica",
        "Put Brodarice, Split",
        43.519,
        16.466,
      ],
      [
        "pa-tommy-znjan",
        "Tommy — Žnjan",
        "Put Žnjana, Split",
        43.506,
        16.4775,
      ],
      [
        "pa-konzum-bacvice",
        "Konzum Maxi — Bačvice",
        "Šetalište Petra Preradovića, Split",
        43.506,
        16.4515,
      ],
    ] as [string, string, string, number, number][]
  ).map(
    ([id, name, address, lat, lng]): WasteSite => ({
      id,
      kind: "povrat",
      name,
      address,
      hours: "Radno vrijeme trgovine",
      fractions: ["PET boce", "limenke", "staklene boce"],
      lat,
      lng,
      approx: true,
    }),
  ),
];

/** Natrag-kompatibilno: samo stalna reciklažna dvorišta. */
export type RecycleYard = WasteSite;
export const YARDS: WasteSite[] = SITES.filter((s) => s.kind === "dvoriste");

// Default centar (Žnjan / Split) ako geolokacija nije dostupna.
export const SPLIT_CENTER = { lat: 43.5081, lng: 16.4402 };

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

/** Sva mjesta sortirana po udaljenosti od ishodišta. */
export function withDistance(
  origin: { lat: number; lng: number },
): (WasteSite & { km: number })[] {
  return SITES.map((s) => ({ ...s, km: haversineKm(origin, s) })).sort(
    (a, b) => a.km - b.km,
  );
}

export function directionsUrl(s: { lat: number; lng: number }): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}&travelmode=driving`;
}
