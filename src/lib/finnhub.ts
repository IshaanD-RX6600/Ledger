import { Quote } from "@/types";

const BASE = "https://finnhub.io/api/v1";

export async function getQuote(symbol: string): Promise<Quote> {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error("Missing FINNHUB_API_KEY");

  const res = await fetch(
    `${BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${key}`,
    { next: { revalidate: 30 } }
  );
  if (!res.ok) throw new Error(`Finnhub error ${res.status} for ${symbol}`);

  const d = await res.json();
  if (d.c === 0 && d.pc === 0) throw new Error(`Unknown symbol: ${symbol}`);

  return {
    symbol,
    current: d.c,
    prevClose: d.pc,
    change: d.c - d.pc,
    changePct: d.pc ? ((d.c - d.pc) / d.pc) * 100 : 0,
  };
}
