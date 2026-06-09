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
  const [fsSynced, setFsSynced] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null)), []);

  useEffect(() => {
    try { const raw = localStorage.getItem(LS_KEY); if (raw) setNotes(JSON.parse(raw)); } catch {}
  }, []);

  useEffect(() => {
    setFsSynced(false);
    if (!uid) {
      setFsSynced(true);
      return;
    }
    fsRead<{ data: Record<string, string> }>(uid, FS_KEY).then((stored) => {
      if (stored) setNotes(stored.data);
      setFsSynced(true);
    });
  }, [uid]);

  const setNote = useCallback((symbol: string, text: string) => {
    setNotes((prev) => {
      const next = text.trim()
        ? { ...prev, [symbol]: text }
        : (() => { const n = { ...prev }; delete n[symbol]; return n; })();
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
      if (uid && fsSynced) fsWrite(uid, FS_KEY, { data: next });
      return next;
    });
  }, [uid, fsSynced]);

  return { notes, setNote };
}
