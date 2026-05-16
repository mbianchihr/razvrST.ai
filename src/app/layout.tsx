import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";
import { BottomNav } from "@/components/BottomNav";
import { LangProvider } from "@/lib/i18n";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const display = Schibsted_Grotesk({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700", "800", "900"],
});

const sans = Hanken_Grotesk({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "razvrST.ai — skeniraj prije nego kupiš",
  description:
    "Skeniraj proizvod, saznaj od čega je, kako se reciklira i u koji kontejner ide u Splitu.",
  manifest: "/manifest.webmanifest",
  applicationName: "razvrST.ai",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "razvrST.ai",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0fb8a0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="hr"
      className={cn(
        "h-full antialiased font-sans",
        display.variable,
        sans.variable,
        mono.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        {/* Uhvati install prompt ŠTO RANIJE — prije hidratacije/navigacije. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.__bip=null;addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__bip=e;dispatchEvent(new Event('bipchange'))});addEventListener('appinstalled',function(){window.__bip=null;window.__bipInstalled=true;dispatchEvent(new Event('bipchange'))});",
          }}
        />
        <LangProvider>
          <ServiceWorkerRegister />
          <div className="app-shell">
            <div className="flex-1 flex flex-col pb-[76px]">{children}</div>
            <BottomNav />
          </div>
        </LangProvider>
      </body>
    </html>
  );
}
