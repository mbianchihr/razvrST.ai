# razvrST.ai

**Scan before you buy. Know how it's recycled.**

A hackathon project (ShepAI) — a mobile-first PWA that turns your phone camera into a
recycling assistant for the city of **Split, Croatia**. Point it at any product or
scan a barcode, and it tells you what the item is made of, whether it can actually be
recycled locally, how to prep it, and **which bin it goes in**.

## What it does

- **📷 Scan by photo** — on-device object detection (TensorFlow.js / COCO-SSD) finds the
  item, then Gemini 2.5 Flash identifies the materials and recycling readiness. Images
  never leave the phone until you take the shot.
- **🔢 Scan by barcode** — looks the product up in [Open Food Facts](https://world.openfoodfacts.org/)
  and maps its packaging to materials.
- **♻️ Local recycling score** — material recycling rates are modeled *per city* (Split
  doesn't recycle tetra pak, for example), so the score reflects reality, not theory.
- **🗑️ Bin guidance** — tells you the exact Split container: plastics, glass, paper,
  bio, mixed, or hazardous-waste yard.
- **🧹 Prep steps & warnings** — rinse, detach the cap, flatten, peel the label —
  and clear warnings when something *looks* recyclable but isn't (laminated paper,
  paper cups, thermal receipts…).
- **🗺️ Split recycling map** — MapLibre map of collection points across the city.
- **🌍 Bilingual** — Croatian / English (`HR` / `EN`) toggle.
- **📲 Installable PWA** — manifest + service worker, works like a native app.

## Tech stack

| | |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS 4, Framer Motion |
| On-device AI | TensorFlow.js + COCO-SSD (`lite_mobilenet_v2`) |
| Cloud AI | Google Gemini 2.5 Flash |
| Data | Open Food Facts API |
| Maps | MapLibre GL / react-map-gl |
| Barcode | `@zxing/browser` |

## Getting started

```bash
npm install

# Gemini powers photo classification — get a key at https://aistudio.google.com/apikey
cp .env.example .env.local
# then set GEMINI_API_KEY=...

npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use a phone (or device emulation)
for the camera flows; the **"try a demo"** link works without a camera.

> Without `GEMINI_API_KEY` the barcode flow still works; photo scanning returns a 503.

## Project layout

```
src/
  app/            routes — home (scan), results/[id], map, twin, api/{scan,product}
  components/     scanner, camera, map, nav, UI primitives
  lib/            score, bins, materials, gemini, detector, i18n, storage
```

## How scanning works

1. Camera capture → COCO-SSD runs **in the browser** to locate the main object.
2. The cropped hint + image go to `/api/scan` → Gemini returns materials, soiled/
   recycle-ready flags, prep steps, and hazard info as strict JSON.
3. `computeScore` weights materials by Split's real recycling rates → tier + bin.
4. Result is saved to local storage and shown at `/results/[id]`.

Barcode scanning skips steps 1–2 and resolves the product via Open Food Facts.

---

Built for a hackathon. Recycling rates and bin mappings are modeled estimates for Split.
