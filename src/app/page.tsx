"use client";
import { useEffect, useState, useCallback } from "react";
import { usePortfolios } from "@/lib/usePortfolios";
import { usePortfolioHistory } from "@/lib/usePortfolioHistory";
import { useAlerts } from "@/lib/useAlerts";
import { enrich } from "@/lib/enrich";
import { Quote, EnrichedHolding } from "@/types";
import SummaryCards from "@/components/SummaryCards";
import AllocationChart from "@/components/AllocationChart";
import DayChangeChart from "@/components/DayChangeChart";
import HoldingsTable from "@/components/HoldingsTable";
import AddHolding from "@/components/AddHolding";
import AISummary from "@/components/AISummary";
import NewsFeed from "@/components/NewsFeed";
import PortfolioSwitcher from "@/components/PortfolioSwitcher";
import PortfolioHistoryChart from "@/components/PortfolioHistoryChart";

export default function Home() {
  const {
    portfolios, activeId, holdings,
    addHolding, removeHolding, createPortfolio, switchPortfolio, deletePortfolio, loaded,
  } = usePortfolios();
  const { history, saveSnapshot } = usePortfolioHistory(activeId);
  const { alerts, setAlert, removeAlert } = useAlerts();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [rows, setRows] = useState<EnrichedHolding[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [newsSymbol, setNewsSymbol] = useState<string | null>(null);

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

  useEffect(() => {
    const total = rows.reduce((s, r) => s + r.marketValue, 0);
    if (total > 0) saveSnapshot(total);
  }, [rows, saveSnapshot]);

  // Keep newsSymbol in sync: default to first holding, clear when no holdings
  const activeNewsSymbol =
    rows.find((r) => r.symbol === newsSymbol)?.symbol ?? rows[0]?.symbol ?? null;

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold dark:text-white">Portfolio</h1>
          <PortfolioSwitcher
            portfolios={portfolios}
            activeId={activeId}
            onSwitch={switchPortfolio}
            onCreate={createPortfolio}
            onDelete={deletePortfolio}
          />
        </div>
        <button
          onClick={fetchQuotes}
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <AddHolding onAdd={addHolding} />
      <SummaryCards rows={rows} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AllocationChart rows={rows} />
        <DayChangeChart rows={rows} />
      </div>

      <PortfolioHistoryChart history={history} />

      <HoldingsTable
        rows={rows}
        onRemove={removeHolding}
        alerts={alerts}
        onSetAlert={setAlert}
        onRemoveAlert={removeAlert}
      />

      <AISummary rows={rows} />

      {rows.length > 0 && (
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            {rows.map((r) => (
              <button
                key={r.symbol}
                onClick={() => setNewsSymbol(r.symbol)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  activeNewsSymbol === r.symbol
                    ? "bg-indigo-600 text-white"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-400"
                }`}
              >
                {r.symbol}
              </button>
            ))}
          </div>
          {activeNewsSymbol && <NewsFeed symbol={activeNewsSymbol} />}
        </div>
      )}
    </main>
  );
}
