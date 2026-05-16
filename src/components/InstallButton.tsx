"use client";

import { useEffect, useState } from "react";
import { Download, Check, Share } from "lucide-react";
import { useLang } from "@/lib/i18n";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

declare global {
  interface Window {
    __bip?: BIPEvent | null;
    __bipInstalled?: boolean;
  }
}

export function InstallButton() {
  const { t } = useLang();
  const [hasPrompt, setHasPrompt] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true ||
      window.__bipInstalled === true;
    if (standalone) {
      setInstalled(true);
      return;
    }

    const ua = window.navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);
    const webkit = /webkit/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
    setIsIOS(ios && webkit);

    // Event je možda već uhvaćen inline skriptom prije hidratacije.
    setHasPrompt(!!window.__bip);

    const onChange = () => {
      setHasPrompt(!!window.__bip);
      if (window.__bipInstalled) setInstalled(true);
    };
    window.addEventListener("bipchange", onChange);
    window.addEventListener("appinstalled", onChange);
    return () => {
      window.removeEventListener("bipchange", onChange);
      window.removeEventListener("appinstalled", onChange);
    };
  }, []);

  async function onClick() {
    const evt = window.__bip;
    if (evt && !isIOS) {
      await evt.prompt();
      await evt.userChoice.catch(() => null);
      window.__bip = null;
      setHasPrompt(false);
      return;
    }
    setShowHelp((v) => !v);
  }

  if (installed) {
    return (
      <div className="card-soft flex items-center gap-3 p-4">
        <span className="grid place-items-center size-10 rounded-2xl bg-mint-wash text-mint-deep flex-none">
          <Check className="size-5" strokeWidth={3} />
        </span>
        <p className="font-semibold text-[0.95rem]">{t("install.installed")}</p>
      </div>
    );
  }

  const subtitle = isIOS
    ? t("install.ios")
    : hasPrompt
      ? t("install.sub")
      : t("install.hint");

  return (
    <div>
      <button
        onClick={onClick}
        className="w-full card-soft lift flex items-center gap-3.5 p-4 text-left"
      >
        <span className="grid place-items-center size-12 flex-none rounded-2xl bg-mint text-white shadow-[0_8px_18px_-8px_color-mix(in_srgb,var(--mint)_85%,transparent)]">
          {isIOS ? (
            <Share className="size-6" />
          ) : (
            <Download className="size-6" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display font-extrabold text-[1.05rem] leading-tight">
            {t("install.cta")}
          </span>
          <span className="block text-[0.82rem] text-ink-soft leading-tight mt-0.5">
            {subtitle}
          </span>
        </span>
      </button>

      {showHelp && (
        <div className="mt-2 rounded-2xl bg-mint-wash/70 p-3.5 text-sm text-ink leading-relaxed">
          {isIOS ? t("install.iosSteps") : t("install.help")}
        </div>
      )}
    </div>
  );
}
