"use client";

import { motion } from "framer-motion";
import {
  ShoppingBag,
  Recycle,
  RefreshCw,
  Sprout,
  Trash2,
  Waves,
  Fish,
  Hourglass,
  Factory,
  type LucideIcon,
} from "lucide-react";
import { MATERIAL_LABEL_HR } from "@/lib/score";

type Props = {
  scoreNumeric: number;
  decompositionYears: number;
  material: string;
  city?: string;
};

type Frame = { icon: LucideIcon; year: string; label: string; bad?: boolean };

function yearsLabel(y: number) {
  if (y < 1) return "par mjeseci";
  if (y >= 1000) return `${new Intl.NumberFormat("hr-HR").format(y)} god.`;
  return `${y} god.`;
}

function build(
  material: string,
  numeric: number,
  years: number,
): { accent: string; headline: string; sub: string; frames: Frame[]; conc: string } {
  const mat = MATERIAL_LABEL_HR[material] ?? material;

  // Closed-loop (dobro razvrstano i reciklira se u Splitu)
  if (numeric >= 65) {
    return {
      accent: "var(--mint)",
      headline: "Krug se zatvori za ~6 mjeseci",
      sub: `${mat} — vraća se kao resurs`,
      frames: [
        { icon: ShoppingBag, year: "Danas", label: "Kupiš i iskoristiš proizvod." },
        { icon: Recycle, year: "Za ~2 tjedna", label: "Sortirnica — odvojeno i očišćeno." },
        { icon: Factory, year: "1–3 mjeseca", label: `Prerada: ${mat} → novi materijal.` },
        { icon: RefreshCw, year: "~6 mjeseci", label: "Novi proizvod na polici. Krug zatvoren.", bad: false },
      ],
      conc: `${mat} se u Splitu dobro reciklira — pravim razvrstavanjem nikad ne postane otpad.`,
    };
  }

  // Papir — brzo se razgradi
  if (material === "paper") {
    return {
      accent: "var(--s-C)",
      headline: `Razgradnja: ~${yearsLabel(years)}`,
      sub: `${mat}`,
      frames: [
        { icon: ShoppingBag, year: "Danas", label: "Papirnata ambalaža." },
        { icon: Trash2, year: "Krivo bačeno", label: "Mokar/masan papir → miješani otpad." },
        { icon: Sprout, year: `~${yearsLabel(years)}`, label: "Razgradi se, ali resurs je izgubljen." },
        { icon: Recycle, year: "Bolje", label: "Suh u plavi — reciklira se 5–7 puta.", bad: false },
      ],
      conc: "Papir se razgradi brzo, ali odvojen u plavi spremnik štedi šume.",
    };
  }

  // Staklo / aluminij — ne razgrađuje se, ali beskonačno reciklabilno
  if (material === "glass" || material === "aluminium") {
    return {
      accent: "var(--s-C)",
      headline:
        material === "glass" ? "U prirodi: ~1.000.000 god." : "Razgradnja: ~200 god.",
      sub: `${mat} — ali 100% reciklabilno`,
      frames: [
        { icon: ShoppingBag, year: "Danas", label: `${mat} ambalaža.` },
        { icon: Trash2, year: "Krivo bačeno", label: "U prirodi praktički vječno.", bad: true },
        { icon: Recycle, year: "Odvojeno", label: "Pretopi se bez gubitka kvalitete." },
        { icon: RefreshCw, year: "~30–60 dana", label: "Novo, beskonačno puta.", bad: false },
      ],
      conc:
        material === "glass"
          ? "Staklo se ne razgrađuje — zato ga MORAŠ vratiti; reciklira se beskonačno."
          : "Reciklirani aluminij štedi 95% energije naspram novog.",
    };
  }

  // Tetrapak — Split ga ne reciklira
  if (material === "tetra_pak") {
    return {
      accent: "var(--s-F)",
      headline: `Razgradnja: ~${yearsLabel(years)}`,
      sub: `${mat} — Split ga ne reciklira`,
      frames: [
        { icon: ShoppingBag, year: "Danas", label: "Tetrapak (karton + plastika + alu)." },
        { icon: Trash2, year: "U Splitu", label: "Završi u miješanom otpadu.", bad: true },
        { icon: Factory, year: `~${yearsLabel(years)}`, label: "Spaljivanje ili odlagalište.", bad: true },
        { icon: Recycle, year: "Bolje", label: "Biraj staklo ili PET umjesto njega.", bad: false },
      ],
      conc: "Tetrapak se u Splitu ne reciklira — najbolja opcija je izbjeći ga.",
    };
  }

  // Plastika (PET/HDPE/LDPE/PVC/mixed) — mikroplastika
  return {
    accent: "var(--s-F)",
    headline: `Razgradnja: ~${yearsLabel(years)}`,
    sub: `${mat}`,
    frames: [
      { icon: ShoppingBag, year: "Danas · 2026", label: "Plastična ambalaža, kupljena." },
      { icon: Trash2, year: "Krivo bačeno", label: "Odlagalište Karepovac.", bad: true },
      {
        icon: Waves,
        year: `~${2026 + Math.max(1, Math.floor(years / 25))}`,
        label: "Raspad u mikroplastiku → Jadran.",
        bad: true,
      },
      { icon: Fish, year: `${yearsLabel(years)} ukupno`, label: "Vraća se kroz ribu i vodu.", bad: true },
    ],
    conc: `${yearsLabel(years)} razgradnje. Tvoja praunučad bi ovo još nalazila.`,
  };
}

export function TimeCapsule({
  scoreNumeric,
  decompositionYears,
  material,
}: Props) {
  const { accent, headline, sub, frames, conc } = build(
    material,
    scoreNumeric,
    decompositionYears,
  );

  return (
    <div>
      {/* merged data headline */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-5"
      >
        <div className="font-display text-2xl font-extrabold" style={{ color: accent }}>
          {headline}
        </div>
        <div className="label mt-1">{sub}</div>
      </motion.div>

      <div className="capsule">
        {frames.map((f, i) => {
          const Icon = f.icon;
          const last = i === frames.length - 1;
          const c = f.bad ? "var(--s-F)" : last ? "var(--mint)" : "var(--ink-soft)";
          return (
            <motion.div
              key={i}
              className="capsule-frame"
              initial={{ opacity: 0, x: 14, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{
                delay: 0.2 + i * 0.6,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <motion.span
                className="capsule-dot"
                style={{ borderColor: c, color: c }}
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.6, type: "spring", stiffness: 300 }}
              >
                <Icon className="size-5" />
              </motion.span>
              <div>
                <div className="capsule-year">{f.year}</div>
                <div
                  className="capsule-label"
                  style={f.bad || last ? { color: c } : undefined}
                >
                  {f.label}
                </div>
              </div>
            </motion.div>
          );
        })}

        <motion.p
          className="capsule-conc"
          style={{ color: accent }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 + frames.length * 0.6, duration: 0.6 }}
        >
          {conc}
        </motion.p>
      </div>
    </div>
  );
}
