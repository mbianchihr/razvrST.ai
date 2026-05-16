import type { ScanResult } from "./types";
import type { BinKey } from "./bins";

const INDEX = "scans";
const KEEP_IMAGES = 6; // userImage je velik — drži ga samo na zadnjih N skenova

export function saveScan(scan: ScanResult) {
  if (typeof window === "undefined") return;
  const ids: string[] = JSON.parse(localStorage.getItem(INDEX) ?? "[]");
  ids.unshift(scan.id);
  const trimmed = ids.slice(0, 100);

  // Oslobodi prostor: makni userImage sa starijih skenova.
  trimmed.slice(KEEP_IMAGES).forEach((id) => {
    const raw = localStorage.getItem(`scan:${id}`);
    if (!raw) return;
    const s = JSON.parse(raw) as ScanResult;
    if (s.userImage) {
      s.userImage = null;
      localStorage.setItem(`scan:${id}`, JSON.stringify(s));
    }
  });

  try {
    localStorage.setItem(`scan:${scan.id}`, JSON.stringify(scan));
  } catch {
    // Quota — spremi bez slike radije nego da padne.
    localStorage.setItem(
      `scan:${scan.id}`,
      JSON.stringify({ ...scan, userImage: null }),
    );
  }
  localStorage.setItem(INDEX, JSON.stringify(trimmed));
}

export function markRecycled(
  id: string,
  opts?: { dirty?: boolean; toBin?: BinKey },
): ScanResult | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(`scan:${id}`);
  if (!raw) return null;
  const s = JSON.parse(raw) as ScanResult;
  s.recycled = true;
  // Prljav/onečišćen predmet stvarno završava u miješanom otpadu.
  if (opts?.dirty) {
    s.bin = "mijesano";
    s.dirty = true;
  } else if (opts?.toBin) {
    // Nereciklabilan materijal (npr. stiropor, tetrapak) → stvarni spremnik.
    s.bin = opts.toBin;
  }
  localStorage.setItem(`scan:${id}`, JSON.stringify(s));
  return s;
}

export function getScan(id: string): ScanResult | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(`scan:${id}`);
  return raw ? (JSON.parse(raw) as ScanResult) : null;
}

export function getAllScans(): ScanResult[] {
  if (typeof window === "undefined") return [];
  const ids: string[] = JSON.parse(localStorage.getItem(INDEX) ?? "[]");
  return ids
    .map((id) => localStorage.getItem(`scan:${id}`))
    .filter(Boolean)
    .map((raw) => JSON.parse(raw as string) as ScanResult);
}
