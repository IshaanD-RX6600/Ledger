import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) return NextResponse.json({ error: "Missing FINNHUB_API_KEY" }, { status: 500 });

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ results: [] });

  const res = await fetch(
    `https://finnhub.io/api/v1/search?q=${encodeURIComponent(q)}&token=${key}`,
    { next: { revalidate: 0 } }
  );
  if (!res.ok) return NextResponse.json({ error: "Search failed" }, { status: 502 });

  const data = await res.json();
  const results = (data.result ?? [])
    .filter((r: { type: string }) => r.type === "Common Stock")
    .slice(0, 8)
    .map((r: { symbol: string; description: string }) => ({
      symbol: r.symbol,
      description: r.description,
    }));

  return NextResponse.json({ results });
}
