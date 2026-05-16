import { NextResponse } from "next/server";
import { fetchProduct } from "@/lib/openfoodfacts";
import { computeScore } from "@/lib/score";
import { binFor } from "@/lib/bins";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ barcode: string }> },
) {
  const { barcode } = await params;
  const city = "split" as const;

  const product = await fetchProduct(barcode);

  const resolved = product ?? {
    barcode,
    name: "Nepoznat proizvod",
    brand: null,
    imageUrl: null,
    components: [{ material: "mixed-plastic", weight_pct: 100 }],
    source: "estimate" as const,
    confidence: 0.15,
  };

  const score = computeScore(resolved.components, city);

  return NextResponse.json({
    ...resolved,
    category: "ambalaža",
    city,
    bin: binFor(resolved.components, "ambalaža"),
    ...score,
    knownProduct: product !== null,
  });
}
