"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScanLine, MapPin, Activity } from "lucide-react";
import { useLang } from "@/lib/i18n";

const TABS = [
  { href: "/", key: "nav.scan", icon: ScanLine },
  { href: "/map", key: "nav.map", icon: MapPin },
  { href: "/twin", key: "nav.footprint", icon: Activity },
];

export function BottomNav() {
  const path = usePathname();
  const { t } = useLang();
  const isActive = (href: string) =>
    href === "/" ? path === "/" || path.startsWith("/results") : path.startsWith(href);

  return (
    <nav className="tabbar" aria-label="Glavna navigacija">
      {TABS.map(({ href, key, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link key={href} href={href} data-active={active} aria-current={active ? "page" : undefined}>
            <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}
