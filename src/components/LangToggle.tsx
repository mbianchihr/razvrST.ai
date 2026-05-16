"use client";

import { useLang, type Lang } from "@/lib/i18n";

const LANGS: Lang[] = ["hr", "en"];

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-card p-0.5 shadow-[var(--shadow-1)]">
      {LANGS.map((l) => {
        const on = lang === l;
        return (
          <button
            key={l}
            onClick={() => setLang(l)}
            aria-pressed={on}
            className="px-2.5 py-1 rounded-full text-[0.66rem] font-bold tracking-wide transition-colors"
            style={{
              background: on ? "var(--mint)" : "transparent",
              color: on ? "#fff" : "var(--ink-soft)",
            }}
          >
            {l.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
