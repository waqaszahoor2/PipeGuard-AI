"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
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
  refreshing: boolean;
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

export type PipelineProviderProps = {
  children: React.ReactNode;
  initialRecords?: PipelineAsset[];
  initialRejectedCount?: number;
  initialSource?: string;
  initialLoadedAt?: string;
};

export function PipelineDataProvider({
  children,
  initialRecords = PIPELINE_ASSETS_50,
  initialRejectedCount = 0,
  initialSource = "Synthetic Demonstration Asset",
  initialLoadedAt
}: PipelineProviderProps) {
  const hasInitialRecords = initialRecords.length > 0;

  const [records, setRecords] = useState<PipelineAsset[]>(initialRecords);
  const [loading, setLoading] = useState(!hasInitialRecords);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState(initialSource);
  const [isFallback, setIsFallback] = useState(false);
  const [rejectedRecordCount, setRejectedRecordCount] = useState(initialRejectedCount);
  const [lastLoadedAt, setLastLoadedAt] = useState<string | null>(initialLoadedAt ?? null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [materialFilter, setMaterialFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [inspectionFilter, setInspectionFilter] = useState("");

  const loadData = async () => {
    if (records.length === 0) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
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

      const accepted: PipelineAsset[] = [];
      let rejected = 0;

      rawData.forEach((item: unknown) => {
        const normalized = adapterToNormalizedPipelineAsset(item as Record<string, unknown>);
        const parsed = PipelineAssetSchema.safeParse(normalized);
        if (parsed.success) {
          accepted.push(parsed.data);
        } else {
          rejected++;
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
      console.warn("Fetch failed, preserving initial records:", err);
      if (records.length === 0) {
        setError(err instanceof Error ? err.message : "Failed to load telemetry dataset");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

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
        refreshing,
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

export const usePipelineAssets = usePipelineData;
