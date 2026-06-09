"use client";
import { useEffect, useState, useCallback } from "react";
import { usePortfolios } from "@/lib/usePortfolios";
import { usePortfolioHistory } from "@/lib/usePortfolioHistory";
import { useAlerts } from "@/lib/useAlerts";
import { useTransactions } from "@/lib/useTransactions";
import { useTargetAllocation } from "@/lib/useTargetAllocation";
import { useNotes } from "@/lib/useNotes";
import { useSettings } from "@/lib/useSettings";
import { enrich } from "@/lib/enrich";
import { Quote, EnrichedHolding, Holding } from "@/types";
import SummaryCards from "@/components/SummaryCards";
import AllocationChart from "@/components/AllocationChart";
import DayChangeChart from "@/components/DayChangeChart";
import SectorChart from "@/components/SectorChart";
import HoldingsTable from "@/components/HoldingsTable";
import AddHolding from "@/components/AddHolding";
import AISummary from "@/components/AISummary";
import NewsFeed from "@/components/NewsFeed";
import PortfolioSwitcher from "@/components/PortfolioSwitcher";
import PortfolioHistoryChart from "@/components/PortfolioHistoryChart";
import TransactionLog from "@/components/TransactionLog";
import EarningsCalendar from "@/components/EarningsCalendar";

export default function Home() {
  const {
    portfolios, activeId, holdings,
    addHolding, removeHolding, sellHolding,
    createPortfolio, switchPortfolio, deletePortfolio, loaded,
  } = usePortfolios();
  const { history, saveSnapshot } = usePortfolioHistory(activeId);
  const { alerts, setAlert, removeAlert } = useAlerts();
  const { transactions, addTransaction, removeTransaction } = useTransactions(activeId);
  const { targets, setTarget, removeTarget } = useTargetAllocation(activeId);
  const { notes, setNote } = useNotes();
  const { settings } = useSettings();

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
    const id = setInterval(fetchQuotes, settings.refreshInterval);
    return () => clearInterval(id);
  }, [fetchQuotes, loaded, settings.refreshInterval]);

  useEffect(() => {
    setRows(enrich(holdings, quotes));
  }, [holdings, quotes]);

  useEffect(() => {
    const total = rows.reduce((s, r) => s + r.marketValue, 0);
    if (total > 0) saveSnapshot(total);
  }, [rows, saveSnapshot]);

  const activeNewsSymbol =
    rows.find((r) => r.symbol === newsSymbol)?.symbol ?? rows[0]?.symbol ?? null;

  function handleAddHolding(h: Holding) {
    addHolding(h);
    addTransaction({
      symbol: h.symbol,
      type: "buy",
      shares: h.shares,
      price: h.costBasis,
      date: new Date().toISOString().slice(0, 10),
    });
  }

  function handleSell(symbol: string, shares: number, price: number) {
    const row = rows.find((r) => r.symbol === symbol);
    const realizedGain = row ? (price - row.costBasis) * Math.min(shares, row.shares) : 0;
    sellHolding(symbol, shares);
    addTransaction({
      symbol,
      type: "sell",
      shares,
      price,
      date: new Date().toISOString().slice(0, 10),
      realizedGain,
    });
  }

  return (
    <main className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
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
          className="text-sm text-indigo-600 hover:underline"
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <AddHolding onAdd={handleAddHolding} />
      <SummaryCards rows={rows} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AllocationChart rows={rows} />
        <DayChangeChart rows={rows} />
      </div>

      <SectorChart rows={rows} />
      <PortfolioHistoryChart history={history} />
      <EarningsCalendar symbols={rows.map((r) => r.symbol)} />

      <HoldingsTable
        rows={rows}
        onRemove={removeHolding}
        alerts={alerts}
        onSetAlert={setAlert}
        onRemoveAlert={removeAlert}
        targets={targets}
        onSetTarget={setTarget}
        onRemoveTarget={removeTarget}
        notes={notes}
        onSetNote={setNote}
        onSell={handleSell}
        visibleColumns={settings.visibleColumns}
      />

      <TransactionLog transactions={transactions} onRemove={removeTransaction} />
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
                    : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-400"
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
