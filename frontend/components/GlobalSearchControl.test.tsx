import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { test, expect, beforeEach } from "vitest";
import { GlobalSearchControl } from "./GlobalSearchControl";
import { buildApiUrl } from "@/lib/api";

beforeEach(() => {
  cleanup();
});

test("buildApiUrl prevents duplicate slashes and formats correct endpoint paths", () => {
  expect(buildApiUrl("/api/v1/geocode/search")).toBe("/api/v1/geocode/search");
  expect(buildApiUrl("api/v1/geocode/search")).toBe("/api/v1/geocode/search");
});

test("renders search input and search button", () => {
  render(<GlobalSearchControl onSelectResult={() => {}} />);

  const input = screen.getByPlaceholderText(/Search city, country, address or coordinates/i);
  expect(input).toBeInTheDocument();

  const button = screen.getByRole("button", { name: /Search/i });
  expect(button).toBeInTheDocument();
});

test("updates input value on change and clears on clear button click", () => {
  const onClear = () => {};
  render(<GlobalSearchControl onSelectResult={() => {}} onClear={onClear} />);

  const input = screen.getByPlaceholderText(/Search city, country, address or coordinates/i) as HTMLInputElement;
  fireEvent.change(input, { target: { value: "Pakistan" } });
  expect(input.value).toBe("Pakistan");

  const clearButton = screen.getByRole("button", { name: /Clear search query/i });
  fireEvent.click(clearButton);
  expect(input.value).toBe("");
});
