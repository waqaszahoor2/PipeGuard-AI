"use client";

import { useEffect, useRef, useState } from "react";
import { Info, Layers, Loader2, MapPin, RefreshCw, ZoomIn } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { DataInfoModal } from "@/components/DataInfoModal";
import { GeocodeResult, GlobalSearchControl } from "@/components/GlobalSearchControl";

type CalgaryProperties = {
  pipe_id: string;
  material: string;
  year: number;
  status: string;
  data_mode: string;
};

type OsmProperties = {
  pipeline_id: string;
  name: string;
  operator: string;
  substance: string;
  location: string;
  usage: string;
  diameter: string;
  pressure: string;
  capacity: string;
  source: string;
  osm_type: string;
  osm_id: number | string;
};

type GlobalPipelineGeoJSON = {
  type: "FeatureCollection";
  features: GeoJSON.Feature<GeoJSON.LineString | GeoJSON.MultiLineString, OsmProperties>[];
  metadata: {
    source: string;
    data_mode: string;
    coverage_warning: string;
    result_count: number;
    query_timestamp: string;
    bounding_box: { south: number; west: number; north: number; east: number };
  };
};

export function LeafletMap() {
  const elementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const searchMarkerRef = useRef<import("leaflet").Marker | null>(null);
  const pipelineLayerRef = useRef<import("leaflet").GeoJSON | null>(null);

  const [dataMode, setDataMode] = useState<"research" | "global">("global");
  const [substance, setSubstance] = useState<string>("water");

  // Selection states
  const [selectedCalgary, setSelectedCalgary] = useState<CalgaryProperties | null>(null);
  const [selectedOsm, setSelectedOsm] = useState<OsmProperties | null>(null);

  // Status & loading
  const [loading, setLoading] = useState<boolean>(false);
  const [zoomWarning, setZoomWarning] = useState<boolean>(false);
  const [mapMoved, setMapMoved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [infoModalOpen, setInfoModalOpen] = useState<boolean>(false);
  const [activeSearchResult, setActiveSearchResult] = useState<GeocodeResult | null>(null);
  const [globalMetadata, setGlobalMetadata] = useState<GlobalPipelineGeoJSON["metadata"] | null>(null);

  // Initialize Leaflet map
  useEffect(() => {
    let cancelled = false;
    async function initMap() {
      try {
        const L = await import("leaflet");
        if (!elementRef.current || mapRef.current) return;

        const map = L.map(elementRef.current, {
          zoomControl: true,
          attributionControl: true,
          worldCopyJump: true,
        }).setView([51.064, -114.198], 13);

        mapRef.current = map;

        L.tileLayer(
          process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution: process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ?? "&copy; OpenStreetMap contributors",
            maxZoom: 19,
          }
        ).addTo(map);

        map.on("moveend", () => {
          if (!cancelled) {
            setMapMoved(true);
            setZoomWarning(map.getZoom() < 8);
          }
        });
      } catch {
        setError("The map component could not be initialized.");
      }
    }
    initMap();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle data mode / substance changes
  useEffect(() => {
    if (dataMode === "research") {
      loadCalgaryResearchData();
    } else if (activeSearchResult) {
      loadGlobalPipelinesForBbox(activeSearchResult.bounding_box);
    } else {
      loadGlobalPipelinesForViewport();
    }
  }, [dataMode, substance]);

  async function loadCalgaryResearchData() {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const L = await import("leaflet");

    if (searchMarkerRef.current) {
      map.removeLayer(searchMarkerRef.current);
      searchMarkerRef.current = null;
    }
    if (pipelineLayerRef.current) {
      map.removeLayer(pipelineLayerRef.current);
      pipelineLayerRef.current = null;
    }

    setSelectedOsm(null);
    setZoomWarning(false);
    setMapMoved(false);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/calgary_pipe_sample.geojson");
      const geojson = await response.json();
      const layer = L.geoJSON(geojson, {
        style: () => ({ color: "#1689ee", weight: 5, opacity: 0.85 }),
        onEachFeature: (feature, line) => {
          line.on("click", () => {
            setSelectedCalgary(feature.properties);
            setSelectedOsm(null);
          });
          line.bindTooltip(`${feature.properties.material} · ${feature.properties.year}`);
        },
      }).addTo(map);

      pipelineLayerRef.current = layer;
      const bounds = layer.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20] });
    } catch {
      setError("Failed to load Calgary research dataset.");
    } finally {
      setLoading(false);
    }
  }

  function getSubstanceColor(sub: string): string {
    const s = sub.toLowerCase();
    if (s.includes("drinking") || s.includes("drinking_water")) return "#06b6d4"; // Cyan
    if (s.includes("water")) return "#1689ee"; // Blue
    if (s.includes("sewage")) return "#64748b"; // Slate/Brown
    if (s.includes("rain")) return "#38bdf8"; // Light Blue
    if (s.includes("gas")) return "#eab308"; // Yellow
    if (s.includes("oil")) return "#1e293b"; // Dark Slate/Black
    return "#94a3b8"; // Grey
  }

  async function loadGlobalPipelinesForBbox(bbox: { south: number; west: number; north: number; east: number }) {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const L = await import("leaflet");

    if (map.getZoom() < 8) {
      setZoomWarning(true);
      return;
    }

    if (pipelineLayerRef.current) {
      map.removeLayer(pipelineLayerRef.current);
      pipelineLayerRef.current = null;
    }

    setSelectedCalgary(null);
    setSelectedOsm(null);
    setLoading(true);
    setError(null);
    setZoomWarning(false);
    setMapMoved(false);

    try {
      const url = `/api/v1/global-pipelines?south=${bbox.south.toFixed(4)}&west=${bbox.west.toFixed(4)}&north=${bbox.north.toFixed(4)}&east=${bbox.east.toFixed(4)}&substance=${encodeURIComponent(substance)}`;
      const data = await apiFetch<GlobalPipelineGeoJSON>(url);
      setGlobalMetadata(data.metadata);

      const layer = L.geoJSON(data as unknown as GeoJSON.GeoJsonObject, {
        style: (feature) => ({
          color: getSubstanceColor(feature?.properties?.substance ?? "water"),
          weight: 5,
          opacity: 0.85,
        }),
        onEachFeature: (feature, line) => {
          const props = feature.properties as OsmProperties;
          line.on("click", () => {
            setSelectedOsm(props);
            setSelectedCalgary(null);
          });
          line.bindTooltip(`${props.name !== "Not available" ? props.name : props.pipeline_id} (${props.substance})`);
        },
      }).addTo(map);

      pipelineLayerRef.current = layer;
    } catch (err: unknown) {
      const msg = typeof err === "object" && err && "message" in err ? String((err as { message: unknown }).message) : "Failed to load public pipelines.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function loadGlobalPipelinesForViewport() {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const bounds = map.getBounds();
    const bbox = {
      south: bounds.getSouth(),
      west: bounds.getWest(),
      north: bounds.getNorth(),
      east: bounds.getEast(),
    };

    // Calculate span check
    const latSpan = Math.abs(bbox.north - bbox.south);
    const lonSpan = Math.abs(bbox.east - bbox.west);
    if (latSpan > 2.0 || lonSpan > 2.0 || map.getZoom() < 8) {
      setZoomWarning(true);
      return;
    }

    loadGlobalPipelinesForBbox(bbox);
  }

  async function handleSelectSearchResult(result: GeocodeResult) {
    setActiveSearchResult(result);
    setDataMode("global");
    if (!mapRef.current) return;
    const map = mapRef.current;
    const L = await import("leaflet");

    if (searchMarkerRef.current) {
      map.removeLayer(searchMarkerRef.current);
    }

    const marker = L.marker([result.latitude, result.longitude], {
      icon: L.divIcon({
        className: "custom-map-pin",
        html: `<div class="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-blue-600 text-white shadow-lg"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      }),
    })
      .addTo(map)
      .bindPopup(`<b>${result.display_name}</b>`);

    searchMarkerRef.current = marker;

    const bbox = result.bounding_box;
    const bounds = L.latLngBounds([bbox.south, bbox.west], [bbox.north, bbox.east]);
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });

    loadGlobalPipelinesForBbox(bbox);
  }

  return (
    <div className="space-y-4">
      <DataInfoModal isOpen={infoModalOpen} onClose={() => setInfoModalOpen(false)} />

      {/* Global Search Bar Controls */}
      <GlobalSearchControl
        onSelectResult={handleSelectSearchResult}
        onClear={() => {
          setActiveSearchResult(null);
          if (dataMode === "global") loadGlobalPipelinesForViewport();
        }}
      />

      {/* Control Bar: Mode Toggle & Substance Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800" role="tablist">
            <button
              onClick={() => setDataMode("global")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-extrabold transition ${dataMode === "global" ? "bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-cyan-300" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
              role="tab"
              aria-selected={dataMode === "global"}
            >
              Global Public Pipelines (OSM)
            </button>
            <button
              onClick={() => setDataMode("research")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-extrabold transition ${dataMode === "research" ? "bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-cyan-300" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
              role="tab"
              aria-selected={dataMode === "research"}
            >
              PipeGuard Research Data (Calgary)
            </button>
          </div>

          {dataMode === "global" && (
            <div className="flex items-center gap-1.5 pl-2">
              <span className="text-xs font-bold text-slate-500">Substance:</span>
              <select
                value={substance}
                onChange={(e) => setSubstance(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                aria-label="Filter pipeline substance"
              >
                <option value="water">Water (Drinking/Supply)</option>
                <option value="sewage">Sewage</option>
                <option value="rainwater">Rainwater</option>
                <option value="gas">Gas</option>
                <option value="oil">Oil</option>
                <option value="all">All Public Pipelines</option>
              </select>
            </div>
          )}
        </div>

        <button
          onClick={() => setInfoModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline dark:text-cyan-400"
        >
          <Info className="h-4 w-4" />
          <span>About OpenStreetMap Data</span>
        </button>
      </div>

      {/* Main Grid: Map + Right Details Sidebar */}
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="card relative overflow-hidden p-2">
          {/* Action Overlay Controls */}
          {dataMode === "global" && (
            <div className="absolute left-4 top-4 z-20 flex flex-wrap items-center gap-2">
              <button
                onClick={loadGlobalPipelinesForViewport}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900/90 px-3.5 py-2 text-xs font-extrabold text-white backdrop-blur-md transition hover:bg-slate-900 shadow-lg"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                <span>Search Pipelines in This Area</span>
              </button>
              {mapMoved && <span className="rounded-lg bg-orange-500/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">Map moved. Click to search area.</span>}
            </div>
          )}

          {/* Map Container */}
          {error ? (
            <div className="grid min-h-[540px] place-items-center text-sm font-semibold text-red-600">{error}</div>
          ) : (
            <div ref={elementRef} className="min-h-[540px] w-full rounded-xl" aria-label="Pipeline GIS map" />
          )}

          {/* Zoom Warning Overlay */}
          {dataMode === "global" && zoomWarning && (
            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50/95 p-3 text-xs font-bold text-orange-950 shadow-lg dark:border-orange-900 dark:bg-orange-950/95 dark:text-orange-100">
              <ZoomIn className="h-4 w-4 shrink-0" />
              <span>Zoom in closer to load publicly mapped pipelines for a specific area (minimum zoom level 8).</span>
            </div>
          )}
        </div>

        {/* Right Attribute Detail Panel */}
        <aside className="card flex flex-col p-5">
          <div className="flex items-center justify-between">
            <span className="badge-demo">{dataMode === "global" ? "PUBLIC MAP DATA" : "RESEARCH DATA"}</span>
            <span className="text-xs font-bold text-slate-400">GIS Layer</span>
          </div>

          {dataMode === "global" ? (
            <div>
              <h3 className="mt-4 text-xl font-extrabold">OpenStreetMap Pipeline Details</h3>

              {selectedOsm ? (
                <dl className="mt-4 space-y-3.5 text-sm">
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                    <dt className="label">OSM Feature ID</dt>
                    <dd className="mt-1 font-mono text-xs font-extrabold text-blue-600 dark:text-cyan-300">{selectedOsm.pipeline_id}</dd>
                  </div>
                  <div><dt className="label">Pipeline Name</dt><dd className="mt-1 font-bold">{selectedOsm.name}</dd></div>
                  <div><dt className="label">Substance</dt><dd className="mt-1 font-bold capitalize">{selectedOsm.substance}</dd></div>
                  <div><dt className="label">Location</dt><dd className="mt-1 font-bold capitalize">{selectedOsm.location}</dd></div>
                  <div><dt className="label">Usage</dt><dd className="mt-1 font-bold capitalize">{selectedOsm.usage}</dd></div>
                  <div><dt className="label">Operator</dt><dd className="mt-1 font-bold">{selectedOsm.operator}</dd></div>
                  <div><dt className="label">Diameter</dt><dd className="mt-1 font-bold">{selectedOsm.diameter}</dd></div>
                  <div><dt className="label">Pressure</dt><dd className="mt-1 font-bold">{selectedOsm.pressure}</dd></div>
                  <div><dt className="label">Capacity</dt><dd className="mt-1 font-bold">{selectedOsm.capacity}</dd></div>
                  <div><dt className="label">Data Source</dt><dd className="mt-1 font-bold">{selectedOsm.source}</dd></div>
                </dl>
              ) : (
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  Click any public pipeline vector line on the map to inspect its recorded OpenStreetMap tags.
                </p>
              )}

              {/* Mandatory Scientific Boundary Disclaimers */}
              <div className="mt-6 space-y-2 rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-xs leading-5 text-blue-950 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
                <p className="font-bold">No PipeGuard sensor readings are connected to this public pipeline.</p>
                <p>This pipeline has not been assessed by the PipeGuard AI model.</p>
              </div>

              {globalMetadata && (
                <div className="mt-4 text-[11px] text-slate-400">
                  Query returned {globalMetadata.result_count} public pipeline features.
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 className="mt-4 text-xl font-extrabold">Calgary Research Asset Details</h3>

              {selectedCalgary ? (
                <dl className="mt-4 space-y-3.5 text-sm">
                  <div><dt className="label">Pipeline ID</dt><dd className="mt-1 font-mono text-xs font-bold">{selectedCalgary.pipe_id}</dd></div>
                  <div><dt className="label">Material</dt><dd className="mt-1 font-bold">{selectedCalgary.material}</dd></div>
                  <div><dt className="label">Installation Year</dt><dd className="mt-1 font-bold">{selectedCalgary.year}</dd></div>
                  <div><dt className="label">Current Status</dt><dd className="mt-1 font-bold">{selectedCalgary.status}</dd></div>
                </dl>
              ) : (
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  Select a Calgary research pipeline line to review recorded installation year and material.
                </p>
              )}

              <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs leading-5 text-blue-950 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
                Calgary pipe records are separate from BattLeDIM sensor data.
              </div>
            </div>
          )}

          <div className="mt-auto pt-6 text-[11px] text-slate-400">
            Map and pipeline data &copy; OpenStreetMap contributors.
          </div>
        </aside>
      </div>
    </div>
  );
}
