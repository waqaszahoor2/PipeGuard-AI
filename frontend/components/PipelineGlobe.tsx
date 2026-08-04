"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Info, Loader2, RefreshCw, ZoomIn, Globe, Map, RotateCw, RotateCcw } from "lucide-react";
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

function hasWebGLSupport(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

function applyProjection(map: maplibregl.Map, projType: "globe" | "mercator") {
  try {
    const m = map as unknown as { setProjection?: (p: { type: string }) => void };
    if (typeof m.setProjection === "function") {
      m.setProjection({ type: projType });
    }
  } catch {
    // Ignore if unsupported by style
  }
}

const DEFAULT_STYLE_SPEC: maplibregl.StyleSpecification = {
  version: 8,
  name: "PipeGuard Globe Style",
  projection: {
    type: "globe",
  },
  sources: {
    "osm-raster-tiles": {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "sky-background",
      type: "background",
      paint: {
        "background-color": "#071426",
      },
    },
    {
      id: "osm-raster-layer",
      type: "raster",
      source: "osm-raster-tiles",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export function PipelineGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const searchMarkerRef = useRef<maplibregl.Marker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const userInteractingRef = useRef<boolean>(false);

  const [projection, setProjection] = useState<"globe" | "mercator">("globe");
  const [dataMode, setDataMode] = useState<"research" | "global">("global");
  const [substance, setSubstance] = useState<string>("water");
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);

  // Detail panel states
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

  // Read saved projection preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedProj = localStorage.getItem("pipeguard_map_projection");
      if (savedProj === "mercator" || savedProj === "globe") {
        setProjection(savedProj);
      }
    }
  }, []);

  // Initialize MapLibre GL JS Map
  useEffect(() => {
    if (!hasWebGLSupport()) {
      setWebGlSupported(false);
      setProjection("mercator");
      return;
    }

    if (!containerRef.current || mapRef.current) return;

    const styleUrl = process.env.NEXT_PUBLIC_MAP_STYLE_URL || DEFAULT_STYLE_SPEC;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: [0, 15],
      zoom: 1.2,
      minZoom: 0,
      maxZoom: 19,
      bearing: 0,
      pitch: 0,
      attributionControl: false,
      antialias: true,
      dragPan: true,
      dragRotate: true,
      scrollZoom: {
        around: "center",
      },
      touchZoomRotate: {
        around: "center",
      },
      touchPitch: true,
      doubleClickZoom: true,
      keyboard: true,
      cooperativeGestures: false,
    });

    mapRef.current = map;

    // Explicitly enable handlers with momentum
    try {
      map.dragPan.enable({
        linearity: 0.2,
        maxSpeed: 1800,
        deceleration: 2600,
      });
      map.dragRotate.enable();
      map.scrollZoom.enable({ around: "center" });
      map.touchZoomRotate.enable({ around: "center" });
      map.touchZoomRotate.enableRotation();
      map.doubleClickZoom.enable();
      map.keyboard.enable();
    } catch {
      // Fallback if handler configuration is constrained
    }

    // Apply projection on style.load
    const applyGlobeProjection = () => {
      applyProjection(map, projection);
    };

    map.on("style.load", applyGlobeProjection);

    map.on("load", () => {
      applyGlobeProjection();

      // Add Sources and Layers for Pipelines
      if (!map.getSource("pipeline-source")) {
        map.addSource("pipeline-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
      }

      if (!map.getLayer("pipeline-layer")) {
        map.addLayer({
          id: "pipeline-layer",
          type: "line",
          source: "pipeline-source",
          paint: {
            "line-color": [
              "case",
              ["has", "substance"],
              [
                "match",
                ["get", "substance"],
                "drinking_water", "#06b6d4",
                "water", "#2563eb",
                "sewage", "#57534e",
                "rainwater", "#7dd3fc",
                "gas", "#eab308",
                "oil", "#111827",
                "#94a3b8"
              ],
              "#2563eb"
            ],
            "line-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              3, 2,
              8, 4,
              14, 6
            ],
            "line-opacity": 0.9,
          },
        });
      }

      // Handle Feature Click
      map.on("click", "pipeline-layer", (e) => {
        if (e.features && e.features.length > 0) {
          const featProps = e.features[0].properties;
          if (dataMode === "global") {
            setSelectedOsm(featProps as OsmProperties);
            setSelectedCalgary(null);
          } else {
            setSelectedCalgary(featProps as CalgaryProperties);
            setSelectedOsm(null);
          }
        }
      });

      // Hover cursor
      map.on("mouseenter", "pipeline-layer", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "pipeline-layer", () => {
        map.getCanvas().style.cursor = "grab";
      });
    });

    // Handle user interaction for auto-rotate pause
    map.on("mousedown", () => { userInteractingRef.current = true; });
    map.on("mouseup", () => { userInteractingRef.current = false; });
    map.on("touchstart", () => { userInteractingRef.current = true; });
    map.on("touchend", () => { userInteractingRef.current = false; });
    map.on("dragstart", () => { userInteractingRef.current = true; });
    map.on("moveend", () => {
      setMapMoved(true);
      setZoomWarning(map.getZoom() < (parseInt(process.env.NEXT_PUBLIC_PIPELINE_MIN_QUERY_ZOOM || "8", 10)));
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Projection
  useEffect(() => {
    if (!mapRef.current) return;
    applyProjection(mapRef.current, projection);
    localStorage.setItem("pipeguard_map_projection", projection);
  }, [projection]);

  // Auto Rotate Loop
  useEffect(() => {
    let lastTime = performance.now();
    const prefersReducedMotion = typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;

    function rotateGlobe(time: number) {
      if (autoRotate && !userInteractingRef.current && !prefersReducedMotion && mapRef.current) {
        const map = mapRef.current;
        if (map.getZoom() < 4) {
          const center = map.getCenter();
          const deltaSeconds = (time - lastTime) / 1000;
          map.easeTo({
            center: [center.lng - deltaSeconds * 2.5, center.lat],
            duration: 0,
            easing: (v) => v,
          });
        }
      }
      lastTime = time;
      animationFrameRef.current = requestAnimationFrame(rotateGlobe);
    }

    if (autoRotate) {
      animationFrameRef.current = requestAnimationFrame(rotateGlobe);
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [autoRotate]);

  // Fetch / Display Data when mode or substance changes
  const loadCalgaryResearchData = useCallback(async () => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    setSelectedOsm(null);
    setZoomWarning(false);
    setMapMoved(false);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/calgary_pipe_sample.geojson");
      const geojson = await response.json();

      const source = map.getSource("pipeline-source") as maplibregl.GeoJSONSource;
      if (source) {
        source.setData(geojson);
      }

      // Reset view to Calgary
      map.flyTo({ center: [-114.198, 51.064], zoom: 12, duration: 2000 });
    } catch {
      setError("Failed to load Calgary research dataset.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadGlobalPipelinesForBbox = useCallback(async (bbox: { south: number; west: number; north: number; east: number }) => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (map.getZoom() < 8) {
      setZoomWarning(true);
      return;
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

      const source = map.getSource("pipeline-source") as maplibregl.GeoJSONSource;
      if (source) {
        source.setData(data as unknown as GeoJSON.FeatureCollection);
      }
    } catch (err: unknown) {
      const msg = typeof err === "object" && err && "message" in err ? String((err as { message: unknown }).message) : "Failed to load public pipelines.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [substance]);

  const loadGlobalPipelinesForViewport = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const bounds = map.getBounds();
    const bbox = {
      south: bounds.getSouth(),
      west: bounds.getWest(),
      north: bounds.getNorth(),
      east: bounds.getEast(),
    };

    const latSpan = Math.abs(bbox.north - bbox.south);
    const lonSpan = Math.abs(bbox.east - bbox.west);
    if (latSpan > 2.0 || lonSpan > 2.0 || map.getZoom() < 8) {
      setZoomWarning(true);
      return;
    }

    loadGlobalPipelinesForBbox(bbox);
  }, [loadGlobalPipelinesForBbox]);

  useEffect(() => {
    if (dataMode === "research") {
      loadCalgaryResearchData();
    } else if (activeSearchResult) {
      loadGlobalPipelinesForBbox(activeSearchResult.bounding_box);
    } else {
      loadGlobalPipelinesForViewport();
    }
  }, [dataMode, substance, loadCalgaryResearchData, loadGlobalPipelinesForBbox, loadGlobalPipelinesForViewport, activeSearchResult]);

  // Handle Search Result Fly-To
  async function handleSelectSearchResult(result: GeocodeResult) {
    setActiveSearchResult(result);
    setDataMode("global");
    if (!mapRef.current) return;
    const map = mapRef.current;
    map.stop();

    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
    }

    const el = document.createElement("div");
    el.className = "custom-map-pin";
    el.innerHTML = `<div class="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-blue-600 text-white shadow-lg"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg></div>`;

    searchMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([result.longitude, result.latitude])
      .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`<b>${result.display_name}</b>`))
      .addTo(map);

    const bbox = result.bounding_box;
    let targetZoom = 9;
    if (result.type === "country") targetZoom = 3;
    else if (result.type === "state" || result.type === "administrative") targetZoom = 5;
    else if (result.type === "city" || result.type === "town") targetZoom = 9;
    else if (result.type === "coordinate") targetZoom = 13;

    map.flyTo({
      center: [result.longitude, result.latitude],
      zoom: targetZoom,
      duration: 2200,
      essential: true,
    });

    loadGlobalPipelinesForBbox(bbox);
  }

  // Reset Globe to Full Earth View
  function handleResetGlobe() {
    if (!mapRef.current) return;
    mapRef.current.stop();
    applyProjection(mapRef.current, "globe");
    setProjection("globe");
    mapRef.current.easeTo({
      center: [0, 15],
      zoom: 1.2,
      bearing: 0,
      pitch: 0,
      duration: 1200,
      essential: false,
    });
  }

  return (
    <div className="space-y-4">
      <DataInfoModal isOpen={infoModalOpen} onClose={() => setInfoModalOpen(false)} />

      {!webGlSupported && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs font-bold text-orange-950 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-100">
          3D Globe View is not supported on this device or browser. Flat Map View has been enabled.
        </div>
      )}

      {/* Global Search Bar Controls */}
      <GlobalSearchControl
        onSelectResult={handleSelectSearchResult}
        onClear={() => {
          setActiveSearchResult(null);
          if (dataMode === "global") loadGlobalPipelinesForViewport();
        }}
      />

      {/* Control Bar: Projection, Mode & Substance Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-3">
          {/* Globe vs Mercator Toggle */}
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800" role="tablist">
            <button
              onClick={() => setProjection("globe")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${projection === "globe" ? "bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-cyan-300" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
              role="tab"
              aria-selected={projection === "globe"}
              aria-label="Globe View"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Globe View</span>
            </button>
            <button
              onClick={() => setProjection("mercator")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${projection === "mercator" ? "bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-cyan-300" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
              role="tab"
              aria-selected={projection === "mercator"}
              aria-label="Flat Map View"
            >
              <Map className="h-3.5 w-3.5" />
              <span>Flat Map View</span>
            </button>
          </div>

          {/* Dataset Mode */}
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800" role="tablist">
            <button
              onClick={() => setDataMode("global")}
              className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${dataMode === "global" ? "bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-cyan-300" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
              role="tab"
              aria-selected={dataMode === "global"}
            >
              Global OSM Pipelines
            </button>
            <button
              onClick={() => setDataMode("research")}
              className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${dataMode === "research" ? "bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-cyan-300" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
              role="tab"
              aria-selected={dataMode === "research"}
            >
              PipeGuard Calgary Research
            </button>
          </div>

          {/* Substance Filter */}
          {dataMode === "global" && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500">Substance:</span>
              <select
                value={substance}
                onChange={(e) => setSubstance(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                aria-label="Filter pipeline substance"
              >
                <option value="water">Water (Supply)</option>
                <option value="sewage">Sewage</option>
                <option value="rainwater">Rainwater</option>
                <option value="gas">Gas</option>
                <option value="oil">Oil</option>
                <option value="all">All Public Pipelines</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Auto Rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${autoRotate ? "border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}
            aria-label="Auto Rotate Earth"
          >
            <RotateCw className={`h-3.5 w-3.5 ${autoRotate ? "animate-spin" : ""}`} />
            <span>Auto Rotate Earth</span>
          </button>

          {/* Reset Globe Button */}
          <button
            onClick={handleResetGlobe}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            aria-label="Reset to full Earth view"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Globe</span>
          </button>

          <button
            onClick={() => setInfoModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline dark:text-cyan-400"
          >
            <Info className="h-4 w-4" />
            <span>About OSM Data</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Map + Right Details Sidebar */}
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="card relative min-h-[540px] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-slate-950 via-[#071426] to-slate-950 p-2 shadow-2xl">
          {/* Action Overlay Controls */}
          {dataMode === "global" && (
            <div className="pointer-events-none absolute left-4 top-4 z-20 flex flex-wrap items-center gap-2">
              <button
                onClick={loadGlobalPipelinesForViewport}
                disabled={loading}
                className="pointer-events-auto inline-flex items-center gap-2 rounded-xl bg-slate-900/90 px-3.5 py-2 text-xs font-extrabold text-white backdrop-blur-md transition hover:bg-slate-900 shadow-lg"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                <span>Search Pipelines in This Area</span>
              </button>
              {mapMoved && <span className="pointer-events-none rounded-lg bg-orange-500/90 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">Map moved. Click to search area.</span>}
            </div>
          )}

          {/* Map Container */}
          {error ? (
            <div className="grid min-h-[540px] place-items-center text-sm font-semibold text-red-600">{error}</div>
          ) : (
            <div
              ref={containerRef}
              className="min-h-[540px] w-full rounded-xl bg-transparent outline-none cursor-grab active:cursor-grabbing"
              aria-label="3D Earth Globe map"
              style={{ touchAction: "none" }}
            />
          )}

          {/* Zoom Warning Overlay */}
          {dataMode === "global" && zoomWarning && (
            <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-20 flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50/95 p-3 text-xs font-bold text-orange-950 shadow-lg dark:border-orange-900 dark:bg-orange-950/95 dark:text-orange-100">
              <ZoomIn className="h-4 w-4 shrink-0" />
              <span>Rotate the globe and zoom into a city to search publicly mapped pipelines (minimum zoom level 8).</span>
            </div>
          )}
        </div>

        {/* Right Attribute Detail Panel */}
        <aside className="card flex flex-col p-5">
          <div className="flex items-center justify-between">
            <span className="badge-demo">{dataMode === "global" ? "PUBLIC MAP DATA" : "RESEARCH DATA"}</span>
            <span className="text-xs font-bold text-slate-400">3D WebGL Layer</span>
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
                  Click any public pipeline vector line on the 3D globe to inspect its recorded OpenStreetMap tags.
                </p>
              )}

              {/* Mandatory Scientific Boundary Disclaimers */}
              <div className="mt-6 space-y-2 rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-xs leading-5 text-blue-950 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
                <p className="font-bold">No PipeGuard sensors are connected to these public map features.</p>
                <p>This public pipeline has not been assessed by the PipeGuard AI model.</p>
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
                  Select a Calgary research pipeline line on the globe to review recorded installation year and material.
                </p>
              )}

              <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs leading-5 text-blue-950 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
                Calgary pipe records are separate from BattLeDIM sensor data.
              </div>
            </div>
          )}

          <div className="mt-auto pt-6 text-[11px] text-slate-400">
            Map &copy; MapLibre GL JS &copy; OpenStreetMap contributors.
          </div>
        </aside>
      </div>
    </div>
  );
}
