"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "hr" | "en";

type Dict = Record<string, string>;

const HR: Dict = {
  "nav.scan": "Skeniraj",
  "nav.map": "Karta",
  "nav.footprint": "Otisak",

  "home.eyebrow": "Prije kupnje · ne poslije",
  "home.title1": "Skeniraj bilo što.",
  "home.title2": "Razvrstaj točno.",
  "home.subtitle":
    "Saznaj od čega je predmet, kako se razvrstava u Splitu i u koji kontejner ide.",
  "home.scanProduct": "Skeniraj proizvod",
  "home.scanProductSub": "AI prepoznaje bilo koji predmet",
  "home.or": "ili",
  "home.scanBarcode": "Skeniraj barkod",
  "home.scanBarcodeSub": "Brže za pakirane proizvode",
  "home.demo": "▸ Isprobaj s demo proizvodom",
  "home.splitSorts": "SPLIT RAZVRSTAVA",
  "home.locations": "{n} lokacija",

  "cat.Plastika": "Plastika",
  "cat.Staklo": "Staklo",
  "cat.Papir": "Papir",
  "cat.Bio": "Bio",
  "cat.Metal": "Metal",
  "cat.Tekstil": "Tekstil",

  "scan.eyebrow": "Analiza · AI",
  "scan.yourShot": "TVOJA SNIMKA",
  "scan.barcode": "BARKOD",
  "scan.progress": "Napredak",
  "scan.step0": "Učitavam snimku",
  "scan.step1": "Prepoznajem predmet",
  "scan.step2": "Analiziram materijale",
  "scan.step3": "Određujem spremnik",
  "scan.fail":
    "Analiza nije uspjela. Pokušaj ponovno ili skeniraj barkod.",

  "amb.title": "Vidim više predmeta",
  "amb.desc":
    "Ne mogu sa sigurnošću odrediti koji želiš razvrstati. Snimi samo jedan predmet, izbliza i u sredini kadra — ili nastavi s predmetom u sredini.",
  "amb.recognised": "Prepoznato na slici",
  "amb.center": "· u sredini",
  "amb.retake": "Snimi ponovno — jedan predmet",
  "amb.continueWith": "Nastavi s: {name}",
  "amb.cancel": "Odustani",

  "twin.eyebrow": "Tvoj otisak · Split",
  "twin.title": "Otpadni otisak",
  "twin.subtitle":
    "Svaki skenirani predmet ovdje se zbraja — koliko stvaraš, koliko ide u reciklažu i koliko time pomažeš Splitu.",
  "twin.savedLabel": "Stvarno spašeno od odlagališta",
  "twin.msgEmpty": "Skeniraj i označi prvi predmet da vidiš svoj učinak.",
  "twin.msgMore":
    "Još ≈ {g} g čeka — označi razvrstane predmete kad ih baciš.",
  "twin.msgAbove": "Sve razvrstano. {p} p.b. iznad prosjeka Splita — bravo!",
  "twin.msgAll": "Sve razvrstano. Nastavi tako!",
  "twin.scans": "SKENOVA",
  "twin.recycled": "RAZVRSTANO",
  "twin.thisWeek": "OVAJ TJEDAN",
  "twin.whereYouStand": "Koliko se razvrstava — i gdje si ti",
  "twin.barSplit": "Split (procjena)",
  "twin.barHr": "Hrvatska",
  "twin.barEu": "EU cilj 2025.",
  "twin.barYou": "Ti",
  "twin.footnote":
    "HR 2024.: 49% odvojeno, 37% reciklirano. EU cilj 55% recikliranja do 2025. Split/SDŽ među najnižima — procjena.",
  "twin.history": "Povijest skenova",
  "twin.entries": "{n} unosa",
  "twin.firstScan": "Skeniraj prvi predmet",
  "twin.historyHere": "Tvoja povijest pojavit će se ovdje.",
  "twin.sorted": "Razvrstano",

  "install.cta": "Instaliraj aplikaciju",
  "install.sub": "Dodaj razvrST.ai na početni zaslon",
  "install.hint": "U Chromeu: izbornik ⋮ → Instaliraj aplikaciju.",
  "install.ios": "Dodaj na početni zaslon (upute)",
  "install.iosSteps":
    "Otvori izbornik Dijeli (□↑) u Safariju pa odaberi „Dodaj na početni zaslon”.",
  "install.help":
    "Chrome (Android/desktop): izbornik ⋮ → „Instaliraj aplikaciju” ili ikona instalacije u adresnoj traci. Mora biti otvoreno preko HTTPS-a. Ako se ne pojavi odmah, koristi stranicu par sekundi pa pokušaj ponovno.",
  "install.installed": "Aplikacija je instalirana",

  "map.eyebrow": "Split · gdje odnijeti otpad",
  "map.title": "Karta razvrstavanja",
  "map.subtitle":
    "Reciklažna dvorišta, mobilna dvorišta, zeleni otoci i mjesta za povrat ambalaže.",
  "map.fAll": "Sve",
  "map.fPovrat": "Povrat ambalaže",
  "map.fDvoriste": "Dvorišta",
  "map.fMobilno": "Mobilna",
  "map.fOtok": "Zeleni otoci",
  "map.yourLoc": "Tvoja lokacija",
  "map.fromCenter": "Prikaz iz centra Splita",
  "map.count": "{n} lokacija",
  "map.nearest": "Najbliže tebi",
  "map.directions": "Kako doći →",
  "map.approx":
    "ⓘ Lokacija približna (kvart). Točan spremnik potraži na licu mjesta.",
  "kind.dvoriste": "Reciklažno dvorište",
  "kind.mobilno": "Mobilno reciklažno dvorište",
  "kind.otok": "Zeleni otok",
  "kind.gradevinski": "Građevinski otpad",
  "kind.povrat": "Povrat ambalaže",
};

