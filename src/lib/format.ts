export const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export const fmtRound = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const tone = (n: number) => (n >= 0 ? "text-green-600" : "text-red-600");

export function timeAgo(unix: number) {
  const diff = Math.floor(Date.now() / 1000 - unix);
  if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
