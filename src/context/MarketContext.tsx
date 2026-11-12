import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  MarketAsset,
  MarketCategory,
  PaperPosition,
  TradeOrder,
  MultiChartLayout,
  ChartStyle,
  DrawingTool,
  DrawingItem,
  IndicatorConfig,
  PriceAlert,
  OrderBookData,
  TradePrint,
} from '../types/market';
import { INITIAL_MARKETS_DATA } from '../data/mockMarkets';

interface PortfolioState {
  cashBalance: number;
  positions: PaperPosition[];
  orders: TradeOrder[];
  totalPortfolioValue: number;
  totalPnL: number;
  executeOrder: (params: { symbol: string; type: 'BUY' | 'SELL'; orderType: 'MARKET' | 'LIMIT'; shares: number; price: number }) => { success: boolean; message: string };
  closePosition: (symbol: string) => void;
}

interface MarketContextType {
  assets: MarketAsset[];
  selectedAsset: MarketAsset | null;
  setSelectedAsset: (asset: MarketAsset | null) => void;
  activeCategory: MarketCategory | 'all' | 'watchlist';
  setActiveCategory: (cat: MarketCategory | 'all' | 'watchlist') => void;
  watchlist: string[];
  toggleWatchlist: (symbol: string) => boolean;
  isInWatchlist: (symbol: string) => boolean;
  isWatchlistOpen: boolean;
  setIsWatchlistOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  flashMap: Record<string, 'up' | 'down'>;
  portfolio: PortfolioState;
  marketStatus: {
    isOpen: boolean;
    sessionName: string;
    countdown: string;
  };

