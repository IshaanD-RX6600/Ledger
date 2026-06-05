import { EnrichedHolding } from "@/types";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const tone = (n: number) => (n >= 0 ? "text-green-600" : "text-red-600");

export default function HoldingsTable({
  rows,
  onRemove,
}: {
  rows: EnrichedHolding[];
  onRemove: (symbol: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm border border-gray-100">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-500">
          <tr>
            {["Symbol", "Shares", "Price", "Day", "Mkt Value", "Total G/L", ""].map((h) => (
              <th key={h} className="px-4 py-3 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.symbol} className="border-t border-gray-100">
              <td className="px-4 py-3 font-semibold">{r.symbol}</td>
              <td className="px-4 py-3">{r.shares}</td>
              <td className="px-4 py-3">{fmt(r.current)}</td>
              <td className={`px-4 py-3 ${tone(r.dayChange)}`}>
                {r.dayChangePct.toFixed(2)}%
              </td>
              <td className="px-4 py-3">{fmt(r.marketValue)}</td>
              <td className={`px-4 py-3 ${tone(r.totalGain)}`}>
                {fmt(r.totalGain)} ({r.totalGainPct.toFixed(1)}%)
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onRemove(r.symbol)}
                  className="text-gray-400 hover:text-red-600"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
