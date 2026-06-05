import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });

  let symbol: string, description: string, candles: Array<{ date: string; close: number; high: number; low: number; volume: number }>;
  try {
    const body = await req.json();
    symbol = body.symbol;
    description = body.description ?? symbol;
    candles = body.candles ?? [];
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!symbol || !candles.length) {
    return NextResponse.json({ error: "Missing symbol or candle data" }, { status: 400 });
  }

  const first = candles[0].close;
  const last = candles[candles.length - 1].close;
  const pctChange = ((last - first) / first) * 100;
  const high = Math.max(...candles.map((c) => c.high));
  const low = Math.min(...candles.map((c) => c.low));
  const avgVol = Math.round(candles.reduce((s, c) => s + c.volume, 0) / candles.length);

  const prompt = `You are a concise financial analyst. Write a brief 3-5 sentence market summary for ${symbol} (${description}) based on recent price data below. Cover: price trend, notable highs/lows, any volatility observations. Be factual and direct. No investment advice.

PRICE DATA (${candles.length} trading days)
Start price: $${first.toFixed(2)}
Current price: $${last.toFixed(2)}
Period change: ${pctChange >= 0 ? "+" : ""}${pctChange.toFixed(2)}%
Period high: $${high.toFixed(2)}
Period low: $${low.toFixed(2)}
Average daily volume: ${avgVol.toLocaleString()}

Write the summary now:`;

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    return NextResponse.json({ summary: result.response.text() });
  } catch (err) {
    const raw = err instanceof Error ? err.message : "";
    let message = "Failed to generate summary. Please try again.";
    if (raw.includes("429") || raw.includes("quota")) {
      message = "Gemini API quota exceeded. Please try again later.";
    } else if (raw.includes("401") || raw.includes("403") || raw.includes("API key")) {
      message = "Invalid Gemini API key.";
    }
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
