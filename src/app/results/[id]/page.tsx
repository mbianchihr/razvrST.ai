"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Barcode,
  Trash2,
  MapPin,
  Check,
  Lightbulb,
  AlertTriangle,
  Droplets,
  Coins,
  Recycle,
  ShieldAlert,
} from "lucide-react";
import { falseFriend } from "@/lib/contamination";
import { ScoreBadge } from "@/components/ScoreBadge";
import { TimeCapsule } from "@/components/TimeCapsule";
import { Badge } from "@/components/ui/badge";
import { getScan, markRecycled } from "@/lib/storage";
import { getAdvice } from "@/lib/alternatives";
import { CITY_LABEL } from "@/lib/score";
import { BINS } from "@/lib/bins";
import { tipsFor } from "@/lib/tips";
import { divertedGrams } from "@/lib/stats";
import type { ScanResult } from "@/lib/types";

const SOURCE_LABEL: Record<string, string> = {
  off: "Open Food Facts",
  ai: "AI prepoznavanje",
  estimate: "Procjena",
};

export default function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [scan, setScan] = useState<ScanResult | null | undefined>(undefined);
  const [done, setDone] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const s = getScan(id);
    setScan(s);
    setDone(!!s?.recycled);
    setDirty(!!s?.dirty);
  }, [id]);

  if (scan === undefined)
    return (
      <main className="flex-1 grid place-items-center text-ink-soft label">
        učitavam…
      </main>
    );

  if (scan === null)
    return (
      <main className="flex-1 grid place-items-center px-8 text-center gap-4">
        <p className="font-display text-xl">Skeniranje nije pronađeno.</p>
        <Link href="/" className="label text-mint-deep">
          ▸ natrag na skeniranje
        </Link>
      </main>
    );

  const advice = getAdvice(scan);
  const cityLabel = CITY_LABEL[scan.city] ?? scan.city;
  const ff = falseFriend(scan);
  const bin = BINS[scan.bin] ?? BINS.mijesano;
  // Nereciklabilan materijal / prljav predmet NIKAD ne ide u reciklabilni
  // spremnik — preusmjeri kantu na stvarno odredište.
  const shownBin = dirty
    ? BINS.mijesano
    : ff
      ? BINS[ff.bin] ?? BINS.mijesano
      : bin;
  const block: "dirty" | "material" | null = dirty
    ? "dirty"
    : ff
      ? "material"
      : null;
  const saved = block ? 0 : divertedGrams(scan.numeric);
  const tips = tipsFor(shownBin.key, scan.components);
  const topMaterial = scan.breakdown[0]?.material ?? "mixed-plastic";

  function recycle(asDirty = false) {
    if (
      asDirty &&
      !window.confirm(
        "Prljav, masan ili mokar predmet (npr. zauljen papir ili karton) ne može se reciklirati — onečišćuje cijelu hrpu. Označiti kao bačeno u MIJEŠANI otpad?",
      )
    )
      return;
    markRecycled(
      id,
      asDirty ? { dirty: true } : ff ? { toBin: ff.bin } : undefined,
    );
    setDone(true);
    if (asDirty) setDirty(true);
  }

  return (
    <main className="flex-1 flex flex-col pb-8">
      <header className="flex items-center justify-between px-5 pt-5">
        <Link href="/" aria-label="Natrag" className="p-2 -ml-2">
          <ArrowLeft className="size-5" />
        </Link>
        <Badge
          variant="secondary"
          className="label gap-1.5 bg-accent text-accent-foreground border-0"
        >
          {scan.source === "ai" ? (
            <Sparkles className="size-3.5" />
          ) : (
            <Barcode className="size-3.5" />
          )}
          {SOURCE_LABEL[scan.source] ?? "Izvor"}
        </Badge>
      </header>

      {/* Hero image — prominent, isolated/zoomed */}
      <section className="px-5 pt-3 reveal" style={{ animationDelay: "0.05s" }}>
        <div className="relative w-full aspect-[4/3] rounded-[var(--radius)] overflow-hidden bg-secondary ring-1 ring-line">
          {scan.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={scan.imageUrl}
              alt={scan.name}
              className="absolute inset-0 w-full h-full object-contain p-4"
            />
          ) : scan.userImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={scan.userImage}
              alt={scan.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center label">
              bez slike
            </div>
          )}
          {scan.userImage && !scan.imageUrl && (
            <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-ink/75 px-2.5 py-1 text-[0.6rem] font-semibold tracking-wide text-white">
              <span className="size-1.5 rounded-full bg-mint" />
              TVOJA SNIMKA
            </span>
          )}
        </div>
        <div className="mt-3">
          <span className="label">
            {scan.category ?? scan.brand ?? "Predmet"}
          </span>
          <h1 className="font-display text-[1.75rem] leading-tight mt-1 font-extrabold">
            {scan.name}
          </h1>
        </div>
      </section>

      {/* Deposit return — Croatian povratna naknada */}
      {scan.depositReturn && (
        <section
          className="mx-5 mt-5 rounded-[var(--radius)] p-4 reveal flex items-center gap-3"
          style={{
            animationDelay: "0.07s",
            background: "linear-gradient(135deg,#0fb8a0,#0a7d6e)",
            color: "#fff",
          }}
        >
          <span className="grid place-items-center size-11 rounded-2xl bg-white/15 flex-none">
            <Coins className="size-6" />
          </span>
          <div className="flex-1">
            <p className="font-display text-base font-extrabold leading-tight">
              Povratna naknada · 0,10 €
            </p>
            <p className="text-sm text-white/85 mt-0.5 leading-snug">
              Vrati na aparat u trgovini — ne baca se u kantu.
            </p>
            <Link
              href="/map?vrsta=povrat"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-white"
            >
              <MapPin className="size-4" />
              Najbliže mjesto za povrat →
            </Link>
          </div>
        </section>
      )}

      {/* Hazardous waste */}
      {scan.hazardous && (
        <section
          className="mx-5 mt-5 rounded-[var(--radius)] p-4 reveal"
          style={{
            animationDelay: "0.08s",
            background: "color-mix(in srgb, var(--s-F) 12%, var(--surface))",
            border: "1px solid color-mix(in srgb, var(--s-F) 40%, transparent)",
          }}
        >
          <div className="flex gap-3">
            <span
              className="grid place-items-center size-9 rounded-xl flex-none text-white"
              style={{ background: "var(--s-F)" }}
            >
              <ShieldAlert className="size-5" />
            </span>
            <div>
              <span className="label" style={{ color: "var(--s-F)" }}>
                Opasni otpad — nikad u kantu
              </span>
              <p className="text-sm text-ink-soft mt-1 leading-relaxed">
                Baterije, elektronika, žarulje, ulje i kemikalije nose se u
                reciklažno dvorište radi sigurnog zbrinjavanja.
              </p>
              <Link
                href="/map"
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold"
                style={{ color: "var(--s-F)" }}
              >
                <MapPin className="size-4" />
                Najbliže dvorište →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* AI cleanliness / readiness warning */}
      {scan.aiWarning && (
        <section
          className="mx-5 mt-5 rounded-[var(--radius)] p-4 reveal"
          style={{
            animationDelay: "0.09s",
            background: "color-mix(in srgb, var(--s-D) 12%, var(--surface))",
            border: "1px solid color-mix(in srgb, var(--s-D) 35%, transparent)",
          }}
        >
          <div className="flex gap-3">
            <span
              className="grid place-items-center size-9 rounded-xl flex-none text-white"
              style={{ background: "var(--s-D)" }}
            >
              <Sparkles className="size-5" />
            </span>
            <div>
              <span className="label" style={{ color: "var(--s-D)" }}>
                AI provjera — možda nije za reciklažu
              </span>
              <p className="text-sm text-ink-soft mt-1 leading-relaxed">
                {scan.aiWarning}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* False friend — common "I thought this recycles" mistake */}
      {ff && (
        <section
          className="mx-5 mt-5 rounded-[var(--radius)] p-4 reveal"
          style={{
            animationDelay: "0.09s",
            background: "color-mix(in srgb, var(--s-D) 12%, var(--surface))",
            border: "1px solid color-mix(in srgb, var(--s-D) 35%, transparent)",
          }}
        >
          <div className="flex gap-3">
            <span
              className="grid place-items-center size-9 rounded-xl flex-none text-white"
              style={{ background: "var(--s-D)" }}
            >
              <AlertTriangle className="size-5" />
            </span>
            <div>
              <span
                className="label"
                style={{ color: "var(--s-D)" }}
              >
                Ne reciklira se — česta zabuna
              </span>
              <p className="font-display text-base font-extrabold mt-0.5 leading-tight">
                {ff.title}
              </p>
              <p className="text-sm text-ink-soft mt-1 leading-relaxed">
                {ff.detail}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Bin — the action + mark recycled */}
      <section
        className="mx-5 mt-5 card-soft p-5 reveal"
        style={{ animationDelay: "0.12s" }}
      >
        <span className="label">Baci u</span>
        <div className="flex items-center gap-3 mt-2">
          <span
            className="grid place-items-center size-12 rounded-2xl text-white flex-none"
            style={{ background: shownBin.color }}
          >
            <Trash2 className="size-6" />
          </span>
          <div>
            <p className="font-display text-xl font-extrabold leading-tight">
              {shownBin.name}
            </p>
            <p className="text-sm text-ink-soft">{shownBin.short}</p>
          </div>
        </div>
        <p className="text-sm text-ink-soft mt-3 leading-relaxed">
          {shownBin.hint}
        </p>

        {!block && scan.prepSteps && scan.prepSteps.length > 0 && (
          <div className="mt-4 rounded-2xl bg-mint-wash/70 p-3.5">
            <span className="label text-mint-deep">Pripremi prije bacanja</span>
            <ul className="mt-2 space-y-1.5">
              {scan.prepSteps.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-ink leading-snug"
                >
                  <Check className="size-4 mt-0.5 text-mint-deep flex-none" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {done ? (
          block ? (
            <div
              className="mt-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold"
              style={{
                background: "color-mix(in srgb, var(--s-D) 14%, transparent)",
                color: "var(--s-D)",
              }}
            >
              <AlertTriangle className="size-5 flex-none" />
              {block === "dirty"
                ? `Zabilježeno u ${shownBin.name.toLowerCase()} — prljav predmet se ne reciklira.`
                : `Zabilježeno u ${shownBin.name.toLowerCase()} — ovaj materijal se ne reciklira.`}
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-mint-wash text-mint-deep px-4 py-3 text-sm font-semibold">
              <Check className="size-5" />
              Zabilježeno — bacio si u {shownBin.name.toLowerCase()}. Bravo!
            </div>
          )
        ) : (
          <>
            <button
              onClick={() => recycle(false)}
              className="btn-primary w-full mt-4 py-3.5 flex items-center justify-center gap-2 text-sm"
            >
              <Check className="size-5" />
              {block === "material"
                ? `Bacio sam u ${shownBin.name.toLowerCase()}`
                : "Označi kao razvrstano"}
            </button>
            <button
              onClick={() => recycle(true)}
              className="w-full mt-2.5 py-3 flex items-center justify-center gap-2 text-sm font-semibold rounded-full border"
              style={{
                color: "var(--s-D)",
                borderColor:
                  "color-mix(in srgb, var(--s-D) 40%, transparent)",
                background:
                  "color-mix(in srgb, var(--s-D) 8%, transparent)",
              }}
            >
              <Droplets className="size-4.5" />
              Prljavo / masno? → miješani otpad
            </button>
          </>
        )}
      </section>

      {/* Reuse before recycle */}
      {scan.reusable && scan.reuseTip && (
        <section
          className="mx-5 mt-5 rounded-[var(--radius)] p-4 reveal flex gap-3"
          style={{
            animationDelay: "0.14s",
            background: "var(--mint-wash)",
            border: "1px solid color-mix(in srgb, var(--mint) 30%, transparent)",
          }}
        >
          <span className="grid place-items-center size-9 rounded-xl flex-none bg-mint text-white">
            <Recycle className="size-5" />
          </span>
          <div>
            <span className="label text-mint-deep">
              Prije nego baciš — iskoristi ponovno
            </span>
            <p className="text-sm text-ink-soft mt-1 leading-relaxed">
              {scan.reuseTip}
            </p>
          </div>
        </section>
      )}

      {/* Sorting rules — common mistakes */}
      <section
        className="mx-5 mt-5 panel p-5 reveal"
        style={{ animationDelay: "0.16s" }}
      >
        <span className="label flex items-center gap-1.5 text-[var(--s-D)]">
          <AlertTriangle className="size-3.5" />
          Pravila razvrstavanja — česte greške
        </span>
        <ul className="mt-3 space-y-2.5">
          {tips.map((t, i) => (
            <li
              key={i}
              className="flex gap-2.5 text-sm text-ink-soft leading-relaxed"
            >
              <span
                className="mt-2 size-1.5 rounded-full flex-none"
                style={{ background: "var(--s-D)" }}
              />
              {t}
            </li>
          ))}
        </ul>
      </section>

      {/* Score */}
      <section
        className="px-6 mt-7 reveal flex items-center gap-5"
        style={{ animationDelay: "0.2s" }}
      >
        <ScoreBadge tier={scan.tier} size={92} />
        <div>
          <div className="font-display text-[3.2rem] leading-none font-extrabold">
            {scan.numeric}
            <span className="text-2xl text-ink-soft">%</span>
          </div>
          <p className="label mt-1">završi u reciklaži · {cityLabel}</p>
        </div>
      </section>

      {/* Personal impact */}
      <section
        className="mx-5 mt-6 rounded-[var(--radius)] p-5 reveal text-white"
        style={{
          animationDelay: "0.26s",
          background: block
            ? "linear-gradient(135deg,#7a6a52,#4c4334)"
            : "linear-gradient(135deg,var(--mint),var(--mint-deep))",
        }}
      >
        {block ? (
          <>
            <span className="label" style={{ color: "rgba(255,255,255,0.85)" }}>
              {block === "dirty"
                ? "Onečišćeno — nula učinka"
                : "Ne reciklira se — nula učinka"}
            </span>
            <p className="font-display text-2xl font-extrabold mt-1.5">
              ≈ 0 g spašeno
            </p>
            <p className="text-sm text-white/85 mt-1.5 leading-relaxed">
              {block === "dirty"
                ? "Prljav predmet ide u miješani otpad i ne ulazi u reciklažu. Sljedeći put isperi ili obriši ambalažu prije razvrstavanja — tad se stvarno računa."
                : `Ovaj materijal se u Splitu ne reciklira pa završava u ${shownBin.name.toLowerCase()}. Bira se ambalaža od jednog materijala (npr. staklo ili čisti PET) da bi se učinak stvarno računao.`}
            </p>
          </>
        ) : (
          <>
            <span className="label" style={{ color: "rgba(255,255,255,0.85)" }}>
              {done ? "Tvoj učinak" : "Ako ovo razvrstaš ispravno"}
            </span>
            <p className="font-display text-2xl font-extrabold mt-1.5">
              ≈ {saved} g {done ? "spašeno od odlagališta" : "spasit ćeš"}
            </p>
            <p className="text-sm text-white/85 mt-1.5 leading-relaxed">
              Toliko materijala stvarno uđe u reciklažu umjesto na Karepovac —
              tvojom jednom ispravnom odlukom.
            </p>
          </>
        )}
      </section>

      {/* Breakdown */}
      <section
        className="mx-5 mt-6 panel p-5 reveal"
        style={{ animationDelay: "0.32s" }}
      >
        <div className="flex items-center justify-between">
          <span className="label">Od čega je</span>
          <span className="label">
            pouzdanost {Math.round(scan.confidence * 100)}%
          </span>
        </div>
        <hr className="rule-dashed my-3" />
        <ul className="space-y-3">
          {scan.breakdown.map((b, i) => (
            <li key={i}>
              <div className="flex items-baseline justify-between text-[0.95rem]">
                <span className="font-medium">{b.label}</span>
                <span className="mono text-ink-soft text-sm">
                  {b.weight_pct}% mase
                </span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-secondary overflow-hidden">
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${Math.round(b.recycle_rate * 100)}%`,
                    background:
                      b.recycle_rate < 0.3
                        ? "var(--s-F)"
                        : b.recycle_rate < 0.6
                          ? "var(--s-C)"
                          : "var(--s-A)",
                  }}
                />
              </div>
              <div className="mono text-xs text-ink-soft mt-1">
                {Math.round(b.recycle_rate * 100)}% završi u reciklaži · {cityLabel}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Decomposition timeline — contextual to the material */}
      <section
        className="mx-5 mt-6 panel p-5 reveal"
        style={{ animationDelay: "0.38s" }}
      >
        <span className="label">Što se dogodi poslije</span>
        <div className="mt-4">
          <TimeCapsule
            scoreNumeric={scan.numeric}
            decompositionYears={scan.decompositionYears}
            material={topMaterial}
          />
        </div>
      </section>

      {/* Context-specific advice */}
      <section
        className="mx-5 mt-6 rounded-[var(--radius)] border border-mint/40 bg-mint-wash p-5 reveal"
        style={{ animationDelay: "0.44s" }}
      >
        <span
          className="label flex items-center gap-1.5"
          style={{ color: "var(--mint-deep)" }}
        >
          <Lightbulb className="size-3.5" />
          {advice.kind === "good"
            ? "Procjena"
            : advice.kind === "special"
              ? "Kako zbrinuti"
              : "Bolja opcija · prije nego kupiš"}
        </span>
        <p className="font-display text-xl font-extrabold mt-2">
          {advice.title}
        </p>
        <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">
          {advice.detail}
        </p>
        {advice.kind === "special" && (
          <Link
            href="/map"
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-mint-deep"
          >
            <MapPin className="size-4" />
            Najbliže reciklažno dvorište →
          </Link>
        )}
      </section>

      <div
        className="px-5 mt-7 grid grid-cols-2 gap-3 reveal"
        style={{ animationDelay: "0.5s" }}
      >
        <Link
          href="/map"
          className="flex items-center justify-center gap-2 py-4 rounded-full border border-line bg-card font-semibold text-sm"
        >
          <MapPin className="size-4" />
          Reciklažno dvorište
        </Link>
        <Link
          href="/twin"
          className="btn-primary flex items-center justify-center gap-2 py-4 text-sm"
        >
          Moj otisak
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </main>
  );
}
