export type MarketCategory = 'indices' | 'stocks' | 'crypto' | 'forex' | 'commodities' | 'bonds';

export type TechnicalRating = 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';

export type ChartStyle = 'candles' | 'hollow' | 'heikin' | 'bars' | 'line' | 'area';

export type DrawingTool = 'cursor' | 'trendline' | 'horizontal' | 'fibonacci' | 'risk_reward' | 'measure';

export type MultiChartLayout = '1x1' | '2x1' | '2x2';

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
  // Quantitative technicals for Pro Screener
  rsi14?: number;
  sma200?: number;
  aboveSma200?: boolean;
  atr?: number;
  beta?: number;
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

export interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
  depthPercent: number;
}

export interface OrderBookData {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: number;
  spreadPercent: number;
}

export interface TradePrint {
  id: string;
  time: string;
  price: number;
  size: number;
  side: 'BUY' | 'SELL';
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  triggered: boolean;
  createdAt: number;
  message: string;
}

export interface IndicatorConfig {
  sma20: boolean;
  sma50: boolean;
  sma200: boolean;
  ema9: boolean;
  ema21: boolean;
  bollinger: boolean;
  vwap: boolean;
  rsi: boolean;
  macd: boolean;
  volumeProfile: boolean;
}

export interface DrawingItem {
  id: string;
  tool: DrawingTool;
  symbol: string;
  price1: number;
  timeIndex1: number;
  price2?: number;
  timeIndex2?: number;
  // Risk Reward specific
  entry?: number;
  stopLoss?: number;
  target?: number;
  riskRewardRatio?: number;
}
