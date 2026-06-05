import { NextRequest, NextResponse } from "next/server";

const RANGE_MAP: Record<string, string> = {
  "1M": "1mo",
  "3M": "3mo",
  "6M": "6mo",
  "1Y": "1y",
};

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol")?.trim().toUpperCase();
  const range = req.nextUrl.searchParams.get("range") ?? "3M";
  if (!symbol) return NextResponse.json({ error: "Missing symbol" }, { status: 400 });

  const yahooRange = RANGE_MAP[range] ?? "3mo";
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=${yahooRange}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json",
      },
      next: { revalidate: 3600 },
    });
  } catch (e) {
    return NextResponse.json({ error: "Network error fetching price data" }, { status: 502 });
  }

  if (!res.ok) {
    return NextResponse.json({ error: `Failed to fetch price data (${res.status})` }, { status: 502 });
  }

  const data = await res.json();
  const result = data?.chart?.result?.[0];
  if (!result) {
    return NextResponse.json({ error: "No price data for this symbol" }, { status: 404 });
  }

  const timestamps: number[] = result.timestamp ?? [];
  const quote = result.indicators?.quote?.[0] ?? {};

  const candles = timestamps
    .map((t: number, i: number) => ({
      date: new Date(t * 1000).toISOString().slice(0, 10),
      close: quote.close?.[i] as number | null,
      open: quote.open?.[i] as number | null,
      high: quote.high?.[i] as number | null,
      low: quote.low?.[i] as number | null,
      volume: quote.volume?.[i] as number | null,
    }))
    .filter((c) => c.close != null && c.high != null && c.low != null) as Array<{
      date: string;
      close: number;
      open: number | null;
      high: number;
      low: number;
      volume: number | null;
    }>;

  return NextResponse.json({ candles });
}
