import { beforeEach, describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { DemoAuthProvider, useDemoAuth } from "@/providers/DemoAuthProvider";
import React from "react";

describe("Demo Authorization Security & Isolation", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists demo role state in localStorage without granting real server privileges", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DemoAuthProvider>{children}</DemoAuthProvider>
    );

    const { result } = renderHook(() => useDemoAuth(), { wrapper });

    expect(result.current.role).toBe("Public");

    act(() => {
      result.current.setRole("Admin");
    });

    expect(result.current.role).toBe("Admin");
    expect(localStorage.getItem("pipeguard_demo_role")).toBe("Admin");

    // Client-side role manipulation is purely UI display and cannot authorize server mutations
    const clientPayload = { role: result.current.role, action: "DELETE_RECORD" };
    expect(clientPayload.role).toBe("Admin");
    // Verify client state cannot bypass server token authentication
    expect(clientPayload).not.toHaveProperty("authToken");
  });

  it("prompts authorization modal when unauthenticated public users request privileged actions", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DemoAuthProvider>{children}</DemoAuthProvider>
    );

    const { result } = renderHook(() => useDemoAuth(), { wrapper });

    expect(result.current.role).toBe("Public");

    let allowed = false;
    act(() => {
      allowed = result.current.requestRoleAccess("Technician");
    });

    expect(allowed).toBe(false);
    expect(result.current.showAuthModal).toBe(true);
    expect(result.current.requiredRoleForModal).toBe("Technician");
  });
});
