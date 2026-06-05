import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getQuote } from "@/lib/finnhub";
import { EnrichedHolding } from "@/types";

const INDICES = ["SPY", "QQQ", "DIA"];

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function sign(n: number) {
  return n >= 0 ? `+${n.toFixed(2)}` : n.toFixed(2);
}

export async function POST(req: NextRequest) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });

  let holdings: EnrichedHolding[] = [];
  try {
    const body = await req.json();
    holdings = body.holdings ?? [];
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!holdings.length) {
    return NextResponse.json({ error: "No holdings to summarize" }, { status: 400 });
  }

  // Fetch market index quotes for context (best-effort, don't fail if unavailable)
  const indexResults = await Promise.allSettled(INDICES.map((s) => getQuote(s)));
  const indices = indexResults
    .map((r) => (r.status === "fulfilled" ? r.value : null))
    .filter(Boolean) as Array<{ symbol: string; current: number; changePct: number }>;

  // Build prompt
  const totalValue = holdings.reduce((s, h) => s + h.marketValue, 0);
  const totalDayChange = holdings.reduce((s, h) => s + h.dayChange, 0);
  const totalGain = holdings.reduce((s, h) => s + h.totalGain, 0);
  const dayPct = totalValue ? (totalDayChange / (totalValue - totalDayChange)) * 100 : 0;

  const portfolioLines = holdings
    .sort((a, b) => b.marketValue - a.marketValue)
    .map(
      (h) =>
        `  ${h.symbol}: ${h.shares} shares @ ${fmt(h.current)} | Day: ${sign(h.dayChangePct)}% | Total G/L: ${sign(h.totalGainPct)}% (${fmt(h.totalGain)})`
    )
    .join("\n");

  const indexLines = indices.length
    ? indices.map((i) => `  ${i.symbol}: ${fmt(i.current)} (${sign(i.changePct)}% today)`).join("\n")
    : "  (unavailable)";

  const prompt = `You are a concise financial analyst assistant. Based on the portfolio and market data below, write a brief 3-5 sentence summary covering: today's portfolio performance, which holdings are driving gains or losses, and any notable observations relative to the broader market. Be direct and informative. Do not give investment advice or buy/sell recommendations.

PORTFOLIO SUMMARY
Total Value: ${fmt(totalValue)}
Today's Change: ${fmt(totalDayChange)} (${sign(dayPct)}%)
Total Gain/Loss: ${fmt(totalGain)}

HOLDINGS (sorted by position size)
${portfolioLines}

MARKET INDICES (today)
${indexLines}

Write the summary now:`;

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const summary = result.response.text();
    return NextResponse.json({ summary });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "";
    let message = "Failed to generate summary. Please try again.";
    if (raw.includes("429") || raw.includes("quota") || raw.includes("Too Many Requests")) {
      message = "Gemini API quota exceeded. Please try again later or use a different API key.";
    } else if (raw.includes("401") || raw.includes("403") || raw.includes("API key")) {
      message = "Invalid Gemini API key. Check GEMINI_API_KEY in .env.local.";
    } else if (raw.includes("404")) {
      message = "Gemini model not available for this API key.";
    }
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
