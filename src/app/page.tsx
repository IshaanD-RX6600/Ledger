"use client";
import { useEffect, useState, useCallback } from "react";
import { useHoldings } from "@/lib/useHoldings";
import { enrich } from "@/lib/enrich";
import { Quote, EnrichedHolding } from "@/types";
import SummaryCards from "@/components/SummaryCards";
import AllocationChart from "@/components/AllocationChart";
import DayChangeChart from "@/components/DayChangeChart";
import HoldingsTable from "@/components/HoldingsTable";
import AddHolding from "@/components/AddHolding";
import AISummary from "@/components/AISummary";

export default function Home() {
  const { holdings, addHolding, removeHolding, loaded } = useHoldings();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [rows, setRows] = useState<EnrichedHolding[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQuotes = useCallback(async () => {
    if (!holdings.length) { setQuotes([]); return; }
    setRefreshing(true);
    try {
      const symbols = holdings.map((h) => h.symbol).join(",");
      const res = await fetch(`/api/quotes?symbols=${symbols}`);
      const data = await res.json();
      setQuotes(data.quotes ?? []);
    } finally {
      setRefreshing(false);
    }
  }, [holdings]);

  useEffect(() => {
    if (!loaded) return;
    fetchQuotes();
    const id = setInterval(fetchQuotes, 30000);
    return () => clearInterval(id);
  }, [fetchQuotes, loaded]);

  useEffect(() => {
    setRows(enrich(holdings, quotes));
  }, [holdings, quotes]);

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <button onClick={fetchQuotes}
          className="text-sm text-blue-600 hover:underline">
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <AddHolding onAdd={addHolding} />
      <SummaryCards rows={rows} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AllocationChart rows={rows} />
        <DayChangeChart rows={rows} />
      </div>

      <HoldingsTable rows={rows} onRemove={removeHolding} />
      <AISummary rows={rows} />
    </main>
  );
}
