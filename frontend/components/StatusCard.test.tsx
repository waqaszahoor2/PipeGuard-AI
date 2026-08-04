import { render, screen } from "@testing-library/react";
import { Gauge } from "lucide-react";
import { test, expect } from "vitest";
import { StatusCard } from "./StatusCard";

test("renders status value and label", () => {
  render(<StatusCard icon={Gauge} label="Pipelines Monitored" value="1,248" tone="blue" />);
  expect(screen.getByText("Pipelines Monitored")).toBeInTheDocument();
  expect(screen.getByText("1,248")).toBeInTheDocument();
});
