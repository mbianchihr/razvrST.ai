"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ScanBarcode,
  Sparkles,
  ArrowUpRight,
  Leaf,
  MapPin,
  ArrowRight,
  Camera,
  Layers,
  Crosshair,
  Check,
} from "lucide-react";
import { nanoid } from "nanoid";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { CameraCapture } from "@/components/CameraCapture";
import { Logo } from "@/components/Logo";
import { SplitMiniMap } from "@/components/SplitMiniMap";
import { SITES } from "@/lib/locations";
import { saveScan } from "@/lib/storage";
import { STATS } from "@/lib/stats";
import { useLang } from "@/lib/i18n";
import { LangToggle } from "@/components/LangToggle";
import type { ScanResult, DetectionHint } from "@/lib/types";

const STEP_KEYS = ["scan.step0", "scan.step1", "scan.step2", "scan.step3"];

type Mode = "idle" | "barcode" | "camera";

type ScanPayload = ScanResult & {
  box?: [number, number, number, number] | null;
  multipleItems?: boolean;
  targetConfident?: boolean;
  otherItems?: string[];
};

const ease = [0.22, 1, 0.36, 1] as const;

export default function Home() {
  const router = useRouter();
  const { t } = useLang();
  const [mode, setMode] = useState<Mode>("idle");
  const [step, setStep] = useState(-1);
  const [shot, setShot] = useState<string | null>(null);
  const [ambiguous, setAmbiguous] = useState<{
    img: string;
    data: ScanPayload;
  } | null>(null);

  function fail() {
    setStep(-1);
    setShot(null);
    alert(t("scan.fail"));
  }

  async function onBarcode(b: string) {
    setMode("idle");
    setStep(0);
    const t1 = setTimeout(() => setStep(1), 800);
    const t2 = setTimeout(() => setStep(3), 1700);
    try {
      const res = await fetch(`/api/product/${encodeURIComponent(b)}`);
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const scan: ScanResult = {
        ...data,
        userImage: null,
        id: nanoid(12),
        scannedAt: Date.now(),
      };
      await new Promise((r) => setTimeout(r, 2200));
      saveScan(scan);
      router.push(`/results/${scan.id}`);
    } catch {
      fail();
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
    }
  }

  async function onPhoto(img: string, hint?: DetectionHint) {
    setMode("idle");
    setAmbiguous(null);
    setShot(img);
    setStep(0);
    const t1 = setTimeout(() => setStep(1), 850);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: img, hint: hint ?? null }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      clearTimeout(t1);

      // Više predmeta i nije jasno koji je u sredini → pitaj korisnika.
      if (data.multipleItems && !data.targetConfident) {
        setStep(-1);
        setShot(null);
        setAmbiguous({ img, data });
        return;
      }

      await finalizePhoto(img, data);
    } catch {
      fail();
    } finally {
      clearTimeout(t1);
    }
  }

  async function finalizePhoto(img: string, data: ScanPayload) {
    // Bez rezanja/izrezivanja — sprema se cijela snimka kakva jest.
    setAmbiguous(null);
    setShot(img);
    setStep(2);
    try {
      setStep(3);
      const scan: ScanResult = {
        ...data,
        userImage: img,
        id: nanoid(12),
        scannedAt: Date.now(),
      };
      await new Promise((r) => setTimeout(r, 700));
      saveScan(scan);
      router.push(`/results/${scan.id}`);
    } catch {
      fail();
    }
  }

  if (ambiguous) {
    const a = ambiguous;
    const items = [a.data.name, ...(a.data.otherItems ?? [])].filter(Boolean);
    return (
      <main className="flex-1 flex flex-col justify-center px-7 py-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
          className="card-soft p-6"
        >
          <span className="grid place-items-center size-12 rounded-2xl bg-mint-wash text-mint-deep">
            <Layers className="size-6" />
          </span>
          <h1 className="font-display text-2xl font-extrabold mt-4 leading-tight">
            {t("amb.title")}
          </h1>
          <p className="text-ink-soft text-[0.95rem] leading-relaxed mt-2">
            {t("amb.desc")}
          </p>

          <div className="mt-4 rounded-2xl bg-secondary/60 p-3.5">
            <span className="label">{t("amb.recognised")}</span>
            <ul className="mt-2 space-y-1.5">
              {items.map((it, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <span
                    className="size-1.5 rounded-full flex-none"
                    style={{
                      background: i === 0 ? "var(--mint)" : "var(--ink-soft)",
                    }}
                  />
                  {it}
                  {i === 0 && (
                    <span className="label ml-1 text-mint-deep">
                      {t("amb.center")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => {
              setAmbiguous(null);
              setMode("camera");
            }}
            className="btn-primary w-full mt-5 py-3.5 flex items-center justify-center gap-2 text-sm"
          >
            <Camera className="size-5" />
            {t("amb.retake")}
          </button>
          <button
            onClick={() => finalizePhoto(a.img, a.data)}
            className="w-full mt-2.5 py-3 flex items-center justify-center gap-2 text-sm font-semibold rounded-full border border-line bg-card"
          >
            <Crosshair className="size-4 text-mint" />
            {t("amb.continueWith", { name: a.data.name })}
          </button>
          <button
            onClick={() => setAmbiguous(null)}
            className="w-full mt-2 label py-2 hover:text-ink"
          >
            {t("amb.cancel")}
          </button>
        </motion.div>
      </main>
    );
  }

  if (step >= 0) {
    const pct = Math.round(((step + 1) / STEP_KEYS.length) * 100);
    return (
      <main className="relative flex-1 flex flex-col items-center justify-center px-7 overflow-hidden">
        <div
          className="blob absolute -z-10 -top-20 -right-24 size-72 rounded-full"
          style={{
            background: "color-mix(in srgb, var(--mint) 22%, transparent)",
          }}
        />
        <div
          className="blob absolute -z-10 -bottom-24 -left-24 size-72 rounded-full"
          style={{ background: "color-mix(in srgb, #19d6bc 16%, transparent)" }}
        />

        <motion.span
          className="label inline-flex items-center gap-2 text-mint-deep"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
        >
          <Sparkles className="size-3.5" />
          {t("scan.eyebrow")}
        </motion.span>

        {/* Captured media */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease }}
          className="relative mt-5 w-full max-w-[270px] aspect-[4/5] card-soft overflow-hidden"
        >
          {shot ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={shot}
                alt={t("scan.yourShot")}
                className="scan-pulse absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-white/10" />
            </>
          ) : (
            <div
              className="absolute inset-0 grid place-items-center"
              style={{
                background:
                  "radial-gradient(circle at 50% 38%, #ffffff, var(--mint-wash))",
              }}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <ScanBarcode className="size-20 text-mint-deep" strokeWidth={1.4} />
              </motion.div>
            </div>
          )}
          <div className="scanline" />
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/85 backdrop-blur px-2.5 py-1 text-[0.58rem] font-bold tracking-[0.12em] text-mint-deep">
            <span className="size-1.5 rounded-full bg-mint animate-pulse" />
            {shot ? t("scan.yourShot") : t("scan.barcode")}
          </span>
        </motion.div>

        {/* Live step label */}
        <div className="mt-7 h-9 overflow-hidden text-center">
          <AnimatePresence mode="wait">
            <motion.h1
              key={step}
              className="font-display text-[1.6rem] font-extrabold leading-none"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease }}
            >
              {t(STEP_KEYS[Math.min(step, STEP_KEYS.length - 1)])}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* Checklist */}
        <div className="mt-6 w-full max-w-[280px] space-y-2">
          {STEP_KEYS.map((s, i) => {
            const done = i < step;
            const now = i === step;
            return (
              <div
                key={i}
                className="flex items-center gap-3 rounded-2xl px-3 py-2 transition-colors"
                style={{
                  background: now ? "var(--mint-wash)" : "transparent",
                }}
              >
                <span
                  className="grid place-items-center size-6 rounded-full flex-none transition-all"
                  style={{
                    background:
                      done || now ? "var(--mint)" : "var(--secondary)",
                    color: done || now ? "#fff" : "var(--ink-soft)",
                  }}
                >
                  {done ? (
                    <Check className="size-3.5" strokeWidth={3} />
                  ) : now ? (
                    <span className="size-3 rounded-full border-2 border-white/40 border-t-white spin" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-current" />
                  )}
                </span>
                <span
                  className="text-[0.95rem] font-semibold transition-opacity"
                  style={{
                    opacity: done ? 0.55 : now ? 1 : 0.4,
                    color: now ? "var(--mint-deep)" : "var(--ink)",
                  }}
                >
                  {t(s)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress */}
        <div className="mt-6 w-full max-w-[280px]">
          <div className="flex items-center justify-between text-[0.72rem] font-bold mb-1.5">
            <span className="label">{t("scan.progress")}</span>
            <span className="mono text-mint-deep">{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <motion.span
              className="block h-full rounded-full bg-mint"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease }}
            />
          </div>
        </div>
      </main>
    );
  }

  const CATS = [
    { k: "Plastika", c: "var(--s-C)" },
    { k: "Staklo", c: "var(--s-A)" },
    { k: "Papir", c: "var(--mint)" },
    { k: "Bio", c: "var(--s-B)" },
    { k: "Metal", c: "var(--ink-soft)" },
    { k: "Tekstil", c: "var(--s-D)" },
  ];

  return (
    <main className="relative flex-1 flex flex-col overflow-hidden">
      {/* ambient turquoise wash */}
      <div
        className="blob absolute -z-10 -top-24 -right-24 size-72 rounded-full"
        style={{ background: "color-mix(in srgb, var(--mint) 22%, transparent)" }}
      />
      <div
        className="blob absolute -z-10 top-1/3 -left-28 size-64 rounded-full"
        style={{ background: "color-mix(in srgb, #19d6bc 16%, transparent)" }}
      />

      <motion.header
        className="px-6 pt-6"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <LangToggle />
            <span className="chip text-mint-deep">
              <MapPin className="size-3.5 text-mint" />
              Split
            </span>
          </div>
        </div>
      </motion.header>

      <div className="flex-1 flex flex-col px-6 pt-9 pb-8">
        <motion.span
          className="label inline-flex items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease }}
        >
          <Leaf className="size-3.5 text-mint" />
          {t("home.eyebrow")}
        </motion.span>
        <motion.h1
          className="mt-3 font-display text-[3rem] leading-[0.96] font-extrabold tracking-[-0.03em]"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.55, ease }}
        >
          {t("home.title1")}
          <br />
          <span className="text-mint">{t("home.title2")}</span>
        </motion.h1>
        <motion.p
          className="mt-4 text-ink-soft text-[1.02rem] leading-relaxed max-w-[20rem]"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.46, duration: 0.55, ease }}
        >
          {t("home.subtitle")}
        </motion.p>

        {/* Unified scan console — snimi proizvod ILI barkod, jedan element */}
        <motion.div
          className="mt-8 w-full card-soft lift overflow-hidden"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.54, duration: 0.55, ease }}
        >
          <button
            onClick={() => setMode("camera")}
            className="w-full flex items-center gap-3.5 px-4 py-4 text-left active:bg-mint-wash/50 transition-colors"
          >
            <span className="grid place-items-center size-12 flex-none rounded-2xl bg-mint text-white shadow-[0_8px_18px_-8px_color-mix(in_srgb,var(--mint)_85%,transparent)]">
              <Camera className="size-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display font-extrabold text-[1.12rem] leading-tight">
                {t("home.scanProduct")}
              </span>
              <span className="block text-[0.82rem] text-ink-soft leading-tight mt-0.5">
                {t("home.scanProductSub")}
              </span>
            </span>
            <ArrowUpRight className="size-5 text-mint flex-none" />
          </button>

          <div className="mx-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="label text-[0.56rem]">{t("home.or")}</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <button
            onClick={() => setMode("barcode")}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left active:bg-mint-wash/50 transition-colors"
          >
            <span className="grid place-items-center size-12 flex-none rounded-2xl bg-mint-wash text-mint-deep">
              <ScanBarcode className="size-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-[1rem] leading-tight">
                {t("home.scanBarcode")}
              </span>
              <span className="block text-[0.8rem] text-ink-soft leading-tight mt-0.5">
                {t("home.scanBarcodeSub")}
              </span>
            </span>
            <ArrowUpRight className="size-5 text-ink-soft flex-none" />
          </button>
        </motion.div>

        <motion.button
          onClick={() => onBarcode("5449000054227")}
          className="mt-3.5 self-center label py-1.5 text-mint-deep"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.68, duration: 0.5, ease }}
        >
          {t("home.demo")}
        </motion.button>

        {/* Category rail */}
        <motion.div
          className="mt-8 -mx-6 px-6 flex gap-2.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.74, duration: 0.55, ease }}
        >
          {CATS.map((c) => (
            <span key={c.k} className="chip">
              <span
                className="size-2 rounded-full"
                style={{ background: c.c }}
              />
              {t(`cat.${c.k}`)}
            </span>
          ))}
        </motion.div>

        {/* Explore Split — liftable card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.82, duration: 0.6, ease }}
          className="mt-7"
        >
          <Link
            href="/map"
            className="relative block w-full h-[200px] card-soft lift overflow-hidden"
          >
            <SplitMiniMap />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink/60 to-transparent pointer-events-none" />
            <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-mint-deep">
              <span className="size-1.5 rounded-full bg-mint" />
              <span className="text-[0.62rem] font-bold tracking-[0.16em]">
                SPLIT
              </span>
            </span>
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
              <div>
                <div className="text-[0.6rem] font-semibold tracking-widest opacity-80">
                  {t("home.splitSorts")}
                </div>
                <div className="font-display text-3xl font-extrabold leading-none">
                  ≈ {STATS.splitSeparatedPct}%
                </div>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3 py-1.5 text-[0.68rem] font-semibold">
                {t("home.locations", { n: SITES.length })}
                <ArrowRight className="size-3.5" />
              </span>
            </div>
          </Link>
        </motion.div>
      </div>

      {mode === "barcode" && (
        <BarcodeScanner
          onResult={onBarcode}
          onClose={() => setMode("idle")}
          onManual={() => onBarcode("5449000054227")}
          onSwitchToPhoto={() => setMode("camera")}
        />
      )}
      {mode === "camera" && (
        <CameraCapture onCapture={onPhoto} onClose={() => setMode("idle")} />
      )}
    </main>
  );
}
