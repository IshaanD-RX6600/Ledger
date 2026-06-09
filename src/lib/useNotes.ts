"use client";
import { useState, useEffect, useCallback } from "react";

const KEY = "ledger.notes.v1";

export function useNotes() {
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setNotes(JSON.parse(raw));
    } catch {}
  }, []);

  const setNote = useCallback((symbol: string, text: string) => {
    setNotes((prev) => {
      const next = text.trim() ? { ...prev, [symbol]: text } : (() => { const n = { ...prev }; delete n[symbol]; return n; })();
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return { notes, setNote };
}
