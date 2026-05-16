"use client";

import { useEffect, useRef } from "react";
import { Map, Marker, type MapRef } from "react-map-gl/maplibre";
import { SITES, SITE_META, SPLIT_CENTER } from "@/lib/locations";

export function SplitMiniMap() {
  const ref = useRef<MapRef | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      ref.current?.flyTo({
        center: [SPLIT_CENTER.lng, SPLIT_CENTER.lat],
        zoom: 12,
        duration: 3200,
        essential: true,
      });
    }, 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="absolute inset-0">
      <Map
        ref={ref}
        initialViewState={{
          longitude: SPLIT_CENTER.lng,
          latitude: SPLIT_CENTER.lat,
          zoom: 10.4,
        }}
        mapStyle="https://tiles.openfreemap.org/styles/bright"
        attributionControl={false}
        interactive={false}
        dragPan={false}
        scrollZoom={false}
      >
        {SITES.map((s) => (
          <Marker key={s.id} longitude={s.lng} latitude={s.lat}>
            <span
              className="block size-2.5 rounded-full border border-white"
              style={{
                background: SITE_META[s.kind].color,
                boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
              }}
            />
          </Marker>
        ))}
      </Map>
    </div>
  );
}
