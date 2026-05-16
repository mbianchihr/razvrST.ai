"use client";

import { useEffect, useRef, useState } from "react";
import { X, CameraOff, Aperture, ScanSearch } from "lucide-react";
import {
  loadDetector,
  pickPrimary,
  labelHr,
  type DetectedObject,
} from "@/lib/detector";
import type { DetectionHint } from "@/lib/types";

type Props = {
  onCapture: (base64Jpeg: string, hint?: DetectionHint) => void;
  onClose: () => void;
};

type Phase = "starting" | "ready" | "error";
type Rect = [number, number, number, number]; // x,y,w,h in video px

export function CameraCapture({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<Phase>("starting");
  const [error, setError] = useState("");

  const [detReady, setDetReady] = useState(false);
  const [detFailed, setDetFailed] = useState(false);
  const [hasBox, setHasBox] = useState(false);

  const cancelledRef = useRef(false);
  // target = zadnji detektirani okvir (video px) + vrijeme; cur = prikazani
  const targetRef = useRef<{ bbox: Rect | null; ts: number }>({
    bbox: null,
    ts: 0,
  });
  const curRef = useRef<Rect | null>(null);
  const shownRef = useRef(false);
  const hasBoxRef = useRef(false);
  // Zadnji on-device prepoznati predmet (za slanje Geminiju).
  const lastDetRef = useRef<{ o: DetectedObject; ts: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          window.isSecureContext
            ? "Kamera nije dostupna na ovom uređaju."
            : "Kamera radi samo preko HTTPS linka.",
        );
        setPhase("error");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setPhase("ready");
      } catch (e) {
        setError(
          (e as { name?: string })?.name === "NotAllowedError"
            ? "Dopuštenje za kameru je odbijeno."
            : "Ne mogu pokrenuti kameru.",
        );
        setPhase("error");
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Detekcija (on-device) + glatka stabilizacija jednog okvira.
  useEffect(() => {
    if (phase !== "ready") return;
    cancelledRef.current = false;
    let detTimer: ReturnType<typeof setTimeout>;
    let raf = 0;

    // object-cover mapiranje video-px → ekran-px, uz CLAMP unutar kadra.
    const toScreen = (bb: Rect) => {
      const v = videoRef.current;
      const wrap = wrapRef.current;
      if (!v || !wrap || !v.videoWidth) return null;
      const cW = wrap.clientWidth;
      const cH = wrap.clientHeight;
      const scale = Math.max(cW / v.videoWidth, cH / v.videoHeight);
      const offX = (v.videoWidth * scale - cW) / 2;
      const offY = (v.videoHeight * scale - cH) / 2;
      let x = bb[0] * scale - offX;
      let y = bb[1] * scale - offY;
      let w = bb[2] * scale;
      let h = bb[3] * scale;
      // Drži okvir UNUTAR vidljivog kadra (nikad off-screen).
      const x2 = Math.min(cW, Math.max(0, x + w));
      const y2 = Math.min(cH, Math.max(0, y + h));
      x = Math.min(cW, Math.max(0, x));
      y = Math.min(cH, Math.max(0, y));
      w = x2 - x;
      h = y2 - y;
      return w > 8 && h > 8 ? { x, y, w, h } : null;
    };

    const render = () => {
      if (cancelledRef.current) return;
      const now = performance.now();
      const tgt = targetRef.current;
      const fresh = !!tgt.bbox && now - tgt.ts < 900;
      const el = boxRef.current;

      if (fresh && tgt.bbox) {
        if (!shownRef.current || !curRef.current) {
          curRef.current = [...tgt.bbox] as Rect; // snap pri (re)hvatanju
        } else {
          const c = curRef.current;
          for (let i = 0; i < 4; i++)
            c[i] += (tgt.bbox[i] - c[i]) * 0.22; // lerp = bez skakanja
        }
        shownRef.current = true;
        if (el) {
          const s = toScreen(curRef.current);
          if (s) {
            el.style.transform = `translate(${s.x}px, ${s.y}px)`;
            el.style.width = `${s.w}px`;
            el.style.height = `${s.h}px`;
            el.style.opacity = "1";
          } else {
            el.style.opacity = "0";
          }
        }
      } else {
        shownRef.current = false;
        if (el) el.style.opacity = "0";
      }

      if (fresh !== hasBoxRef.current) {
        hasBoxRef.current = fresh;
        setHasBox(fresh);
      }
      raf = requestAnimationFrame(render);
    };

    (async () => {
      let model;
      try {
        model = await loadDetector();
      } catch {
        setDetFailed(true);
        return;
      }
      if (cancelledRef.current) return;
      setDetReady(true);
      raf = requestAnimationFrame(render);

      const detect = async () => {
        if (cancelledRef.current) return;
        const v = videoRef.current;
        if (v && v.videoWidth && v.readyState >= 2) {
          try {
            const preds: DetectedObject[] = await model.detect(v, 5);
            if (cancelledRef.current) return;
            const { primary } = pickPrimary(
              preds,
              v.videoWidth,
              v.videoHeight,
            );
            if (primary) {
              const now = performance.now();
              targetRef.current = { bbox: primary.bbox as Rect, ts: now };
              lastDetRef.current = { o: primary, ts: now };
            }
          } catch {
            /* preskoči frame */
          }
        }
        detTimer = setTimeout(detect, 240);
      };
      detect();
    })();

    return () => {
      cancelledRef.current = true;
      clearTimeout(detTimer!);
      cancelAnimationFrame(raf);
    };
  }, [phase]);

  function shoot() {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const maxW = 960;
    const scale = Math.min(1, maxW / v.videoWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(v.videoWidth * scale);
    canvas.height = Math.round(v.videoHeight * scale);
    canvas.getContext("2d")!.drawImage(v, 0, 0, canvas.width, canvas.height);

    // Spakiraj zadnju on-device detekciju kao hint Geminiju.
    let hint: DetectionHint | undefined;
    const ld = lastDetRef.current;
    if (ld && performance.now() - ld.ts < 1500) {
      const [bx, by, bw, bh] = ld.o.bbox;
      const vw = v.videoWidth;
      const vh = v.videoHeight;
      const n = (val: number) => Math.round(Math.min(1000, Math.max(0, val)));
      hint = {
        cls: ld.o.class,
        label: labelHr(ld.o.class),
        score: Math.round(ld.o.score * 100) / 100,
        box: [
          n((by / vh) * 1000),
          n((bx / vw) * 1000),
          n(((by + bh) / vh) * 1000),
          n(((bx + bw) / vw) * 1000),
        ],
      };
    }

    cancelledRef.current = true;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    onCapture(canvas.toDataURL("image/jpeg", 0.82), hint);
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink flex flex-col">
      <div className="flex items-center justify-between px-5 pt-5 text-white">
        <span className="label inline-flex items-center gap-2 text-white/70">
          <ScanSearch className="size-4" />
          {detFailed
            ? "AI prepoznavanje"
            : detReady
              ? "Detekcija na uređaju"
              : "Učitavam detekciju…"}
        </span>
        <button
          onClick={onClose}
          aria-label="Zatvori"
          className="p-2 rounded-full bg-white/10 active:bg-white/20"
        >
          <X className="size-5" />
        </button>
      </div>

      <div ref={wrapRef} className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />

        {phase === "starting" && (
          <div className="absolute inset-0 grid place-items-center text-white/80">
            <div className="size-10 rounded-full border-2 border-white/25 border-t-white spin" />
          </div>
        )}

        {/* Jedan, stabilan, prominentan okvir — bez teksta */}
        <div
          ref={boxRef}
          className="absolute top-0 left-0 rounded-2xl pointer-events-none"
          style={{
            opacity: 0,
            transition: "opacity 200ms ease",
            border: "3px solid var(--mint)",
            boxShadow:
              "0 0 0 9999px rgba(20,36,29,0.42), 0 0 26px 3px color-mix(in srgb, var(--mint) 55%, transparent)",
            willChange: "transform, width, height, opacity",
          }}
        />

        {/* Fallback statični okvir ako model nije dostupan */}
        {phase === "ready" && detFailed && (
          <div className="absolute inset-0 pointer-events-none grid place-items-center">
            <div className="w-[70%] aspect-square rounded-3xl border border-white/40 shadow-[0_0_0_9999px_rgba(20,36,29,0.5)]" />
          </div>
        )}

        {phase === "ready" && (
          <div className="absolute bottom-[26px] left-0 right-0 flex justify-center px-8 pointer-events-none">
            <span
              className="rounded-full px-4 py-2 text-sm font-semibold text-white backdrop-blur"
              style={{
                background: hasBox
                  ? "color-mix(in srgb, var(--mint) 80%, transparent)"
                  : "rgba(20,36,29,0.6)",
              }}
            >
              {detFailed
                ? "Postavi proizvod u okvir i snimi"
                : hasBox
                  ? "Predmet u kadru — možeš snimiti"
                  : "Usmjeri kameru na predmet"}
            </span>
          </div>
        )}

        {phase === "error" && (
          <div className="absolute inset-0 grid place-items-center px-10 text-center">
            <div className="flex flex-col items-center gap-4">
              <CameraOff className="size-10 text-white/60" />
              <p className="text-white/80 text-sm">{error}</p>
              <button
                onClick={onClose}
                className="text-white underline underline-offset-4 text-sm"
              >
                Natrag
              </button>
            </div>
          </div>
        )}
      </div>

      {phase === "ready" && (
        <div className="pb-10 pt-6 grid place-items-center bg-ink">
          <button
            onClick={shoot}
            aria-label="Snimi"
            className="size-[74px] rounded-full bg-white grid place-items-center active:scale-95 transition-transform"
            style={{
              boxShadow: hasBox
                ? "0 0 0 4px color-mix(in srgb, var(--mint) 60%, transparent)"
                : "0 0 0 4px rgba(255,255,255,0.22)",
            }}
          >
            <Aperture className="size-8 text-ink" />
          </button>
        </div>
      )}
    </div>
  );
}
