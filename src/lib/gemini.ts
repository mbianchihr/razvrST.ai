import { mapMaterial } from "./openfoodfacts";
import type { Component, DetectionHint } from "./types";

const SYSTEM_PROMPT = `Ti si stručnjak za otpad i recikliranje za hrvatsku aplikaciju.
Na fotografiji je BILO KOJI predmet (proizvod, ambalaža, uređaj, odjeća, hrana...).
Prepoznaj predmet i OD ČEGA JE NAPRAVLJEN (cijeli predmet, ne samo ambalaža).

Odgovori ISKLJUČIVO valjanim JSON-om prema shemi:
{
  "productName": string (na hrvatskom, npr. "plastična boca vode", "stara baterija", "pamučna majica"),
  "brand": string | null,
  "category": string (na hrvatskom, kratko: npr. "piće", "elektronika", "baterija", "tekstil", "hrana", "ambalaža", "kućanstvo"),
  "components": [
    {
      "material": "PET" | "HDPE" | "LDPE" | "PVC" | "glass" | "paper" | "aluminium" | "tetra_pak" | "mixed-plastic",
      "weight_pct": number (0-100),
      "description": string (na hrvatskom, npr. "plastično tijelo", "aluminijska folija")
    }
  ],
  "box": [ymin, xmin, ymax, xmax],
  "soiled": boolean,
  "recycle_ready": boolean,
  "warning": string | null,
  "prep_steps": string[],
  "reusable": boolean,
  "reuse_tip": string | null,
  "hazardous": boolean,
  "deposit_return": boolean,
  "multiple_items": boolean,
  "target_confident": boolean,
  "other_items": string[]
}

GLAVNI predmet = onaj u SREDINI kadra; ako nema jasnog središnjeg, onda
najveći/najistaknutiji. productName, components i box opisuju TAJ predmet.

"box" je TIJESAN okvir oko glavnog predmeta na slici, cijeli brojevi 0–1000
(relativno na visinu/širinu slike). Uključi samo predmet, ne pozadinu.

VIŠE PREDMETA:
- "multiple_items": true ako je na slici više RAZLIČITIH proizvoda/predmeta.
- "target_confident": true samo ako si siguran koji je glavni (jasno u sredini
  ili očito najveći). false ako je nejasno koji predmet korisnik želi.
- "other_items": kratki nazivi ostalih vidljivih predmeta na hrvatskom
  (max 4); [] ako nema drugih.

PROCJENA ČISTOĆE I SPREMNOSTI ZA RECIKLAŽU:
- "soiled": true ako je predmet VIDLJIVO prljav, mastan, mokar ili ima ostatke
  hrane/pića/tekućine (npr. zauljen karton od pizze, neisprana posuda).
- "recycle_ready": true SAMO ako je predmet čist, prazan i kao takav spreman za
  reciklažu. false ako je prljav ILI je kombinirani materijal koji se ne
  reciklira (plastificiran/laminiran papir, papirnata čaša, tetrapak, papir s
  folijom ili metalizacijom, termalni računi, stiropor...).
- "warning": ako recycle_ready=false, kratko (max ~140 znakova) na hrvatskom
  objasni ZAŠTO se ne može reciklirati i kamo ide (obično miješani otpad).
  Inače null.
- "prep_steps": 1–4 kratka koraka na hrvatskom što napraviti PRIJE bacanja
  (npr. "Isperi od ostataka", "Odvoji čep", "Spljošti", "Skini etiketu").
  Prazno polje ako nije potrebno.
- "reusable": true ako se predmet realno može ponovno iskoristiti, donirati ili
  prenamijeniti umjesto bacanja (staklenka, tegla, odjeća, kutija, vrećica).
- "reuse_tip": ako reusable=true, jedna konkretna ideja na hrvatskom; inače null.
- "hazardous": true za opasni otpad — baterije, elektronika, žarulje, ulje,
  boje, lijekovi, kemikalije (ide u reciklažno dvorište, NIKAD u kantu).
- "deposit_return": true SAMO ako je to PET boca pića ili limenka u hrvatskom
  sustavu povratne naknade (vraća se u trgovinu, 0,10 € po komadu).

Procijeni glavne materijale i njihov udio mase. Ako nisi siguran, koristi "mixed-plastic".
Zbroj weight_pct mora biti 100. Uvijek barem jedna komponenta.
Bez ikakvog teksta izvan JSON-a.`;

