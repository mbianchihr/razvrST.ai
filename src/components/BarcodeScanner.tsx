"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { DecodeHintType, BarcodeFormat } from "@zxing/library";
import { X, CameraOff, Camera } from "lucide-react";

type Props = {
  onResult: (barcode: string) => void;
  onClose: () => void;
  onManual: () => void;
  onSwitchToPhoto: () => void;
};

type Phase = "starting" | "scanning" | "error";

export function BarcodeScanner({
  onResult,
  onClose,
  onManual,
  onSwitchToPhoto,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>("starting");
  const [error, setError] = useState("");
  const [slow, setSlow] = useState(false);
  const firedRef = useRef(false);

  // onResult/onClose mijenjaju identitet pri svakom renderu roditelja —
  // drži ih u refu da se kamera NE re-inicijalizira (inače "play()
  // interrupted" i kamera se ne otvori).
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 7000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let controls: { stop: () => void } | undefined;
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
        const hints = new Map();
        hints.set(DecodeHintType.TRY_HARDER, true);
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.CODE_128,
          BarcodeFormat.CODE_39,
        ]);
        const reader = new BrowserMultiFormatReader(hints, {
          delayBetweenScanAttempts: 80,
          delayBetweenScanSuccess: 400,
        });
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: "environment" } } },
          videoRef.current!,
          (result) => {
            if (result && !firedRef.current) {
              firedRef.current = true;
              controls?.stop();
              onResultRef.current(result.getText());
            }
          },
        );
        if (cancelled) controls.stop();
        else setPhase("scanning");
      } catch (e) {
        setError(
          (e as { name?: string })?.name === "NotAllowedError"
            ? "Dopuštenje za kameru je odbijeno."
            : "Ne mogu pokrenuti kameru.",
        );
        setPhase("error");
        console.error("[scanner]", e);
      }
    })();

    return () => {
      cancelled = true;
      controls?.stop();
    };
    // Inicijaliziraj kameru SAMO jednom (callbackovi idu kroz ref).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Bracket = ({ c }: { c: string }) => (
    <span className={`vf-corner absolute ${c} size-7 border-[#34e0a1]`} />
  );

  return (
    <div className="fixed inset-0 z-50 bg-ink flex flex-col">
      <div className="flex items-center justify-between px-5 pt-5 text-white">
        <span className="label" style={{ color: "rgba(255,255,255,.6)" }}>
          Barkod skener
        </span>
        <button
          onClick={onClose}
          aria-label="Zatvori"
          className="p-2 rounded-full bg-white/10 active:bg-white/20"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />

        {phase === "starting" && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="size-10 rounded-full border-2 border-white/25 border-t-white spin" />
          </div>
        )}

        {phase === "scanning" && (
          <div className="absolute inset-0 pointer-events-none grid place-items-center">
            <div className="relative w-[80%] h-40 rounded-2xl shadow-[0_0_0_9999px_rgba(12,31,23,0.55)]">
              <Bracket c="left-0 top-0 border-l-2 border-t-2 rounded-tl-xl" />
              <Bracket c="right-0 top-0 border-r-2 border-t-2 rounded-tr-xl" />
              <Bracket c="left-0 bottom-0 border-l-2 border-b-2 rounded-bl-xl" />
              <Bracket c="right-0 bottom-0 border-r-2 border-b-2 rounded-br-xl" />
              <div className="vf-line" />
            </div>
          </div>
        )}

        {phase === "error" && (
          <div className="absolute inset-0 grid place-items-center px-9 text-center">
            <div className="flex flex-col items-center gap-3">
              <CameraOff className="size-10 text-white/60" />
              <p className="text-white/85 text-sm leading-relaxed">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Always-available fallback to photo / AI */}
      <div className="px-5 pb-9 pt-5 bg-ink space-y-3">
        {phase === "scanning" && (
          <p className="text-center text-white/70 text-sm">
            {slow
              ? "Ne čita? Primakni barkod, više svjetla — ili snimi predmet ↓"
              : "Usmjeri kameru na barkod (cca 10–20 cm)"}
          </p>
        )}
        <button
          onClick={onSwitchToPhoto}
          className="w-full flex items-center justify-center gap-2.5 bg-mint text-white font-semibold py-4 rounded-full active:scale-[0.98] transition-transform"
        >
          <Camera className="size-5" />
          Ne čita barkod? Snimi predmet
        </button>
        <button
          onClick={onManual}
          className="w-full text-white/55 text-xs py-1"
        >
          ▸ demo proizvod
        </button>
      </div>
    </div>
  );
}
