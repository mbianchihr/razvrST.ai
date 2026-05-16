"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, ScanLine, Check } from "lucide-react";
import { ScoreBadge } from "@/components/ScoreBadge";
import { LangToggle } from "@/components/LangToggle";
import { InstallButton } from "@/components/InstallButton";
import { getAllScans } from "@/lib/storage";
import { STATS, divertedGrams, personalVsSplit } from "@/lib/stats";
import { useLang } from "@/lib/i18n";
import type { ScanResult } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

export default function TwinPage() {
  const { t, lang } = useLang();
  const [scans, setScans] = useState<ScanResult[]>([]);
  useEffect(() => setScans(getAllScans()), []);

  const n = scans.length;
  const week = scans.filter((s) => Date.now() - s.scannedAt < 6048e5).length;
  const avg = n ? Math.round(scans.reduce((a, s) => a + s.numeric, 0) / n) : 0;
  const recycledScans = scans.filter((s) => s.recycled);
  const recycledN = recycledScans.length;
  const savedG = recycledScans.reduce((a, s) => a + divertedGrams(s.numeric), 0);
  const potentialG = scans.reduce((a, s) => a + divertedGrams(s.numeric), 0);
  const vs = personalVsSplit(avg);

  const bars = [
    { k: t("twin.barSplit"), v: STATS.splitSeparatedPct, c: "var(--s-D)", you: false },
    { k: t("twin.barHr"), v: STATS.hrSeparatedPct, c: "var(--s-C)", you: false },
    { k: t("twin.barEu"), v: STATS.euTarget2025Pct, c: "var(--ink-soft)", you: false },
    { k: t("twin.barYou"), v: avg, c: "var(--mint)", you: true },
  ];

  const heroMsg =
    n === 0
      ? t("twin.msgEmpty")
      : recycledN < n
        ? t("twin.msgMore", { g: potentialG - savedG })
        : vs.better
          ? t("twin.msgAbove", { p: vs.deltaPct })
          : t("twin.msgAll");

  return (
    <main className="relative flex-1 flex flex-col pb-8 overflow-hidden">
      <div
        className="blob absolute -z-10 -top-24 -right-24 size-72 rounded-full"
        style={{ background: "color-mix(in srgb, var(--mint) 20%, transparent)" }}
      />

      <motion.header
        className="px-6 pt-7"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        <div className="flex items-start justify-between">
          <span className="label inline-flex items-center gap-2 text-mint-deep">
            <Activity className="size-3.5" />
            {t("twin.eyebrow")}
          </span>
          <LangToggle />
        </div>
        <h1 className="font-display text-[2.1rem] leading-[1.05] mt-1.5 font-extrabold tracking-[-0.02em]">
          {t("twin.title")}
        </h1>
        <p className="text-ink-soft text-[0.95rem] leading-relaxed mt-2 max-w-[21rem]">
          {t("twin.subtitle")}
        </p>
      </motion.header>

      {/* Hero impact */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease, delay: 0.08 }}
        className="mx-5 mt-6 rounded-[var(--radius)] p-6 text-white relative overflow-hidden"
        style={{
          background: "linear-gradient(140deg,var(--mint),var(--mint-deep))",
        }}
      >
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10" />
        <span className="label" style={{ color: "rgba(255,255,255,0.82)" }}>
          {t("twin.savedLabel")}
        </span>
        <div className="font-display text-[3.4rem] leading-none font-extrabold mt-1.5">
          {savedG}
          <span className="text-2xl font-bold"> g</span>
        </div>
        <p className="text-sm text-white/85 mt-2 leading-relaxed max-w-[19rem]">
          {heroMsg}
        </p>
        <div className="mt-5 flex gap-2">
          {[
            { k: t("twin.scans"), v: String(n) },
            { k: t("twin.recycled"), v: String(recycledN) },
            { k: t("twin.thisWeek"), v: String(week) },
          ].map((c) => (
            <div
              key={c.k}
              className="flex-1 rounded-2xl bg-white/15 backdrop-blur px-3 py-2.5 text-center"
            >
              <div className="font-display text-xl font-extrabold leading-none">
                {c.v}
              </div>
              <div className="text-[0.58rem] font-semibold tracking-wide opacity-80 mt-1">
                {c.k.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Where you stand */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 0.16 }}
        className="mx-5 mt-5 panel p-5"
      >
        <span className="label">{t("twin.whereYouStand")}</span>
        <div className="mt-4 space-y-3.5">
          {bars.map((b) => (
            <div key={b.k}>
              <div className="flex justify-between text-sm mb-1.5">
                <span
                  className={b.you ? "font-bold text-mint-deep" : "text-ink-soft"}
                >
                  {b.k}
                </span>
                <span className="mono font-bold">{b.v}%</span>
              </div>
              <div className="h-3 rounded-full bg-secondary overflow-hidden">
                <motion.span
                  className="block h-full rounded-full"
                  style={{ background: b.c }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, b.v)}%` }}
                  transition={{ duration: 0.9, ease, delay: 0.3 }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-ink-soft mt-4 leading-relaxed">
          {t("twin.footnote")}
        </p>
      </motion.section>

      {/* History */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 0.24 }}
        className="mx-5 mt-5"
      >
        <div className="flex items-center justify-between px-1">
          <span className="label">{t("twin.history")}</span>
          <span className="label">{t("twin.entries", { n })}</span>
        </div>

        {n === 0 ? (
          <Link
            href="/"
            className="mt-3 card-soft lift flex items-center gap-3 p-5"
          >
            <span className="grid place-items-center size-11 rounded-2xl bg-mint-wash text-mint-deep flex-none">
              <ScanLine className="size-5" />
            </span>
            <div>
              <p className="font-display font-extrabold">
                {t("twin.firstScan")}
              </p>
              <p className="text-sm text-ink-soft">{t("twin.historyHere")}</p>
            </div>
          </Link>
        ) : (
          <div className="mt-3 panel divide-y divide-line overflow-hidden">
            {scans.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3.5">
                <ScoreBadge tier={s.tier} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[0.95rem]">
                    {s.name}
                  </p>
                  <p className="mono text-xs text-ink-soft mt-0.5">
                    {s.numeric}% ·{" "}
                    {new Date(s.scannedAt).toLocaleDateString(
                      lang === "en" ? "en-GB" : "hr-HR",
                    )}
                  </p>
                </div>
                {s.recycled && (
                  <span className="flex items-center gap-1 rounded-full bg-mint-wash text-mint-deep px-2.5 py-1 text-[0.62rem] font-bold flex-none">
                    <Check className="size-3" strokeWidth={3} />
                    {t("twin.sorted")}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Install PWA */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease, delay: 0.32 }}
        className="mx-5 mt-5"
      >
        <InstallButton />
      </motion.section>
    </main>
  );
}
