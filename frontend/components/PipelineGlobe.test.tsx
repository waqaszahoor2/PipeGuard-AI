import { render, screen, cleanup } from "@testing-library/react";
import { test, expect, vi, beforeEach } from "vitest";

// Mock MapLibre GL JS before importing component
vi.mock("maplibre-gl", () => {
  const enableMock = vi.fn();
  return {
    default: {
      Map: vi.fn().mockImplementation(() => ({
        on: vi.fn(),
        off: vi.fn(),
        remove: vi.fn(),
        setProjection: vi.fn(),
        flyTo: vi.fn(),
        fitBounds: vi.fn(),
        easeTo: vi.fn(),
        stop: vi.fn(),
        getSource: vi.fn().mockReturnValue(null),
        addSource: vi.fn(),
        getLayer: vi.fn().mockReturnValue(null),
        addLayer: vi.fn(),
        getZoom: vi.fn().mockReturnValue(1.2),
        getCenter: vi.fn().mockReturnValue({ lng: 0, lat: 15 }),
        getCanvas: vi.fn().mockReturnValue({ style: {} }),
        getBounds: vi.fn().mockReturnValue({
          getSouth: () => 15,
          getWest: () => 60,
          getNorth: () => 35,
          getEast: () => 75,
        }),
        dragPan: { enable: enableMock },
        dragRotate: { enable: enableMock },
        scrollZoom: { enable: enableMock },
        touchZoomRotate: { enable: enableMock, enableRotation: enableMock },
        doubleClickZoom: { enable: enableMock },
        keyboard: { enable: enableMock },
      })),
      Marker: vi.fn().mockImplementation(() => ({
        setLngLat: vi.fn().mockReturnThis(),
        setPopup: vi.fn().mockReturnThis(),
        addTo: vi.fn().mockReturnThis(),
        remove: vi.fn(),
      })),
      Popup: vi.fn().mockImplementation(() => ({
        setHTML: vi.fn().mockReturnThis(),
      })),
    },
  };
});

import { PipelineGlobe } from "./PipelineGlobe";

beforeEach(() => {
  cleanup();
});

test("renders Globe View and Flat Map View buttons", () => {
  render(<PipelineGlobe />);

  expect(screen.getByRole("tab", { name: /Globe View/i })).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: /Flat Map View/i })).toBeInTheDocument();
});

test("renders Auto Rotate Earth and Reset Globe controls", () => {
  render(<PipelineGlobe />);

  expect(screen.getByRole("button", { name: /Auto Rotate Earth/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Reset to full Earth view/i })).toBeInTheDocument();
});
