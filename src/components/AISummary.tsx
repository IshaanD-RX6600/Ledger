"use client";
import { useState } from "react";
import { EnrichedHolding } from "@/types";

export default function AISummary({ rows }: { rows: EnrichedHolding[] }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timestamp, setTimestamp] = useState("");

  const generate = async () => {
    if (!rows.length) return;
    setLoading(true);
    setError("");
    setSummary("");
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings: rows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate summary");
      setSummary(data.summary);
      setTimestamp(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl bg-white dark:bg-gray-900 p-5 shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold dark:text-white">AI Market Summary</h2>
          <p className="text-xs text-gray-400">Powered by Gemini 2.5 Flash</p>
        </div>
        <button
          onClick={generate}
          disabled={loading || !rows.length}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Generating…" : "Generate Summary"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950 rounded-lg px-3 py-2">{error}</p>
      )}

      {summary && (
        <div className="space-y-1">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{summary}</p>
          <p className="text-xs text-gray-400">Generated at {timestamp}</p>
        </div>
      )}

      {!summary && !error && !loading && (
        <p className="text-sm text-gray-400">
          {rows.length
            ? "Click Generate Summary to get an AI analysis of your portfolio."
            : "Add holdings first to generate a summary."}
        </p>
      )}
    </div>
  );
}
