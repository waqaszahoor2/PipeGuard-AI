"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bell,
  BrainCircuit,
  ClipboardList,
  Droplets,
  Home,
  Info,
  Map,
  Menu,
  Moon,
  Layers,
  Search,
  Sun,
  X
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "./Logo";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/leak-detection", label: "Leak Detection", icon: Droplets },
  { href: "/pipeline-map", label: "Pipeline Map", icon: Map },
  { href: "/pipe-information", label: "Pipe Information", icon: Layers },
  { href: "/inspection-records", label: "Inspection Records", icon: ClipboardList },
  { href: "/model-information", label: "Model Information", icon: BrainCircuit },
  { href: "/about", label: "About Project", icon: Info }
];

const mobileNavigation = navigation.slice(0, 5);

function NavLink({
  href,
  label,
  icon: Icon,
  mobile = false,
  onClick
}: (typeof navigation)[number] & { mobile?: boolean; onClick?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={
        mobile
          ? `flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${
              active ? "text-blue-600 dark:text-cyan-300" : "text-slate-500 dark:text-slate-400"
            }`
          : `flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-semibold transition ${
              active
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-950/30"
                : "text-slate-200 hover:bg-white/10 hover:text-white"
            }`
      }
    >
      <Icon className={mobile ? "h-5 w-5" : "h-5 w-5"} aria-hidden="true" />
      <span>{mobile && label === "Leak Detection" ? "Detect" : mobile && label === "Pipeline Map" ? "Map" : mobile && label === "Pipe Information" ? "Pipes" : mobile && label === "Inspection Records" ? "Inspect" : label}</span>
    </Link>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => setDrawerOpen(false), [pathname]);

  const current = navigation.find((item) => pathname.startsWith(item.href))?.label ?? "PipeGuard AI";

  return (
    <div className="min-h-screen">
      <a href="#main-content" className="sr-only-focusable fixed left-4 top-4 z-[100] rounded bg-white p-3 text-slate-900">
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-gradient-to-b from-navy-950 via-navy-900 to-[#052b61] px-4 py-6 lg:flex">
        <div className="px-2">
          <Logo />
        </div>
        <nav className="mt-10 space-y-2" aria-label="Main navigation">
          {navigation.map((item) => <NavLink key={item.href} {...item} />)}
        </nav>
        <div className="mt-auto rounded-2xl border border-cyan-300/20 bg-white/5 p-4 text-xs text-slate-300">
          <div className="font-bold text-cyan-200">Research prototype</div>
          <p className="mt-2 leading-5">No physical sensors are connected. Historical readings are replayed as demo data.</p>
        </div>
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-slate-950/55"
            aria-label="Close navigation"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="relative h-full w-[min(86vw,330px)] bg-gradient-to-b from-navy-950 to-navy-900 p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <Logo />
              <button className="grid h-11 w-11 place-items-center rounded-xl text-white hover:bg-white/10" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                <X />
              </button>
            </div>
            <nav className="mt-8 space-y-2" aria-label="Mobile navigation">
              {navigation.map((item) => <NavLink key={item.href} {...item} onClick={() => setDrawerOpen(false)} />)}
            </nav>
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/85 sm:px-6">
          <div className="mx-auto flex max-w-[1600px] items-center gap-3">
            <button className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200 lg:hidden" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
              <Menu />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-extrabold tracking-tight sm:text-2xl">{current}</h1>
            </div>
            <div className="hidden min-w-64 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-slate-500 dark:border-slate-700 dark:bg-slate-900 md:flex">
              <Search className="h-4 w-4" />
              <input className="h-10 w-full bg-transparent text-sm outline-none" aria-label="Search application" placeholder="Search..." />
            </div>
            <button className="relative grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">3</span>
            </button>
            <button
              className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {mounted && resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <span className="badge-demo hidden sm:inline-flex">DEMO DATA</span>
          </div>
        </header>

        <main id="main-content" className="mx-auto max-w-[1600px] px-4 pb-28 pt-5 sm:px-6 lg:pb-8">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-700 dark:bg-slate-950/95 lg:hidden" aria-label="Bottom navigation">
        {mobileNavigation.map((item) => <NavLink key={item.href} {...item} mobile />)}
      </nav>
    </div>
  );
}
