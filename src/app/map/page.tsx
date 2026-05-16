"use client";

import { useEffect, useMemo, useState } from "react";
import { Map, Marker } from "react-map-gl/maplibre";
import { Navigation, LocateFixed, Phone } from "lucide-react";
import {
  SPLIT_CENTER,
  withDistance,
  directionsUrl,
  SITE_META,
  type SiteKind,
  type WasteSite,
} from "@/lib/locations";
import { useLang } from "@/lib/i18n";
import { LangToggle } from "@/components/LangToggle";

type Filter = "sve" | SiteKind;

const FILTERS: { key: Filter; tkey: string }[] = [
  { key: "sve", tkey: "map.fAll" },
  { key: "povrat", tkey: "map.fPovrat" },
  { key: "dvoriste", tkey: "map.fDvoriste" },
  { key: "mobilno", tkey: "map.fMobilno" },
  { key: "otok", tkey: "map.fOtok" },
];

const FILTER_KEYS: Filter[] = [
  "sve",
  "povrat",
  "dvoriste",
  "mobilno",
  "otok",
];

export default function MapPage() {
  const { t } = useLang();
  const [pos, setPos] = useState(SPLIT_CENTER);
  const [located, setLocated] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("sve");

  // Deep-link iz npr. rezultata skena: /map?vrsta=povrat
  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get("vrsta");
    if (v && (FILTER_KEYS as string[]).includes(v)) setFilter(v as Filter);
  }, []);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        setLocated(true);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 6000 },
    );
  }, []);

  const all = useMemo(() => withDistance(pos), [pos]);
  const sites = useMemo(
    () => (filter === "sve" ? all : all.filter((s) => s.kind === filter)),
    [all, filter],
  );
  const nearest = sites[0];

  return (
    <main className="flex-1 flex flex-col">
      <header className="px-6 pt-7">
        <div className="flex items-start justify-between">
          <span className="label">{t("map.eyebrow")}</span>
          <LangToggle />
        </div>
        <h1 className="font-display text-[2rem] leading-tight mt-1.5 font-extrabold tracking-[-0.02em]">
          {t("map.title")}
        </h1>
        <p className="text-ink-soft text-[0.92rem] leading-relaxed mt-2 max-w-[21rem]">
          {t("map.subtitle")}
        </p>
      </header>

      {/* Filter rail */}
      <div className="mt-4 px-6 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((f) => {
          const on = filter === f.key;
          const count =
            f.key === "sve"
              ? all.length
              : all.filter((s) => s.kind === f.key).length;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="chip"
              style={
                on
                  ? {
                      background: "var(--mint)",
                      color: "#fff",
                      borderColor: "var(--mint)",
                    }
                  : undefined
              }
            >
              {f.key !== "sve" && (
                <span
                  className="size-2 rounded-full"
                  style={{
                    background: on ? "#fff" : SITE_META[f.key].color,
                  }}
                />
              )}
              {t(f.tkey)}
              <span className="opacity-70">· {count}</span>
            </button>
          );
        })}
      </div>

      <div className="mx-5 mt-4 h-[320px] overflow-hidden rounded-[var(--radius)] border border-line">
        <Map
          initialViewState={{
            longitude: SPLIT_CENTER.lng,
            latitude: SPLIT_CENTER.lat,
            zoom: 11.2,
          }}
          mapStyle="https://tiles.openfreemap.org/styles/bright"
          attributionControl={false}
        >
          {located && (
            <Marker longitude={pos.lng} latitude={pos.lat}>
              <span className="block size-4 rounded-full bg-mint ring-4 ring-mint/25" />
            </Marker>
          )}
          {sites.map((s) => {
            const sel = active === s.id;
            const isNear = nearest && s.id === nearest.id;
            return (
              <Marker
                key={s.id}
                longitude={s.lng}
                latitude={s.lat}
                onClick={() => setActive(s.id)}
              >
                <span
                  className="block rounded-full border-2 border-white cursor-pointer transition-transform"
                  style={{
                    background: SITE_META[s.kind].color,
                    width: sel || isNear ? 18 : 12,
                    height: sel || isNear ? 18 : 12,
                    boxShadow: sel
                      ? "0 0 0 4px rgba(15,184,160,0.35)"
                      : "0 1px 3px rgba(0,0,0,0.35)",
                  }}
                />
              </Marker>
            );
          })}
        </Map>
      </div>

      <div className="px-6 mt-3 flex items-center justify-between text-ink-soft text-xs">
        <span className="flex items-center gap-1.5">
          <LocateFixed className="size-3.5" />
          {located ? t("map.yourLoc") : t("map.fromCenter")}
        </span>
        <span>{t("map.count", { n: sites.length })}</span>
      </div>

      <section className="px-5 mt-3 space-y-3 pb-6">
        {sites.map((s, i) => (
          <SiteCard
            key={s.id}
            s={s}
            nearest={i === 0}
            open={active === s.id}
            onOpen={() => setActive(active === s.id ? null : s.id)}
          />
        ))}
      </section>
    </main>
  );
}

function SiteCard({
  s,
  nearest,
  open,
  onOpen,
}: {
  s: WasteSite & { km: number };
  nearest: boolean;
  open: boolean;
  onOpen: () => void;
}) {
  const { t } = useLang();
  const meta = SITE_META[s.kind];
  return (
    <div className={`panel lift p-4 ${open ? "ring-2 ring-mint/40" : ""}`}>
      <button onClick={onOpen} className="w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span
              className="inline-flex items-center gap-1.5 label"
              style={{ color: meta.color }}
            >
              <span
                className="size-2 rounded-full"
                style={{ background: meta.color }}
              />
              {nearest ? t("map.nearest") : t(`kind.${s.kind}`)}
            </span>
            <p className="font-display text-lg leading-tight mt-1 font-extrabold">
              {s.name}
            </p>
            <p className="text-sm text-ink-soft mt-0.5">{s.address}</p>
            {s.hours && (
              <p className="mono text-xs text-ink-soft mt-1">{s.hours}</p>
            )}
          </div>
          <span className="mono text-sm font-semibold whitespace-nowrap">
            {s.km < 1
              ? `${Math.round(s.km * 1000)} m`
              : `${s.km.toFixed(1)} km`}
          </span>
        </div>
      </button>

      {open && (
        <div className="mt-3 pt-3 border-t border-line">
          <div className="flex flex-wrap gap-1.5">
            {s.fractions.map((f) => (
              <span
                key={f}
                className="rounded-full bg-secondary px-2.5 py-1 text-[0.7rem] font-semibold text-ink-soft"
              >
                {f}
              </span>
            ))}
          </div>
          {s.approx && (
            <p className="text-[0.7rem] text-ink-soft/80 mt-2 leading-snug">
              {t("map.approx")}
            </p>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center gap-4">
        <a
          href={directionsUrl(s)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-mint-deep"
        >
          <Navigation className="size-4" />
          {t("map.directions")}
        </a>
        {s.phone && (
          <a
            href={`tel:${s.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft"
          >
            <Phone className="size-4" />
            {s.phone}
          </a>
        )}
      </div>
    </div>
  );
}
