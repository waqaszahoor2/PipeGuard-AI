"use client";

import { useEffect, useRef, useState } from "react";
import type { PipelineAsset } from "@/lib/pipesData";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PipelineMapClientProps {
  pipes: PipelineAsset[];
  selectedPipe: PipelineAsset | null;
  onSelectPipe: (pipe: PipelineAsset) => void;
}

const RISK_COLORS = {
  Low: "#10b981",
  Medium: "#f59e0b",
  High: "#f97316",
  Critical: "#ef4444"
};

export default function PipelineMapClient({ pipes, selectedPipe, onSelectPipe }: PipelineMapClientProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      // Initialize Calgary center
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
      const color = RISK_COLORS[pipe.risk_level] || "#3b82f6";
      const isSelected = selectedPipe?.pipe_id === pipe.pipe_id;

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
          <div style="font-weight: 800; color: #1e293b;">${pipe.pipe_id}</div>
          <div style="color: #64748b; font-size: 11px; margin-top: 2px;">${pipe.location}</div>
          <div style="margin-top: 6px; font-weight: 700; color: ${color};">
            Risk: ${pipe.risk_level} (${pipe.risk_score}/100)
          </div>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">
            Pressure: ${pipe.pressure_bar} bar | Status: ${pipe.operational_status}
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
  }, [pipes, selectedPipe, onSelectPipe]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-200 shadow-inner dark:border-slate-700">
      <div ref={mapContainerRef} className="h-full w-full min-h-[450px]" />
    </div>
  );
}
