import { NextResponse } from "next/server";
import { classifyProductImage, hasGeminiKey } from "@/lib/gemini";
import { computeScore } from "@/lib/score";
import { binFor } from "@/lib/bins";
import type { DetectionHint } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  const city = "split" as const;

  if (!hasGeminiKey()) {
    return NextResponse.json(
      { error: "NO_GEMINI_KEY", message: "AI prepoznavanje nije konfigurirano." },
      { status: 503 },
    );
  }

  let imageBase64: string;
  let hint: DetectionHint | undefined;
  try {
    const body = (await req.json()) as {
      image?: string;
      hint?: DetectionHint | null;
    };
    imageBase64 = (body.image ?? "").replace(/^data:image\/\w+;base64,/, "");
    if (!imageBase64) throw new Error("no image");
    hint = body.hint ?? undefined;
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  try {
    const ai = await classifyProductImage(imageBase64, hint);
    const score = computeScore(ai.components, city);
    return NextResponse.json({
      barcode: null,
      name: ai.productName,
      brand: ai.brand,
      category: ai.category,
      imageUrl: null,
      components: ai.components,
      source: "ai",
      confidence: 0.7,
      // Opasni otpad → dvorište; nereciklabilno/prljavo → miješani;
      // inače po dominantnom materijalu.
      bin: ai.hazardous
        ? "dvoriste"
        : !ai.recycleReady
          ? "mijesano"
          : binFor(ai.components, ai.category ?? undefined),
      box: ai.box,
      city,
      ...score,
      knownProduct: false,
      soiled: ai.soiled,
      recycleReady: ai.recycleReady,
      aiWarning: ai.warning,
      prepSteps: ai.prepSteps,
      reusable: ai.reusable,
      reuseTip: ai.reuseTip,
      hazardous: ai.hazardous,
      depositReturn: ai.depositReturn,
      multipleItems: ai.multipleItems,
      targetConfident: ai.targetConfident,
      otherItems: ai.otherItems,
    });
  } catch (e) {
    const components = [{ material: "mixed-plastic", weight_pct: 100 }];
    const score = computeScore(components, city);
    return NextResponse.json({
      barcode: null,
      name: "Nepoznat predmet",
      brand: null,
      category: null,
      imageUrl: null,
      components,
      source: "estimate",
      confidence: 0.15,
      bin: binFor(components),
      city,
      ...score,
      knownProduct: false,
      aiError: (e as Error).message,
    });
  }
}
