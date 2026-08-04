"use client";

import { useState } from "react";
import { Loader2, MapPin, Navigation, Search, X } from "lucide-react";
import { apiFetch } from "@/lib/api";

export type GeocodeResult = {
  display_name: string;
  latitude: number;
  longitude: number;
  bounding_box: {
    south: number;
    west: number;
    north: number;
    east: number;
  };
  type: string;
};

export type GeocodeSearchResponse = {
  results: GeocodeResult[];
  source: string;
};

export function GlobalSearchControl({
  onSelectResult,
  onClear,
}: {
  onSelectResult: (result: GeocodeResult) => void;
  onClear?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(searchQuery?: string) {
    const q = (searchQuery ?? query).trim();
    if (!q || loading) return;

    setLoading(true);
    setError(null);
    setSearched(true);
    setResults([]);

    try {
      const data = await apiFetch<GeocodeSearchResponse>(
        `/api/v1/geocode/search?q=${encodeURIComponent(q)}`
      );
      const resList = Array.isArray(data?.results) ? data.results : [];
      setResults(resList);
      if (resList.length === 1) {
        onSelectResult(resList[0]);
      }
    } catch (err: unknown) {
      if (err instanceof Error && "message" in err) {
        setError(err.message);
      } else {
        setError("Location search is temporarily unavailable. Try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  }

  function handleClear() {
    setQuery("");
    setResults([]);
    setError(null);
    setSearched(false);
    if (onClear) onClear();
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const coordString = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        setQuery(coordString);
        const delta = 0.05;
        const result: GeocodeResult = {
          display_name: `Current Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
          latitude: lat,
          longitude: lon,
          bounding_box: {
            south: Math.max(-90, lat - delta),
            west: Math.max(-180, lon - delta),
            north: Math.min(90, lat + delta),
            east: Math.min(180, lon + delta),
          },
          type: "current_location",
        };
        setResults([result]);
        onSelectResult(result);
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError("Location permission denied. Please search by name or coordinates.");
        } else {
          setError("Could not retrieve current location.");
        }
      },
      { timeout: 10000 }
    );
  }

  return (
    <div className="relative w-full">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="relative flex min-w-[240px] flex-1 items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search city, country, address or coordinates"
            className="w-full rounded-xl bg-transparent py-2.5 pl-10 pr-9 text-sm font-medium outline-none placeholder:text-slate-400 dark:text-white"
            aria-label="Search city, country, address or coordinates"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 grid h-6 w-6 place-items-center text-slate-400 hover:text-slate-600 dark:hover:text-white"
              aria-label="Clear search query"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 disabled:opacity-50"
            aria-label="Search location"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span>Search</span>
          </button>

          <button
            onClick={handleUseMyLocation}
            disabled={loading}
            title="Use My Location"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Use My Location"
          >
            <Navigation className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {searched && !loading && results.length === 0 && !error && (
        <div className="mt-2 rounded-xl border border-slate-200 bg-white p-4 text-center text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          No location matching &quot;{query}&quot; was found. Try searching for a major city, country, or coordinates like <code className="font-mono text-xs">24.8607, 67.0011</code>.
        </div>
      )}

      {results.length > 1 && (
        <ul className="absolute left-0 right-0 z-40 mt-2 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          {results.map((res, idx) => (
            <li key={`${res.latitude}-${res.longitude}-${idx}`}>
              <button
                onClick={() => {
                  onSelectResult(res);
                  setResults([]);
                }}
                className="flex w-full items-start gap-2.5 rounded-lg p-2.5 text-left text-sm font-medium transition hover:bg-blue-50 dark:hover:bg-blue-950/40"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-cyan-400" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{res.display_name}</div>
                  <div className="text-xs text-slate-500">
                    Type: {res.type} · Bounding Box: [{res.bounding_box.south.toFixed(2)}, {res.bounding_box.west.toFixed(2)}, {res.bounding_box.north.toFixed(2)}, {res.bounding_box.east.toFixed(2)}]
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
