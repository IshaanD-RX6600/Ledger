import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) return NextResponse.json({ error: "Missing FINNHUB_API_KEY" }, { status: 500 });

  const symbols = (req.nextUrl.searchParams.get("symbols") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!symbols.length) return NextResponse.json({ profiles: {} });

  const profiles: Record<string, { sector: string; name: string }> = {};

  await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const res = await fetch(
          `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${key}`,
          { next: { revalidate: 86400 } }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data.finnhubIndustry) {
          profiles[symbol] = { sector: data.finnhubIndustry, name: data.name ?? symbol };
        }
      } catch {}
    })
  );

  return NextResponse.json({ profiles });
}
