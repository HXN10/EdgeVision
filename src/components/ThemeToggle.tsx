"use client";

import { useState, useCallback } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("ev-theme") !== "light";
  });

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.remove("light");
        document.documentElement.classList.add("dark");
        localStorage.setItem("ev-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
        localStorage.setItem("ev-theme", "light");
      }
      return next;
    });
  }, []);

  return (
    <button
      onClick={toggle}
      className="w-8 h-8 rounded-lg border border-ev-border flex items-center justify-center text-ev-text-muted hover:text-ev-accent hover:border-ev-accent/30 transition-colors"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? (
        <Sun className="w-3.5 h-3.5" strokeWidth={2} />
      ) : (
        <Moon className="w-3.5 h-3.5" strokeWidth={2} />
      )}
    </button>
  );
}
