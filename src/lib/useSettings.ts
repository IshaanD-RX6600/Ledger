"use client";
import { useState, useEffect, useCallback } from "react";

export interface AppSettings {
  refreshInterval: number;
  visibleColumns: string[];
}

export const DEFAULT_SETTINGS: AppSettings = {
  refreshInterval: 30000,
  visibleColumns: ["shares", "price", "day", "value", "gain", "alloc", "alert"],
};

const KEY = "ledger.settings.v1";

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {}
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return { settings, updateSettings };
}
