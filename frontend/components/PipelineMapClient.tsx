"use client";

import { useEffect, useRef, useState } from "react";
import type { PipelineAsset } from "@/lib/pipeline-data";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AlertCircle, RefreshCw } from "lucide-react";

interface PipelineMapClientProps {
  pipes: PipelineAsset[];
  selectedPipe: PipelineAsset | null;
  onSelectPipe: (pipe: PipelineAsset) => void;
}

export type MapState =
  | { status: "loading" }
  | { status: "ready" }
  | { status: "unsupported" }
  | { status: "error"; message: string };

const RISK_COLORS: Record<string, string> = {
  Low: "#10b981",
  Medium: "#f59e0b",
  High: "#f97316",
  Critical: "#ef4444"
};

export default function PipelineMapClient({ pipes, selectedPipe, onSelectPipe }: PipelineMapClientProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  const [mapState, setMapState] = useState<MapState>({ status: "loading" });

  useEffect(() => {
    let disposed = false;

    const timeoutId = window.setTimeout(() => {
      if (!disposed && mapState.status === "loading") {
        setMapState({
          status: "error",
          message: "The interactive map initialization timed out. The asset table remains available below."
        });
      }
    }, 10_000);

    try {
      if (!mapContainerRef.current) {
        throw new Error("Map container element is unavailable.");
      }

      if (!mapRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [51.0447, -114.0719],
          zoom: 11,
          scrollWheelZoom: true
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        mapRef.current = map;
      }

      const map = mapRef.current;

      // Clear existing markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Add markers for filtered pipes
      pipes.forEach((pipe) => {
        const riskKey = String(pipe.risk_level || pipe.riskLevel || "");
        const color = RISK_COLORS[riskKey] || "#3b82f6";
        const isSelected = selectedPipe?.pipe_id === pipe.pipe_id || selectedPipe?.id === pipe.id;

        const marker = L.circleMarker([pipe.latitude, pipe.longitude], {
          radius: isSelected ? 10 : 7,
          fillColor: color,
          color: isSelected ? "#000" : "#ffffff",
          weight: isSelected ? 3 : 1.5,
          opacity: 1,
          fillOpacity: 0.85
        });

        const popupContent = `
          <div style="font-family: sans-serif; font-size: 12px; min-width: 160px;">
            <div style="font-weight: 800; color: #1e293b;">${pipe.pipe_id || pipe.id}</div>
            <div style="color: #64748b; font-size: 11px; margin-top: 2px;">${pipe.location}</div>
            <div style="margin-top: 6px; font-weight: 700; color: ${color};">
              Risk: ${pipe.risk_level || pipe.riskLevel} (${pipe.risk_score || pipe.riskScore}/100)
            </div>
            <div style="font-size: 11px; color: #475569; margin-top: 2px;">
              Pressure: ${pipe.pressure_bar || pipe.pressureBar} bar | Status: ${pipe.operational_status || pipe.operationalStatus}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on("click", () => {
          onSelectPipe(pipe);
        });

        marker.addTo(map);
        markersRef.current.push(marker);
      });

      if (selectedPipe && map) {
        map.setView([selectedPipe.latitude, selectedPipe.longitude], 13);
      }

      if (!disposed) {
        window.clearTimeout(timeoutId);
        setMapState({ status: "ready" });
      }
    } catch (err) {
      if (!disposed) {
        window.clearTimeout(timeoutId);
        setMapState({
          status: "error",
          message: err instanceof Error ? err.message : "Map rendering failed. Accessible table view is available."
        });
      }
    }

    return () => {
      disposed = true;
      window.clearTimeout(timeoutId);
    };
  }, [pipes, selectedPipe, onSelectPipe]);

  const handleRetry = () => {
    setMapState({ status: "loading" });
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-200 shadow-inner dark:border-slate-700">
      {mapState.status === "error" && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/80 p-6 text-center text-white backdrop-blur-sm">
          <AlertCircle className="h-10 w-10 text-rose-400 mb-2" />
          <h4 className="text-sm font-bold">Interactive Map Unavailable</h4>
          <p className="mt-1 text-xs text-slate-300 max-w-md">{mapState.message}</p>
          <button
            onClick={handleRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500"
          >
            <RefreshCw className="h-4 w-4" /> Retry Map Engine
          </button>
        </div>
      )}

      <div
        ref={mapContainerRef}
        className="h-full w-full min-h-[450px]"
        aria-hidden={mapState.status !== "ready"}
      />
    </div>
  );
}
