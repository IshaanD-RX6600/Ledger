import { Holding, Quote, EnrichedHolding } from "@/types";

export function enrich(holdings: Holding[], quotes: Quote[]): EnrichedHolding[] {
  const bySymbol = new Map(quotes.map((q) => [q.symbol, q]));
  return holdings.map((h) => {
    const q = bySymbol.get(h.symbol);
    const current = q?.current ?? 0;
    const prevClose = q?.prevClose ?? 0;
    const marketValue = h.shares * current;
    const dayChange = h.shares * (current - prevClose);
    const cost = h.shares * h.costBasis;
    return {
      ...h,
      current,
      prevClose,
      marketValue,
      dayChange,
      dayChangePct: prevClose ? ((current - prevClose) / prevClose) * 100 : 0,
      totalGain: marketValue - cost,
      totalGainPct: cost ? ((marketValue - cost) / cost) * 100 : 0,
    };
  });
}
