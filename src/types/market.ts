export type MarketCategory = 'indices' | 'stocks' | 'crypto' | 'forex' | 'commodities' | 'bonds';

export type TechnicalRating = 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketAsset {
  symbol: string;
  name: string;
  category: MarketCategory;
  sector?: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  high52: number;
  low52: number;
  volume: number;
  volumeFormatted: string;
  marketCap?: number;
  marketCapFormatted?: string;
  peRatio?: number;
  dividendYield?: number;
  rating: TechnicalRating;
  sparkline: number[];
  candles: Candle[];
  brandColor?: string;
  prevPrice?: number;
  lastUpdated?: number;
}

export interface EconomicEvent {
  id: string;
  time: string;
  country: string;
  countryCode: string;
  title: string;
  impact: 'High' | 'Medium' | 'Low';
  actual?: string;
  forecast: string;
  previous: string;
}

export interface PaperPosition {
  symbol: string;
  name: string;
  shares: number;
  entryPrice: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  type: 'BUY' | 'SELL';
  timestamp: number;
}

export interface TradeOrder {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT';
  shares: number;
  price: number;
  total: number;
  timestamp: number;
  status: 'EXECUTED' | 'CANCELLED';
}
