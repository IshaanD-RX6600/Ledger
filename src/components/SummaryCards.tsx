import { EnrichedHolding } from "@/types";
import { fmt, tone } from "@/lib/format";

export default function SummaryCards({ rows }: { rows: EnrichedHolding[] }) {
  const totalValue = rows.reduce((s, r) => s + r.marketValue, 0);
  const dayChange = rows.reduce((s, r) => s + r.dayChange, 0);
  const totalGain = rows.reduce((s, r) => s + r.totalGain, 0);
  const dayPct = totalValue ? (dayChange / (totalValue - dayChange)) * 100 : 0;

  const card = "rounded-xl bg-white p-5 shadow-sm border border-gray-100";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className={card}>
        <p className="text-sm text-gray-500">Total Value</p>
        <p className="text-2xl font-semibold text-gray-900">{fmt(totalValue)}</p>
      </div>
      <div className={card}>
        <p className="text-sm text-gray-500">Today</p>
        <p className={`text-2xl font-semibold ${tone(dayChange)}`}>
          {fmt(dayChange)} ({dayPct.toFixed(2)}%)
        </p>
      </div>
      <div className={card}>
        <p className="text-sm text-gray-500">Total Gain/Loss</p>
        <p className={`text-2xl font-semibold ${tone(totalGain)}`}>{fmt(totalGain)}</p>
      </div>
    </div>
  );
}
