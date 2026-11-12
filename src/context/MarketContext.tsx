import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { MarketAsset, MarketCategory, PaperPosition, TradeOrder } from '../types/market';
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
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

const LOCAL_STORAGE_WATCHLIST_KEY = 'apex_markets_watchlist';
const LOCAL_STORAGE_PORTFOLIO_KEY = 'apex_markets_portfolio';

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<MarketAsset[]>(INITIAL_MARKETS_DATA);
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset | null>(null);
  const [activeCategory, setActiveCategory] = useState<MarketCategory | 'all' | 'watchlist'>('all');
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [flashMap, setFlashMap] = useState<Record<string, 'up' | 'down'>>({});

  // Initialize Watchlist
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_WATCHLIST_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return ['SPX', 'NVDA', 'AAPL', 'BTCUSD', 'XAUUSD', 'EURUSD'];
  });

  // Save watchlist
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

  // Persist portfolio
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

  // Real-time market tick simulation (subtle, authentic price jitter)
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick 2-4 random assets to update
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

          // Compute tick: 0.05% to 0.25% variance
          const isUp = Math.random() > 0.47;
          const variance = (Math.random() * 0.002 + 0.0003) * (isUp ? 1 : -1);
          const oldPrice = asset.price;
          const newPrice = Number(Math.max(0.0001, oldPrice * (1 + variance)).toFixed(
            asset.price > 100 ? 2 : asset.price > 1 ? 4 : 4
          ));
          const priceDiff = newPrice - oldPrice;
          const newChange = Number((asset.change + priceDiff).toFixed(2));
          const baseOpen = asset.open || (newPrice - newChange);
          const newChangePercent = Number(((newChange / baseOpen) * 100).toFixed(2));

          newFlashes[asset.symbol] = isUp ? 'up' : 'down';

          // Update sparkline
          const newSparkline = [...asset.sparkline.slice(1), newPrice];

          // Update last candle
          const candles = [...asset.candles];
          if (candles.length > 0) {
            const lastCandle = { ...candles[candles.length - 1] };
            lastCandle.close = newPrice;
            if (newPrice > lastCandle.high) lastCandle.high = newPrice;
            if (newPrice < lastCandle.low) lastCandle.low = newPrice;
            candles[candles.length - 1] = lastCandle;
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

      // Clear flashes after animation
      setTimeout(() => {
        setFlashMap(prev => {
          const updated = { ...prev };
          Object.keys(newFlashes).forEach(k => delete updated[k]);
          return updated;
        });
      }, 1300);
    }, 2200);

    return () => clearInterval(interval);
  }, [assets.length]);

  // Keep selectedAsset updated when assets change
  useEffect(() => {
    if (selectedAsset) {
      const refreshed = assets.find(a => a.symbol === selectedAsset.symbol);
      if (refreshed && refreshed.price !== selectedAsset.price) {
        setSelectedAsset(refreshed);
      }
    }
  }, [assets, selectedAsset]);

  // Update positions current price and unrealized P&L
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
        // SELL
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

      // Record order
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
        message: `Order Executed: ${type} ${shares} ${symbol} @ $${price.toFixed(2)} ($${totalAmount.toFixed(2)})`,
      };
    },
    [assets, cashBalance, positions]
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

  // Market status ticker calculation
  const marketStatus = useMemo(() => {
    const d = new Date();
    const utcHours = d.getUTCHours();
    const utcDay = d.getUTCDay();
    const isWeekend = utcDay === 0 || utcDay === 6;
    // NYSE is 13:30 to 20:00 UTC (9:30 AM to 4:00 PM EST)
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