  // PRO Features
  isProMode: boolean;
  setIsProMode: (pro: boolean) => void;
  multiChartLayout: MultiChartLayout;
  setMultiChartLayout: (layout: MultiChartLayout) => void;
  multiChartSymbols: string[];
  setMultiChartSymbols: React.Dispatch<React.SetStateAction<string[]>>;
  activeChartIndex: number;
  setActiveChartIndex: (idx: number) => void;
  chartStyle: ChartStyle;
  setChartStyle: (style: ChartStyle) => void;
  activeTool: DrawingTool;
  setActiveTool: (tool: DrawingTool) => void;
  drawings: DrawingItem[];
  addDrawing: (drawing: DrawingItem) => void;
  removeDrawing: (id: string) => void;
  clearDrawings: () => void;
  indicators: IndicatorConfig;
  toggleIndicator: (key: keyof IndicatorConfig) => void;
  alerts: PriceAlert[];
  addAlert: (symbol: string, targetPrice: number, condition: 'ABOVE' | 'BELOW', message?: string) => void;
  removeAlert: (id: string) => void;
  triggeredAlerts: PriceAlert[];
  dismissTriggeredAlert: (id: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  getOrderBook: (symbol: string) => OrderBookData;
  tapePrints: TradePrint[];
  isAlertsModalOpen: boolean;
  setIsAlertsModalOpen: (open: boolean) => void;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

const LOCAL_STORAGE_WATCHLIST_KEY = 'apex_markets_watchlist';
const LOCAL_STORAGE_PORTFOLIO_KEY = 'apex_markets_portfolio';
const LOCAL_STORAGE_ALERTS_KEY = 'apex_markets_alerts';
const LOCAL_STORAGE_DRAWINGS_KEY = 'apex_markets_drawings';

function playTone(freq = 880, type: OscillatorType = 'sine', duration = 0.15) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // ignore
  }
}

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<MarketAsset[]>(INITIAL_MARKETS_DATA);
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset | null>(null);
  const [activeCategory, setActiveCategory] = useState<MarketCategory | 'all' | 'watchlist'>('all');
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [flashMap, setFlashMap] = useState<Record<string, 'up' | 'down'>>({});

  // Pro mode toggle & Multi-chart layout
  const [isProMode, setIsProMode] = useState<boolean>(true); // default to Pro experience!
  const [multiChartLayout, setMultiChartLayout] = useState<MultiChartLayout>('1x1');
  const [multiChartSymbols, setMultiChartSymbols] = useState<string[]>(['NVDA', 'SPX', 'BTCUSD', 'AAPL']);
  const [activeChartIndex, setActiveChartIndex] = useState<number>(0);
  const [chartStyle, setChartStyle] = useState<ChartStyle>('candles');
  const [activeTool, setActiveTool] = useState<DrawingTool>('cursor');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Indicators config
  const [indicators, setIndicators] = useState<IndicatorConfig>({
    sma20: true,
    sma50: false,
    sma200: false,
    ema9: false,
    ema21: false,
    bollinger: false,
    vwap: false,
    rsi: true,
    macd: false,
    volumeProfile: true,
  });

  const toggleIndicator = useCallback((key: keyof IndicatorConfig) => {
    setIndicators(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Drawings state
  const [drawings, setDrawings] = useState<DrawingItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_DRAWINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_DRAWINGS_KEY, JSON.stringify(drawings));
    } catch {
      // ignore
    }
  }, [drawings]);

  const addDrawing = useCallback((item: DrawingItem) => {
    setDrawings(prev => [...prev, item]);
  }, []);

  const removeDrawing = useCallback((id: string) => {
    setDrawings(prev => prev.filter(d => d.id !== id));
  }, []);

  const clearDrawings = useCallback(() => {
    setDrawings([]);
  }, []);

  // Alerts state
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ALERTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'al-1',
        symbol: 'NVDA',
        targetPrice: 140.0,
        condition: 'ABOVE',
        triggered: false,
        createdAt: Date.now() - 3600000,
        message: 'NVIDIA break above $140 resistance',
      },
      {
        id: 'al-2',
        symbol: 'BTCUSD',
        targetPrice: 70000.0,
        condition: 'ABOVE',
        triggered: false,
        createdAt: Date.now() - 7200000,
        message: 'Bitcoin $70k milestone alert',
      },
    ];
  });

  const [triggeredAlerts, setTriggeredAlerts] = useState<PriceAlert[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ALERTS_KEY, JSON.stringify(alerts));
    } catch {
      // ignore
    }
  }, [alerts]);

  const addAlert = useCallback(
    (symbol: string, targetPrice: number, condition: 'ABOVE' | 'BELOW', message?: string) => {
      const newAlert: PriceAlert = {
        id: 'alt-' + Date.now(),
        symbol,
        targetPrice,
        condition,
        triggered: false,
        createdAt: Date.now(),
        message: message || `${symbol} ${condition === 'ABOVE' ? 'rose above' : 'fell below'} $${targetPrice}`,
      };
      setAlerts(prev => [newAlert, ...prev]);
    },
    []
  );

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const dismissTriggeredAlert = useCallback((id: string) => {
    setTriggeredAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  // Watchlist state
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_WATCHLIST_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return ['SPX', 'NVDA', 'AAPL', 'BTCUSD', 'XAUUSD', 'EURUSD', 'MSFT', 'TSLA'];
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_WATCHLIST_KEY, JSON.stringify(watchlist));
    } catch {
      // ignore
    }
  }, [watchlist]);

  const toggleWatchlist = useCallback((symbol: string) => {
    let added = false;
    setWatchlist(prev => {
      if (prev.includes(symbol)) {
        return prev.filter(s => s !== symbol);
      } else {
        added = true;
        return [...prev, symbol];
      }
    });
    return added;
  }, []);

  const isInWatchlist = useCallback((symbol: string) => watchlist.includes(symbol), [watchlist]);

  // Paper Trading Portfolio State
  const [cashBalance, setCashBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PORTFOLIO_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.cashBalance === 'number') return parsed.cashBalance;
      }
    } catch {
      // fallback
    }
    return 100000.0;
  });

  const [positions, setPositions] = useState<PaperPosition[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PORTFOLIO_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.positions)) return parsed.positions;
      }
    } catch {
      // fallback
    }
    return [
      {
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        shares: 50,
        entryPrice: 125.0,
        currentPrice: 138.25,
        totalCost: 6250.0,
        currentValue: 6912.5,
        unrealizedPnL: 662.5,
        unrealizedPnLPercent: 10.6,
        type: 'BUY',
        timestamp: Date.now() - 86400000 * 3,
      },
      {
        symbol: 'BTCUSD',
        name: 'Bitcoin / US Dollar',
        shares: 0.5,
        entryPrice: 64200.0,
        currentPrice: 67840.5,
        totalCost: 32100.0,
        currentValue: 33920.25,
        unrealizedPnL: 1820.25,
        unrealizedPnLPercent: 5.67,
        type: 'BUY',
        timestamp: Date.now() - 86400000 * 5,
      },
    ];
  });

  const [orders, setOrders] = useState<TradeOrder[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_PORTFOLIO_KEY,
        JSON.stringify({ cashBalance, positions })
      );
    } catch {
      // ignore
    }
  }, [cashBalance, positions]);

  // Time & Sales (Live Tape) Stream
  const [tapePrints, setTapePrints] = useState<TradePrint[]>(() => [
    { id: 'tp-1', time: '14:24:02', price: 138.25, size: 200, side: 'BUY' },
    { id: 'tp-2', time: '14:24:01', price: 138.20, size: 100, side: 'SELL' },
    { id: 'tp-3', time: '14:23:59', price: 138.25, size: 450, side: 'BUY' },
    { id: 'tp-4', time: '14:23:58', price: 138.22, size: 50, side: 'BUY' },
    { id: 'tp-5', time: '14:23:55', price: 138.18, size: 300, side: 'SELL' },
  ]);

  // Real-time market tick simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const assetsToUpdateCount = Math.floor(Math.random() * 3) + 2;
      const targetIndices: number[] = [];
      while (targetIndices.length < assetsToUpdateCount) {
        const randIdx = Math.floor(Math.random() * assets.length);
        if (!targetIndices.includes(randIdx)) {
          targetIndices.push(randIdx);
        }
      }

      const newFlashes: Record<string, 'up' | 'down'> = {};

      setAssets(prevAssets => {
        return prevAssets.map((asset, idx) => {
          if (!targetIndices.includes(idx)) return asset;

          const isUp = Math.random() > 0.48;
          const variance = (Math.random() * 0.0022 + 0.0003) * (isUp ? 1 : -1);
          const oldPrice = asset.price;
          const newPrice = Number(
            Math.max(0.0001, oldPrice * (1 + variance)).toFixed(
              asset.price > 100 ? 2 : asset.price > 1 ? 4 : 4
            )
          );
          const priceDiff = newPrice - oldPrice;
          const newChange = Number((asset.change + priceDiff).toFixed(2));
          const baseOpen = asset.open || newPrice - newChange;
          const newChangePercent = Number(((newChange / baseOpen) * 100).toFixed(2));

          newFlashes[asset.symbol] = isUp ? 'up' : 'down';

          // Update sparkline
          const newSparkline = [...asset.sparkline.slice(1), newPrice];

          // Update candles
          const candles = [...asset.candles];
          if (candles.length > 0) {
            const lastCandle = { ...candles[candles.length - 1] };
            lastCandle.close = newPrice;
            if (newPrice > lastCandle.high) lastCandle.high = newPrice;
            if (newPrice < lastCandle.low) lastCandle.low = newPrice;
            candles[candles.length - 1] = lastCandle;
          }

          // Check Price Alerts
          alerts.forEach(al => {
            if (al.symbol === asset.symbol && !al.triggered) {
              const conditionMet =
                (al.condition === 'ABOVE' && newPrice >= al.targetPrice) ||
                (al.condition === 'BELOW' && newPrice <= al.targetPrice);

              if (conditionMet) {
                const triggeredItem = { ...al, triggered: true };
                setTriggeredAlerts(prev => [triggeredItem, ...prev]);
                if (soundEnabled) playTone(980, 'sine', 0.25);
              }
            }
          });

          // Add to streaming tape if this is the active symbol
          const currentActiveSymbol = selectedAsset?.symbol || 'NVDA';
          if (asset.symbol === currentActiveSymbol) {
            const now = new Date();
            const timeStr = now.toTimeString().split(' ')[0];
            const size = Math.floor(Math.random() * 400 + 20);
            setTapePrints(prev => [
              {
                id: 'tp-' + Date.now() + Math.random(),
                time: timeStr,
                price: newPrice,
                size,
                side: isUp ? 'BUY' : 'SELL',
              },
              ...prev.slice(0, 30),
            ]);
          }

          return {
            ...asset,
            prevPrice: oldPrice,
            price: newPrice,
            change: newChange,
            changePercent: newChangePercent,
            high: Math.max(asset.high, newPrice),
            low: Math.min(asset.low, newPrice),
            sparkline: newSparkline,
            candles,
            lastUpdated: Date.now(),
          };
        });
      });

      setFlashMap(prev => ({ ...prev, ...newFlashes }));

      setTimeout(() => {
        setFlashMap(prev => {
          const updated = { ...prev };
          Object.keys(newFlashes).forEach(k => delete updated[k]);
          return updated;
        });
      }, 1200);
    }, 2000);

    return () => clearInterval(interval);
  }, [assets.length, alerts, selectedAsset?.symbol, soundEnabled]);

  // Keep selectedAsset updated
  useEffect(() => {
    if (selectedAsset) {
      const refreshed = assets.find(a => a.symbol === selectedAsset.symbol);
      if (refreshed && refreshed.price !== selectedAsset.price) {
        setSelectedAsset(refreshed);
      }
    }
  }, [assets, selectedAsset]);

  // Level 2 Order Book Generator
  const getOrderBook = useCallback(
    (symbol: string): OrderBookData => {
      const asset = assets.find(a => a.symbol === symbol) || assets[0];
      const p = asset.price;
      const step = p > 1000 ? 5 : p > 100 ? 0.05 : p > 1 ? 0.01 : 0.0001;

      const bids = [];
      const asks = [];
      let totalBid = 0;
      let totalAsk = 0;

      for (let i = 1; i <= 8; i++) {
        const bidPrice = Number((p - i * step).toFixed(p > 100 ? 2 : 4));
        const bidSize = Math.floor(Math.random() * 250 + 50) * (10 - i);
        totalBid += bidSize;
        bids.push({
          price: bidPrice,
          size: bidSize,
          total: totalBid,
          depthPercent: 0,
        });

        const askPrice = Number((p + i * step).toFixed(p > 100 ? 2 : 4));
        const askSize = Math.floor(Math.random() * 250 + 50) * (10 - i);
        totalAsk += askSize;
        asks.push({
          price: askPrice,
          size: askSize,
          total: totalAsk,
          depthPercent: 0,
        });
      }

      const maxTotal = Math.max(totalBid, totalAsk) || 1;
      bids.forEach(b => (b.depthPercent = Math.min(100, (b.total / maxTotal) * 100)));
      asks.forEach(a => (a.depthPercent = Math.min(100, (a.total / maxTotal) * 100)));

      const spread = Number((asks[0].price - bids[0].price).toFixed(4));
      const spreadPercent = Number(((spread / p) * 100).toFixed(3));

      return { bids, asks, spread, spreadPercent };
    },
    [assets]
  );

  // Position updates
  const updatedPositions = useMemo(() => {
    return positions.map(pos => {
      const asset = assets.find(a => a.symbol === pos.symbol);
      const currentPrice = asset ? asset.price : pos.currentPrice;
      const currentValue = pos.shares * currentPrice;
      const unrealizedPnL = currentValue - pos.totalCost;
      const unrealizedPnLPercent = pos.totalCost > 0 ? (unrealizedPnL / pos.totalCost) * 100 : 0;

      return {
        ...pos,
        currentPrice,
        currentValue,
        unrealizedPnL,
        unrealizedPnLPercent,
      };
    });
  }, [positions, assets]);

  const totalPortfolioValue = useMemo(() => {
    const positionsValue = updatedPositions.reduce((acc, pos) => acc + pos.currentValue, 0);
    return cashBalance + positionsValue;
  }, [cashBalance, updatedPositions]);

  const totalPnL = useMemo(() => {
    return updatedPositions.reduce((acc, pos) => acc + pos.unrealizedPnL, 0);
  }, [updatedPositions]);

  // Execute Paper Order
  const executeOrder = useCallback(
    ({
      symbol,
      type,
      orderType,
      shares,
      price,
    }: {
      symbol: string;
      type: 'BUY' | 'SELL';
      orderType: 'MARKET' | 'LIMIT';
      shares: number;
      price: number;
    }) => {
      const totalAmount = shares * price;
      const asset = assets.find(a => a.symbol === symbol);
      const assetName = asset ? asset.name : symbol;

      if (type === 'BUY') {
        if (cashBalance < totalAmount) {
          return { success: false, message: `Insufficient funds. Required $${totalAmount.toFixed(2)}, Available $${cashBalance.toFixed(2)}` };
        }

        setCashBalance(prev => prev - totalAmount);

        setPositions(prev => {
          const existing = prev.find(p => p.symbol === symbol && p.type === 'BUY');
          if (existing) {
            const newShares = existing.shares + shares;
            const newTotalCost = existing.totalCost + totalAmount;
            const newEntryPrice = newTotalCost / newShares;
            return prev.map(p =>
              p.symbol === symbol && p.type === 'BUY'
                ? {
                    ...p,
                    shares: newShares,
                    entryPrice: newEntryPrice,
                    totalCost: newTotalCost,
                    currentValue: newShares * price,
                    unrealizedPnL: newShares * price - newTotalCost,
                  }
                : p
            );
          } else {
            return [
              ...prev,
              {
                symbol,
                name: assetName,
                shares,
                entryPrice: price,
                currentPrice: price,
                totalCost: totalAmount,
                currentValue: totalAmount,
                unrealizedPnL: 0,
                unrealizedPnLPercent: 0,
                type: 'BUY',
                timestamp: Date.now(),
              },
            ];
          }
        });
      } else {
        const existing = positions.find(p => p.symbol === symbol);
        if (!existing || existing.shares < shares) {
          return { success: false, message: `Cannot sell ${shares} shares. You currently own ${existing ? existing.shares : 0} shares.` };
        }

        setCashBalance(prev => prev + totalAmount);

        setPositions(prev => {
          return prev
            .map(p => {
              if (p.symbol === symbol) {
                const remainingShares = p.shares - shares;
                if (remainingShares <= 0) return null;
                const costProportion = (remainingShares / p.shares) * p.totalCost;
                return {
                  ...p,
                  shares: remainingShares,
                  totalCost: costProportion,
                  currentValue: remainingShares * price,
                };
              }
              return p;
            })
            .filter((p): p is PaperPosition => p !== null);
        });
      }

      if (soundEnabled) {
        playTone(type === 'BUY' ? 880 : 440, 'triangle', 0.2);
      }

      const newOrder: TradeOrder = {
        id: 'ord-' + Date.now(),
        symbol,
        type,
        orderType,
        shares,
        price,
        total: totalAmount,
        timestamp: Date.now(),
        status: 'EXECUTED',
      };
      setOrders(prev => [newOrder, ...prev]);

      return {
        success: true,
        message: `Executed: ${type} ${shares} ${symbol} @ $${price.toFixed(2)} ($${totalAmount.toFixed(2)})`,
      };
    },
    [assets, cashBalance, positions, soundEnabled]
  );

  const closePosition = useCallback(
    (symbol: string) => {
      const pos = positions.find(p => p.symbol === symbol);
      if (!pos) return;
      const asset = assets.find(a => a.symbol === symbol);
      const currentPrice = asset ? asset.price : pos.currentPrice;
      executeOrder({
        symbol,
        type: 'SELL',
        orderType: 'MARKET',
        shares: pos.shares,
        price: currentPrice,
      });
    },
    [assets, executeOrder, positions]
  );

  const marketStatus = useMemo(() => {
    const d = new Date();
    const utcHours = d.getUTCHours();
    const utcDay = d.getUTCDay();
    const isWeekend = utcDay === 0 || utcDay === 6;
    const isNYSEOpen = !isWeekend && utcHours >= 13 && utcHours < 20;

    return {
      isOpen: isNYSEOpen,
      sessionName: isNYSEOpen ? 'US Regular Trading' : 'Extended / Global 24/7',
      countdown: isNYSEOpen ? 'Closes in 4h 12m' : 'Opens in 8h 45m',
    };
  }, []);

  const portfolioState: PortfolioState = useMemo(
    () => ({
      cashBalance,
      positions: updatedPositions,
      orders,
      totalPortfolioValue,
      totalPnL,
      executeOrder,
      closePosition,
    }),
    [cashBalance, updatedPositions, orders, totalPortfolioValue, totalPnL, executeOrder, closePosition]
  );

  return (
    <MarketContext.Provider
      value={{
        assets,
        selectedAsset,
        setSelectedAsset,
        activeCategory,
        setActiveCategory,
        watchlist,
        toggleWatchlist,
        isInWatchlist,
        isWatchlistOpen,
        setIsWatchlistOpen,
        isSearchOpen,
        setIsSearchOpen,
        flashMap,
        portfolio: portfolioState,
        marketStatus,

        // Pro features
        isProMode,
        setIsProMode,
        multiChartLayout,
        setMultiChartLayout,
        multiChartSymbols,
        setMultiChartSymbols,
        activeChartIndex,
        setActiveChartIndex,
        chartStyle,
        setChartStyle,
        activeTool,
        setActiveTool,
        drawings,
        addDrawing,
        removeDrawing,
        clearDrawings,
        indicators,
        toggleIndicator,
        alerts,
        addAlert,
        removeAlert,
        triggeredAlerts,
        dismissTriggeredAlert,
        soundEnabled,
        setSoundEnabled,
        getOrderBook,
        tapePrints,
        isAlertsModalOpen,
        setIsAlertsModalOpen,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};
