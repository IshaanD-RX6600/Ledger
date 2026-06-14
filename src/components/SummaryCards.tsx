import { EnrichedHolding } from "@/types";
import { fmt, tone } from "@/lib/format";

export default function SummaryCards({ rows }: { rows: EnrichedHolding[] }) {
  const totalValue = rows.reduce((s, r) => s + r.marketValue, 0);
  const dayChange = rows.reduce((s, r) => s + r.dayChange, 0);
  const totalGain = rows.reduce((s, r) => s + r.totalGain, 0);
  const dayPct = totalValue ? (dayChange / (totalValue - dayChange)) * 100 : 0;

  const card = "rounded-xl bg-white p-4 sm:p-5 shadow-sm border border-gray-100";

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {/* Total Value spans full row on mobile so the two smaller cards sit side-by-side below it */}
      <div className={card + " col-span-2 sm:col-span-1"}>
        <p className="text-sm text-gray-500">Total Value</p>
        <p className="text-xl sm:text-2xl font-semibold text-gray-900">{fmt(totalValue)}</p>
      </div>
      <div className={card}>
        <p className="text-sm text-gray-500">Today</p>
        <p className={`text-xl sm:text-2xl font-semibold ${tone(dayChange)}`}>
          {fmt(dayChange)}
          <span className="block sm:inline text-sm sm:text-2xl"> ({dayPct.toFixed(2)}%)</span>
        </p>
      </div>
      <div className={card}>
        <p className="text-sm text-gray-500">Total Gain/Loss</p>
        <p className={`text-xl sm:text-2xl font-semibold ${tone(totalGain)}`}>{fmt(totalGain)}</p>
      </div>
    </div>
  );
}
