"use client";

import { useEffect, useMemo, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "gdav_theme";
const LINK_ID = "gdav-light-theme";

type ThemeMode = "dark" | "light";

function ensureLightStylesheet() {
  const existing = document.getElementById(LINK_ID) as HTMLLinkElement | null;
  if (existing) return existing;

  const link = document.createElement("link");
  link.id = LINK_ID;
  link.rel = "stylesheet";
  link.href = "/light-theme.css";
  document.head.appendChild(link);
  return link;
}

function removeLightStylesheet() {
  const existing = document.getElementById(LINK_ID);
  if (existing?.parentNode) existing.parentNode.removeChild(existing);
}

export function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "light") {
    root.dataset.theme = "light";
    ensureLightStylesheet();
  } else {
    delete root.dataset.theme;
    removeLightStylesheet();
  }
}

export function ThemeToggle({ className }: { className?: string }) {
  // Start with light for SSR. Client will correct it instantly if mounted.
  const [mode, setMode] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (saved === "light" || saved === "dark") {
        setMode(saved);
      } else {
        const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setMode(sysDark ? "dark" : "light");
      }
    } catch {
      setMode("light");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    applyTheme(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  }, [mode, mounted]);

  const label = useMemo(() => (mode === "light" ? "Switch to dark mode" : "Switch to light mode"), [mode]);

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setMode((m) => (m === "light" ? "dark" : "light"))}
      className={
        className ??
        "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:border-[#38bdf8]/30 hover:text-white transition-all duration-300 active:scale-95"
      }
    >
      {mode === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}

