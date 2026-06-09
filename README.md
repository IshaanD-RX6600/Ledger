# Ledger

A personal stock portfolio dashboard built with Next.js, Finnhub, and Recharts.

## Features

- **Portfolio tracking** — add holdings with shares and average cost basis; live quotes refresh every 30 seconds
- **Multiple portfolios** — create, switch between, and delete named portfolios; your old data migrates automatically
- **Transaction log** — every buy and sell is logged with date, price, and realized gain/loss
- **Sell positions** — inline sell form in the holdings table; realized gain calculated automatically from cost basis
- **Price alerts** — set a target price (≥ or ≤) per holding; row highlights yellow when triggered
- **Target allocation** — set a desired portfolio weight per holding; live drift indicator shows how far you are
- **Position notes** — attach freetext notes (thesis, reminders) to any holding
- **Portfolio history chart** — auto-saves a daily snapshot of total value; builds a 90-day return chart; toggle **vs SPY** to benchmark against the index (normalized to base 100)
- **Allocation pie chart** — portfolio weight by holding
- **Sector breakdown** — pie chart grouped by Finnhub industry sector
- **Today's P/L bar chart** — per-holding day change in dollars
- **Earnings calendar** — upcoming earnings dates for held stocks (next 30 days), with EPS estimate
- **Watchlist** — bookmark stocks on the Explore page and track live prices without adding them to a portfolio
- **AI market summary** — Gemini 2.5 Flash analysis of your portfolio or any individual stock
- **In-app news reader** — click any headline to read the article summary without leaving the app; tabs to switch between holdings on the portfolio page
- **Export to CSV** — download all holdings with cost basis, market value, and P/L
- **Dark mode** — system preference respected on load; toggle in the nav bar; no flash
- **Keyboard shortcut** — press `/` anywhere to jump to the add-holding input

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Market data | [Finnhub](https://finnhub.io) |
| AI summaries | Google Gemini 2.5 Flash |
| Storage | Browser localStorage |

## Getting started

1. **Clone and install**
   ```bash
   git clone <repo>
   cd Ledger
   npm install
   ```

2. **Add environment variables** — create `.env.local`:
   ```
   FINNHUB_API_KEY=your_key_here
   GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
   ```
   Get a free Finnhub key at [finnhub.io](https://finnhub.io).

3. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
  app/
    api/           # Route handlers (quotes, candles, news, profile, earnings, search, summarize)
    explore/       # Explore page (search + chart + watchlist)
    page.tsx       # Portfolio page
    layout.tsx     # Nav + dark mode flash prevention
  components/      # All UI components
  lib/             # Hooks (usePortfolios, useTransactions, useAlerts, useWatchlist, …)
  types/           # Shared TypeScript interfaces
```

## Notes

- All portfolio data is stored in `localStorage` — nothing is sent to a server
- The portfolio history chart builds up over time (one snapshot per day); it appears automatically once you have 2+ days of data
- Finnhub free tier allows 60 API calls/minute; sector and earnings data is cached server-side (24h and 1h respectively)
