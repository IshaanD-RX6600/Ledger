"use client";
import { useState } from "react";

interface Portfolio {
  id: string;
  name: string;
}

export default function PortfolioSwitcher({
  portfolios,
  activeId,
  onSwitch,
  onCreate,
  onDelete,
}: {
  portfolios: Portfolio[];
  activeId: string;
  onSwitch: (id: string) => void;
  onCreate: (name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const active = portfolios.find((p) => p.id === activeId);

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    onCreate(name);
    setNewName("");
    setCreating(false);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        {active?.name ?? "Portfolio"}
        <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 w-56 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
            {portfolios.map((p) => (
              <div
                key={p.id}
                className={`flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  p.id === activeId ? "bg-indigo-50 dark:bg-indigo-950" : ""
                }`}
              >
                <span
                  className={`text-sm font-medium cursor-pointer ${
                    p.id === activeId ? "text-indigo-600 dark:text-indigo-400" : "text-gray-900 dark:text-gray-100"
                  }`}
                  onClick={() => { onSwitch(p.id); setOpen(false); }}
                >
                  {p.name}
                </span>
                {portfolios.length > 1 && (
                  <button
                    onClick={() => { onDelete(p.id); setOpen(false); }}
                    className="text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 ml-2 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <div className="border-t border-gray-100 dark:border-gray-700 p-2">
              {creating ? (
                <div className="flex gap-1">
                  <input
                    autoFocus
                    className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm dark:text-gray-100 outline-none focus:border-indigo-400"
                    placeholder="Portfolio name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreate();
                      if (e.key === "Escape") setCreating(false);
                    }}
                  />
                  <button onClick={handleCreate} className="rounded-lg bg-indigo-600 px-2 py-1 text-xs text-white">
                    Add
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCreating(true)}
                  className="w-full text-left px-2 py-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition-colors"
                >
                  + New portfolio
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
