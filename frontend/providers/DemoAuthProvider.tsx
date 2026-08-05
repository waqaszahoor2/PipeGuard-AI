"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ShieldCheck, UserCheck, Users, X } from "lucide-react";

export type DemoRole = "Public" | "Technician" | "Admin";

export interface DemoAuthContextType {
  role: DemoRole;
  setRole: (role: DemoRole) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  requiredRoleForModal: DemoRole;
  requestRoleAccess: (required: "Technician" | "Admin") => boolean;
}

const DemoAuthContext = createContext<DemoAuthContextType | undefined>(undefined);

export function DemoAuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<DemoRole>("Public");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [requiredRoleForModal, setRequiredRoleForModal] = useState<DemoRole>("Technician");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("pipeguard_demo_role");
      if (stored === "Technician" || stored === "Admin" || stored === "Public") {
        setRoleState(stored);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const setRole = (newRole: DemoRole) => {
    setRoleState(newRole);
    try {
      localStorage.setItem("pipeguard_demo_role", newRole);
    } catch {
      // Ignore localStorage errors
    }
  };

  const requestRoleAccess = (required: "Technician" | "Admin"): boolean => {
    if (role === required || (required === "Technician" && role === "Admin")) {
      return true;
    }
    setRequiredRoleForModal(required);
    setShowAuthModal(true);
    return false;
  };

  return (
    <DemoAuthContext.Provider
      value={{
        role,
        setRole,
        showAuthModal,
        setShowAuthModal,
        requiredRoleForModal,
        requestRoleAccess
      }}
    >
      {children}

      {/* Demo Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="card max-w-md w-full p-6 space-y-4 shadow-2xl border-blue-300 dark:border-blue-900 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
              <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white">
                <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-cyan-300" />
                Demo Authorization Required
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              This action requires <strong>{requiredRoleForModal} Mode</strong>. Switch your active demo role below to perform field submissions, inspection approvals, or work order management.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setRole("Technician");
                  setShowAuthModal(false);
                }}
                className="w-full flex items-center justify-between rounded-xl bg-blue-50 border border-blue-200 p-3 text-left hover:bg-blue-100 dark:border-blue-900/60 dark:bg-blue-950/40 dark:hover:bg-blue-900/60"
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="h-5 w-5 text-blue-600 dark:text-cyan-300" />
                  <div>
                    <div className="text-xs font-black text-blue-950 dark:text-white">Switch to Technician Mode</div>
                    <div className="text-[10px] text-blue-700 dark:text-slate-300">Submit observations & acoustic log evidence</div>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-blue-600 dark:text-cyan-300">Select →</span>
              </button>

              <button
                onClick={() => {
                  setRole("Admin");
                  setShowAuthModal(false);
                }}
                className="w-full flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 p-3 text-left hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:hover:bg-amber-900/60"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <div className="text-xs font-black text-amber-950 dark:text-white">Switch to Administrator Mode</div>
                    <div className="text-[10px] text-amber-700 dark:text-slate-300">Review submitted logs & issue work orders</div>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">Select →</span>
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-xs font-bold text-slate-500 hover:underline"
              >
                Cancel Action
              </button>
            </div>
          </div>
        </div>
      )}
    </DemoAuthContext.Provider>
  );
}

export function useDemoAuth() {
  const context = useContext(DemoAuthContext);
  if (!context) {
    throw new Error("useDemoAuth must be used within DemoAuthProvider");
  }
  return context;
}
