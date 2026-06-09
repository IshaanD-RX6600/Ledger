import { NextRequest, NextResponse } from "next/server";

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) return NextResponse.json({ error: "Missing FINNHUB_API_KEY" }, { status: 500 });

  const symbols = (req.nextUrl.searchParams.get("symbols") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!symbols.length) return NextResponse.json({ earnings: [] });

  const from = new Date();
  const to = new Date(from.getTime() + 30 * 86400 * 1000);

  interface EarningsEntry {
    symbol: string;
    date: string;
    hour: string;
    epsEstimate: number | null;
    quarter: number;
    year: number;
  }

  const results: EarningsEntry[] = [];

  await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const res = await fetch(
          `https://finnhub.io/api/v1/calendar/earnings?from=${toDateStr(from)}&to=${toDateStr(to)}&symbol=${encodeURIComponent(symbol)}&token=${key}`,
          { next: { revalidate: 3600 } }
        );
        if (!res.ok) return;
        const data = await res.json();
        for (const e of data.earningsCalendar ?? []) {
          results.push({
            symbol,
            date: e.date,
            hour: e.hour ?? "",
            epsEstimate: e.epsEstimate ?? null,
            quarter: e.quarter,
            year: e.year,
          });
        }
      } catch {}
    })
  );

  results.sort((a, b) => a.date.localeCompare(b.date));
  return NextResponse.json({ earnings: results });
}