const EN: Dict = {
  "nav.scan": "Scan",
  "nav.map": "Map",
  "nav.footprint": "Footprint",

  "home.eyebrow": "Before you buy · not after",
  "home.title1": "Scan anything.",
  "home.title2": "Sort it right.",
  "home.subtitle":
    "Find out what an item is made of, how it’s sorted in Split and which bin it goes in.",
  "home.scanProduct": "Scan product",
  "home.scanProductSub": "AI recognises any item",
  "home.or": "or",
  "home.scanBarcode": "Scan barcode",
  "home.scanBarcodeSub": "Faster for packaged products",
  "home.demo": "▸ Try a demo product",
  "home.splitSorts": "SPLIT SORTS",
  "home.locations": "{n} locations",

  "cat.Plastika": "Plastic",
  "cat.Staklo": "Glass",
  "cat.Papir": "Paper",
  "cat.Bio": "Bio",
  "cat.Metal": "Metal",
  "cat.Tekstil": "Textile",

  "scan.eyebrow": "Analysis · AI",
  "scan.yourShot": "YOUR SHOT",
  "scan.barcode": "BARCODE",
  "scan.progress": "Progress",
  "scan.step0": "Loading image",
  "scan.step1": "Recognising item",
  "scan.step2": "Analysing materials",
  "scan.step3": "Choosing the bin",
  "scan.fail": "Analysis failed. Try again or scan a barcode.",

  "amb.title": "I see multiple items",
  "amb.desc":
    "I can’t tell for sure which one you want to sort. Photograph just one item, up close and centred — or continue with the centred one.",
  "amb.recognised": "Recognised in the photo",
  "amb.center": "· centred",
  "amb.retake": "Retake — one item",
  "amb.continueWith": "Continue with: {name}",
  "amb.cancel": "Cancel",

  "twin.eyebrow": "Your footprint · Split",
  "twin.title": "Waste footprint",
  "twin.subtitle":
    "Every scanned item adds up here — how much you produce, how much gets recycled and how much you help Split.",
  "twin.savedLabel": "Actually saved from landfill",
  "twin.msgEmpty": "Scan and mark your first item to see your impact.",
  "twin.msgMore": "≈ {g} g more is waiting — mark items as sorted when you bin them.",
  "twin.msgAbove": "All sorted. {p} pp above Split’s average — nice!",
  "twin.msgAll": "All sorted. Keep it up!",
  "twin.scans": "SCANS",
  "twin.recycled": "SORTED",
  "twin.thisWeek": "THIS WEEK",
  "twin.whereYouStand": "How much gets sorted — and where you stand",
  "twin.barSplit": "Split (estimate)",
  "twin.barHr": "Croatia",
  "twin.barEu": "EU target 2025",
  "twin.barYou": "You",
  "twin.footnote":
    "Croatia 2024: 49% separated, 37% recycled. EU target 55% recycling by 2025. Split/SDŽ among the lowest — estimate.",
  "twin.history": "Scan history",
  "twin.entries": "{n} entries",
  "twin.firstScan": "Scan your first item",
  "twin.historyHere": "Your history will appear here.",
  "twin.sorted": "Sorted",

  "install.cta": "Install app",
  "install.sub": "Add razvrST.ai to your home screen",
  "install.hint": "In Chrome: menu ⋮ → Install app.",
  "install.ios": "Add to Home Screen (how to)",
  "install.iosSteps":
    "Open the Share menu (□↑) in Safari, then choose “Add to Home Screen”.",
  "install.help":
    "Chrome (Android/desktop): menu ⋮ → “Install app”, or the install icon in the address bar. Must be served over HTTPS. If it doesn’t show up right away, interact with the page for a few seconds and try again.",
  "install.installed": "App is installed",

  "map.eyebrow": "Split · where to take waste",
  "map.title": "Sorting map",
  "map.subtitle":
    "Recycling yards, mobile yards, green islands and deposit-return points.",
  "map.fAll": "All",
  "map.fPovrat": "Deposit return",
  "map.fDvoriste": "Yards",
  "map.fMobilno": "Mobile",
  "map.fOtok": "Green islands",
  "map.yourLoc": "Your location",
  "map.fromCenter": "Shown from Split centre",
  "map.count": "{n} locations",
  "map.nearest": "Nearest to you",
  "map.directions": "Directions →",
  "map.approx":
    "ⓘ Approximate location (neighbourhood). Find the exact container on site.",
  "kind.dvoriste": "Recycling yard",
  "kind.mobilno": "Mobile recycling yard",
  "kind.otok": "Green island",
  "kind.gradevinski": "Construction waste",
  "kind.povrat": "Deposit return",
};

const DICTS: Record<Lang, Dict> = { hr: HR, en: EN };

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LangCtx = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("hr");

  useEffect(() => {
    const saved =
      (typeof window !== "undefined" &&
        (localStorage.getItem("lang") as Lang | null)) ||
      null;
    if (saved === "hr" || saved === "en") setLangState(saved);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined")
      document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("lang", l);
    } catch {
      /* ignore */
    }
  };

  const t = (key: string, vars?: Record<string, string | number>) => {
    let s = DICTS[lang][key] ?? DICTS.hr[key] ?? key;
    if (vars)
      for (const k in vars) s = s.replace(`{${k}}`, String(vars[k]));
    return s;
  };

  return (
    <LangCtx.Provider value={{ lang, setLang, t }}>
      {children}
    </LangCtx.Provider>
  );
}

export function useLang(): Ctx {
  const c = useContext(LangCtx);
  if (!c) throw new Error("useLang must be used within LangProvider");
  return c;
}
