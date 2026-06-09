import { EnrichedHolding } from "@/types";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function SummaryCards({ rows }: { rows: EnrichedHolding[] }) {
  const totalValue = rows.reduce((s, r) => s + r.marketValue, 0);
  const dayChange = rows.reduce((s, r) => s + r.dayChange, 0);
  const totalGain = rows.reduce((s, r) => s + r.totalGain, 0);
  const dayPct = totalValue ? (dayChange / (totalValue - dayChange)) * 100 : 0;

  const card = "rounded-xl bg-white dark:bg-gray-900 p-5 shadow-sm border border-gray-100 dark:border-gray-800";
  const tone = (n: number) => (n >= 0 ? "text-green-600" : "text-red-600");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className={card}>
        <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
        <p className="text-2xl font-semibold dark:text-white">{fmt(totalValue)}</p>
      </div>
      <div className={card}>
        <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
        <p className={`text-2xl font-semibold ${tone(dayChange)}`}>
          {fmt(dayChange)} ({dayPct.toFixed(2)}%)
        </p>
      </div>
      <div className={card}>
        <p className="text-sm text-gray-500 dark:text-gray-400">Total Gain/Loss</p>
        <p className={`text-2xl font-semibold ${tone(totalGain)}`}>{fmt(totalGain)}</p>
      </div>
    </div>
  );
}
