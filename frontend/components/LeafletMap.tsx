"use client";

import { useEffect, useRef, useState } from "react";

type GeoJson = GeoJSON.FeatureCollection<GeoJSON.LineString, { pipe_id: string; material: string; year: number; status: string; data_mode: string }>;

export function LeafletMap() {
  const elementRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<{ pipe_id: string; material: string; year: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let map: import("leaflet").Map | null = null;
    let cancelled = false;
    async function start() {
      try {
        const L = await import("leaflet");
        const response = await fetch("/calgary_pipe_sample.geojson");
        const geojson = (await response.json()) as GeoJson;
        if (!elementRef.current || cancelled) return;
        map = L.map(elementRef.current, { zoomControl: true, attributionControl: true }).setView([51.064, -114.198], 14);
        L.tileLayer(process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ?? "&copy; OpenStreetMap contributors",
          maxZoom: 19
        }).addTo(map);
        const layer = L.geoJSON(geojson, {
          style: () => ({ color: "#1689ee", weight: 5, opacity: 0.85 }),
          onEachFeature: (feature, line) => {
            line.on("click", () => setSelected(feature.properties));
            line.bindTooltip(`${feature.properties.material} · ${feature.properties.year}`);
          }
        }).addTo(map);
        const bounds = layer.getBounds();
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20] });
      } catch {
        setError("The map could not be loaded.");
      }
    }
    start();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
      <div className="card overflow-hidden p-2">
        {error ? <div className="grid min-h-[520px] place-items-center text-sm text-red-600">{error}</div> : <div ref={elementRef} className="min-h-[520px]" aria-label="Research pipeline map" />}
      </div>
      <aside className="card p-5">
        <span className="badge-demo">RESEARCH DATA</span>
        <h3 className="mt-4 text-xl font-extrabold">Selected Pipeline</h3>
        {selected ? (
          <dl className="mt-5 space-y-4 text-sm">
            <div><dt className="label">Pipeline ID</dt><dd className="mt-1 break-all font-bold">{selected.pipe_id}</dd></div>
            <div><dt className="label">Material</dt><dd className="mt-1 font-bold">{selected.material}</dd></div>
            <div><dt className="label">Installation year</dt><dd className="mt-1 font-bold">{selected.year}</dd></div>
            <div><dt className="label">Latest pressure</dt><dd className="mt-1 font-bold">Not available</dd></div>
            <div><dt className="label">Latest flow</dt><dd className="mt-1 font-bold">Not available</dd></div>
            <div><dt className="label">Current alert</dt><dd className="mt-1 font-bold">No sensor mapping</dd></div>
          </dl>
        ) : <p className="mt-4 text-sm leading-6 text-slate-500">Select a line to review its public asset attributes.</p>}
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-900 dark:bg-blue-950/30">Calgary pipe records are separate from BattLeDIM sensor data.</div>
      </aside>
    </div>
  );
}
