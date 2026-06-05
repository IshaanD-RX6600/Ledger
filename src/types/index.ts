export interface Holding {
  symbol: string;
  shares: number;
  costBasis: number;
}

export interface Quote {
  symbol: string;
  current: number;
  prevClose: number;
  change: number;
  changePct: number;
}

export interface EnrichedHolding extends Holding {
  current: number;
  prevClose: number;
  marketValue: number;
  dayChange: number;
  dayChangePct: number;
  totalGain: number;
  totalGainPct: number;
}
