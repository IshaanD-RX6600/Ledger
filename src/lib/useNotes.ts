"use client";
import { useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { fsRead, fsWrite } from "./firestoreSync";

const LS_KEY = "ledger.notes.v1";
const FS_KEY = "notes";

export function useNotes() {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [uid, setUid] = useState<string | null>(() => auth.currentUser?.uid ?? null);

  useEffect(() => onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null)), []);

  useEffect(() => {
    try { const raw = localStorage.getItem(LS_KEY); if (raw) setNotes(JSON.parse(raw)); } catch {}
  }, []);

  useEffect(() => {
    if (!uid) return;
    fsRead<{ data: Record<string, string> }>(uid, FS_KEY).then((stored) => {
      if (stored) setNotes(stored.data);
    });
  }, [uid]);

  const setNote = useCallback((symbol: string, text: string) => {
    setNotes((prev) => {
      const next = text.trim()
        ? { ...prev, [symbol]: text }
        : (() => { const n = { ...prev }; delete n[symbol]; return n; })();
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
      if (uid) fsWrite(uid, FS_KEY, { data: next });
      return next;
    });
  }, [uid]);

  return { notes, setNote };
}
