import { NextRequest, NextResponse } from "next/server";
import { getQuote } from "@/lib/finnhub";

export async function GET(req: NextRequest) {
  const symbolsParam = req.nextUrl.searchParams.get("symbols");
  if (!symbolsParam) {
    return NextResponse.json({ error: "No symbols provided" }, { status: 400 });
  }

  const symbols = symbolsParam
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  const results = await Promise.allSettled(symbols.map((s) => getQuote(s)));

  const quotes = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<Awaited<ReturnType<typeof getQuote>>>).value);

  const errors = results
    .map((r, i) => (r.status === "rejected" ? symbols[i] : null))
    .filter(Boolean);

  return NextResponse.json({ quotes, errors });
}
