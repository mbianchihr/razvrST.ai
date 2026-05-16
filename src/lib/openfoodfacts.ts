import type { Component, DataSource } from "./types";

export type ResolvedProduct = {
  barcode: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  components: Component[];
  source: DataSource;
  confidence: number;
};

const cache = new Map<string, ResolvedProduct | null>();

export async function fetchProduct(
  barcode: string,
): Promise<ResolvedProduct | null> {
  if (cache.has(barcode)) return cache.get(barcode) ?? null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,product_name_hr,brands,image_url,packagings,packaging_materials_tags,packaging`,
      {
        headers: { "User-Agent": "razvrST.ai/1.0 (https://razvrst.ai)" },
        signal: controller.signal,
      },
    );
    clearTimeout(timeout);
    if (!res.ok) return null;

    const data = (await res.json()) as {
      status?: number;
      product?: {
        product_name?: string;
        product_name_hr?: string;
        brands?: string;
        image_url?: string;
        packaging?: string;
        packaging_materials_tags?: string[];
        packagings?: {
          material?: string;
          shape?: string;
          weight_measured?: number;
        }[];
      };
    };
    if (data.status !== 1 || !data.product) {
      cache.set(barcode, null);
      return null;
    }

    const p = data.product;
    const { components, confidence } = extractComponents(p);

    const result: ResolvedProduct = {
      barcode,
      name:
        p.product_name_hr?.trim() ||
        p.product_name?.trim() ||
        "Nepoznat proizvod",
      brand: p.brands?.split(",")[0]?.trim() || null,
      imageUrl: p.image_url || null,
      components,
      source: "off",
      confidence,
    };
    cache.set(barcode, result);
    return result;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

function extractComponents(p: {
  packaging?: string;
  packaging_materials_tags?: string[];
  packagings?: { material?: string; shape?: string; weight_measured?: number }[];
}): { components: Component[]; confidence: number } {
  // 1) Structured packagings with measured weights — highest confidence.
  if (p.packagings && p.packagings.length > 0) {
    const total =
      p.packagings.reduce((s, x) => s + (x.weight_measured ?? 1), 0) || 1;
    const hasWeights = p.packagings.some((x) => x.weight_measured);
    return {
      components: p.packagings.map((x) => ({
        material: mapMaterial(`${x.material ?? ""} ${x.shape ?? ""}`),
        weight_pct: ((x.weight_measured ?? 1) / total) * 100,
        description: [x.shape, x.material].filter(Boolean).join(" · ") || undefined,
      })),
      confidence: hasWeights ? 0.9 : 0.7,
    };
  }

  // 2) Material tags (no weights) — split evenly.
  const tags = (p.packaging_materials_tags ?? [])
    .map((t) => mapMaterial(t))
    .filter((m, i, a) => a.indexOf(m) === i);
  if (tags.length > 0) {
    return {
      components: tags.map((m) => ({
        material: m,
        weight_pct: 100 / tags.length,
      })),
      confidence: 0.55,
    };
  }

  // 3) Free-text packaging string.
  if (p.packaging) {
    return {
      components: [{ material: mapMaterial(p.packaging), weight_pct: 100 }],
      confidence: 0.4,
    };
  }

  // 4) Nothing — conservative default.
  return {
    components: [{ material: "mixed-plastic", weight_pct: 100 }],
    confidence: 0.2,
  };
}

export function mapMaterial(raw: string): string {
  const m = (raw || "").toLowerCase();
  if (/\bpet\b|polyethylene-terephthalate|plastic-1|pete/.test(m)) return "PET";
  if (/hdpe|plastic-2|high-density/.test(m)) return "HDPE";
  if (/ldpe|plastic-4|low-density|\bfilm\b|folij/.test(m)) return "LDPE";
  if (/pvc|plastic-3|vinyl/.test(m)) return "PVC";
  if (/glass|staklo|steklo/.test(m)) return "glass";
  if (/paper|cardboard|karton|papir|fsc|fibre|fiber/.test(m)) return "paper";
  if (/alumin|metal|tin-can|steel|lim\b/.test(m)) return "aluminium";
  if (/tetra|brick|carton-aseptic|elopak|combibloc/.test(m)) return "tetra_pak";
  if (/pp\b|plastic-5|polypropylene|ps\b|plastic-6|polystyrene/.test(m))
    return "mixed-plastic";
  if (/plastic|plastika|plastik/.test(m)) return "mixed-plastic";
  return "mixed-plastic";
}
