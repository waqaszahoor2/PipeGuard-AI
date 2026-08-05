"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  adapterToNormalizedPipelineAsset,
  PIPELINE_ASSETS_50,
  PipelineAssetSchema,
  type PipelineAsset
} from "@/lib/pipeline-data";

export interface PipelineDataContextType {
  records: PipelineAsset[];
  filteredRecords: PipelineAsset[];
  loading: boolean;
  error: string | null;
  dataSource: string;
  isFallback: boolean;
  rejectedRecordCount: number;
  lastLoadedAt: string | null;
  reload: () => void;

  // Global Filter States
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  zoneFilter: string;
  setZoneFilter: (z: string) => void;
  materialFilter: string;
  setMaterialFilter: (m: string) => void;
  riskFilter: string;
  setRiskFilter: (r: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  inspectionFilter: string;
  setInspectionFilter: (i: string) => void;
  resetFilters: () => void;
}

const PipelineDataContext = createContext<PipelineDataContextType | undefined>(undefined);

export function PipelineDataProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<PipelineAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState("Synthetic Demonstration Asset");
  const [isFallback, setIsFallback] = useState(false);
  const [rejectedRecordCount, setRejectedRecordCount] = useState(0);
  const [lastLoadedAt, setLastLoadedAt] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [materialFilter, setMaterialFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [inspectionFilter, setInspectionFilter] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch("/data/pipelines.json", {
        signal: controller.signal,
        headers: { Accept: "application/json" }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch dataset`);
      }

      const rawData = await response.json();
      if (!Array.isArray(rawData)) {
        throw new Error("Dataset is not a JSON array");
      }

      let accepted: PipelineAsset[] = [];
      let rejected = 0;

      rawData.forEach((item: unknown) => {
        const normalized = adapterToNormalizedPipelineAsset(item as Record<string, unknown>);
        const parsed = PipelineAssetSchema.safeParse(normalized);
        if (parsed.success) {
          accepted.push(parsed.data);
        } else {
          rejected++;
          if (process.env.NODE_ENV === "development") {
            console.warn("Pipeline record validation failed:", parsed.error, item);
          }
        }
      });

      if (accepted.length === 0) {
        throw new Error("All dataset records failed validation schema");
      }

      setRecords(accepted);
      setRejectedRecordCount(rejected);
      setIsFallback(false);
      setDataSource("Synthetic Demonstration Asset (/data/pipelines.json)");
      setLastLoadedAt(new Date().toISOString());
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      console.warn("Primary fetch failed, using internal PIPELINE_ASSETS_50 fallback:", err);

      // Fallback
      const fallbackRecords = PIPELINE_ASSETS_50.map((item) =>
        adapterToNormalizedPipelineAsset(item as unknown as Record<string, unknown>)
      );
      setRecords(fallbackRecords);
      setIsFallback(true);
      setDataSource("Internal Synthetic Demonstration Asset Fallback");
      setLastLoadedAt(new Date().toISOString());
      if (fallbackRecords.length === 0) {
        setError(err instanceof Error ? err.message : "Failed to load telemetry dataset");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetFilters = () => {
    setSearchQuery("");
    setZoneFilter("");
    setMaterialFilter("");
    setRiskFilter("");
    setStatusFilter("");
    setInspectionFilter("");
  };

  const filteredRecords = useMemo(() => {
    return records.filter((p) => {
      const matchSearch =
        !searchQuery ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.pipe_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.material.toLowerCase().includes(searchQuery.toLowerCase());

      const matchZone = !zoneFilter || p.zone === zoneFilter;
      const matchMaterial = !materialFilter || p.material === materialFilter;

      const matchRisk =
        !riskFilter ||
        p.risk_level.toLowerCase() === riskFilter.toLowerCase() ||
        (p.riskLevel ? p.riskLevel.toLowerCase() === riskFilter.toLowerCase() : false);

      const matchStatus =
        !statusFilter ||
        p.operational_status === statusFilter ||
        (p.operationalStatus ? p.operationalStatus === statusFilter : false);

      const matchInspection =
        !inspectionFilter ||
        p.inspection_status === inspectionFilter ||
        (p.inspectionStatus ? p.inspectionStatus === inspectionFilter : false);

      return matchSearch && matchZone && matchMaterial && matchRisk && matchStatus && matchInspection;
    });
  }, [records, searchQuery, zoneFilter, materialFilter, riskFilter, statusFilter, inspectionFilter]);

  return (
    <PipelineDataContext.Provider
      value={{
        records,
        filteredRecords,
        loading,
        error,
        dataSource,
        isFallback,
        rejectedRecordCount,
        lastLoadedAt,
        reload: loadData,
        searchQuery,
        setSearchQuery,
        zoneFilter,
        setZoneFilter,
        materialFilter,
        setMaterialFilter,
        riskFilter,
        setRiskFilter,
        statusFilter,
        setStatusFilter,
        inspectionFilter,
        setInspectionFilter,
        resetFilters
      }}
    >
      {children}
    </PipelineDataContext.Provider>
  );
}

export function usePipelineData() {
  const context = useContext(PipelineDataContext);
  if (!context) {
    throw new Error("usePipelineData must be used within a PipelineDataProvider");
  }
  return context;
}
