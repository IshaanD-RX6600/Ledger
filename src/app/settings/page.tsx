"use client";
import { useSettings } from "@/lib/useSettings";

const REFRESH_OPTIONS = [
  { label: "15s", value: 15000 },
  { label: "30s", value: 30000 },
  { label: "1 min", value: 60000 },
  { label: "5 min", value: 300000 },
];

const COLUMN_OPTIONS = [
  { id: "shares", label: "Shares" },
  { id: "price", label: "Current Price" },
  { id: "day", label: "Day Change" },
  { id: "value", label: "Market Value" },
  { id: "gain", label: "Total G/L" },
  { id: "alloc", label: "Allocation / Target" },
  { id: "alert", label: "Price Alert" },
];

function Section({
  title,
  subtitle,
  children,
  danger,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <section
      className={`rounded-xl bg-white shadow-sm p-5 space-y-4 border ${
        danger ? "border-red-100" : "border-gray-100"
      }`}
    >
      <div>
        <h2 className={`font-semibold ${danger ? "text-red-700" : "text-gray-900"}`}>{title}</h2>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();

  function toggleColumn(id: string) {
    const on = settings.visibleColumns.includes(id);
    updateSettings({
      visibleColumns: on
        ? settings.visibleColumns.filter((c) => c !== id)
        : [...settings.visibleColumns, id],
    });
  }

  function clearAllData() {
    if (!confirm("Clear all Ledger data? This cannot be undone.")) return;
    Object.keys(localStorage)
      .filter((k) => k.startsWith("ledger.") || k.startsWith("portfolio."))
      .forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  }

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <Section title="Quote Refresh" subtitle="How often live prices are fetched from Finnhub">
        <div className="flex flex-wrap gap-2">
          {REFRESH_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateSettings({ refreshInterval: opt.value })}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                settings.refreshInterval === opt.value
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Section>

      <Section
        title="Holdings Table Columns"
        subtitle="Symbol and actions columns are always visible"
      >
        <div className="grid grid-cols-2 gap-1">
          {COLUMN_OPTIONS.map((col) => {
            const on = settings.visibleColumns.includes(col.id);
            return (
              <button
                key={col.id}
                onClick={() => toggleColumn(col.id)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`h-4 w-4 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                    on ? "bg-indigo-600 border-indigo-600" : "border-gray-300"
                  }`}
                >
                  {on && (
                    <svg
                      className="h-2.5 w-2.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-700">{col.label}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section
        title="Danger Zone"
        subtitle="Permanently removes all data stored in this browser"
        danger
      >
        <button
          onClick={clearAllData}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors"
        >
          Clear all data
        </button>
      </Section>
    </main>
  );
}
