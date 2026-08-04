import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { test, expect, beforeEach } from "vitest";
import { GlobalSearchControl } from "./GlobalSearchControl";

beforeEach(() => {
  cleanup();
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
  fireEvent.change(input, { target: { value: "Karachi" } });
  expect(input.value).toBe("Karachi");

  const clearButton = screen.getByRole("button", { name: /Clear search query/i });
  fireEvent.click(clearButton);
  expect(input.value).toBe("");
});