export type GeminiResult = {
  productName: string;
  brand: string | null;
  category: string | null;
  components: Component[];
  box: [number, number, number, number] | null;
  soiled: boolean;
  recycleReady: boolean;
  warning: string | null;
  prepSteps: string[];
  reusable: boolean;
  reuseTip: string | null;
  hazardous: boolean;
  depositReturn: boolean;
  multipleItems: boolean;
  targetConfident: boolean;
  otherItems: string[];
};

export function hasGeminiKey(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

export async function classifyProductImage(
  imageBase64: string,
  hint?: DetectionHint,
): Promise<GeminiResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("NO_GEMINI_KEY");

  const parts: Record<string, unknown>[] = [{ text: SYSTEM_PROMPT }];
  if (hint) {
    parts.push({
      text:
        `POMOĆ DETEKTORA NA UREĐAJU: prepoznat objekt "${hint.label}" ` +
        `(${hint.cls}, pouzdanost ${Math.round(hint.score * 100)}%) u okviru ` +
        `[${hint.box.join(", ")}] (ymin,xmin,ymax,xmax, 0–1000). ` +
        `Ako se poklapa s glavnim predmetom u sredini, uzmi to kao polazište ` +
        `i fokusiraj "box" na njega; ako se ne slaže sa slikom, zanemari ovo.`,
    });
  }
  parts.push({ inline_data: { mime_type: "image/jpeg", data: imageBase64 } });

  const body = JSON.stringify({
    contents: [{ parts }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
      maxOutputTokens: 2048,
      // gemini-2.5-flash is a thinking model — disable hidden reasoning so the
      // token budget isn't consumed before the JSON answer is produced.
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  const call = () =>
    fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      },
    );

  let res = await call();
  // One backoff retry on transient rate-limit / unavailable.
  if (res.status === 429 || res.status === 503) {
    await new Promise((r) => setTimeout(r, 2500));
    res = await call();
  }

  if (!res.ok) throw new Error(`GEMINI_HTTP_${res.status}`);
  const data = await res.json();
  const cand = data?.candidates?.[0];
  const text: string | undefined = cand?.content?.parts
    ?.map((p: { text?: string }) => p?.text ?? "")
    .join("");
  if (!text)
    throw new Error(`GEMINI_EMPTY_${cand?.finishReason ?? "UNKNOWN"}`);

  // Tolerant parse: strip code fences, isolate the JSON object.
  const cleaned = text
    .replace(/```json?/gi, "")
    .replace(/```/g, "")
    .trim();
  const slice = cleaned.slice(
    cleaned.indexOf("{"),
    cleaned.lastIndexOf("}") + 1,
  );
  const parsed = JSON.parse(slice || cleaned) as Record<string, unknown> & {
    components?: Component[];
  };
  const str = (v: unknown): string | null => {
    const s = typeof v === "string" ? v.trim() : "";
    return s.length ? s : null;
  };
  const components = (parsed.components ?? [])
    .map((c) => ({
      material: mapMaterial(String(c.material)),
      weight_pct: Number(c.weight_pct) || 0,
      description: c.description,
    }))
    .filter((c) => c.weight_pct > 0);

  const b = parsed.box;
  const box =
    Array.isArray(b) && b.length === 4 && b.every((v) => Number.isFinite(+v))
      ? (b.map(Number) as [number, number, number, number])
      : null;

  const strList = (v: unknown, n: number) =>
    Array.isArray(v)
      ? (v as unknown[])
          .map((x) => str(x))
          .filter((x): x is string => !!x)
          .slice(0, n)
      : [];
  const prepSteps = strList(parsed.prep_steps, 4);

  return {
    productName: str(parsed.productName) || "Prepoznati predmet",
    brand: str(parsed.brand),
    category: str(parsed.category),
    components:
      components.length > 0
        ? components
        : [{ material: "mixed-plastic", weight_pct: 100 }],
    box,
    soiled: parsed.soiled === true,
    recycleReady: parsed.recycle_ready !== false,
    warning: str(parsed.warning),
    prepSteps,
    reusable: parsed.reusable === true,
    reuseTip: str(parsed.reuse_tip),
    hazardous: parsed.hazardous === true,
    depositReturn: parsed.deposit_return === true,
    multipleItems: parsed.multiple_items === true,
    targetConfident: parsed.target_confident !== false,
    otherItems: strList(parsed.other_items, 4),
  };
}
