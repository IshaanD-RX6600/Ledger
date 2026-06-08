import { NextRequest, NextResponse } from "next/server";

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) return NextResponse.json({ error: "Missing FINNHUB_API_KEY" }, { status: 500 });

  const symbol = req.nextUrl.searchParams.get("symbol")?.trim().toUpperCase();
  if (!symbol) return NextResponse.json({ articles: [] });

  const to = new Date();
  const from = new Date(to.getTime() - 7 * 86400 * 1000);

  const res = await fetch(
    `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(symbol)}&from=${toDateStr(from)}&to=${toDateStr(to)}&token=${key}`,
    { next: { revalidate: 1800 } }
  );

  if (!res.ok) return NextResponse.json({ error: "News fetch failed" }, { status: 502 });

  const data = await res.json();
  const articles = (Array.isArray(data) ? data : [])
    .sort((a: { datetime: number }, b: { datetime: number }) => b.datetime - a.datetime)
    .slice(0, 8)
    .map((a: { headline: string; source: string; url: string; image: string; datetime: number; summary: string }) => ({
      headline: a.headline,
      source: a.source,
      url: a.url,
      image: a.image || null,
      datetime: a.datetime,
      summary: a.summary || "",
    }));

  return NextResponse.json({ articles });
}
