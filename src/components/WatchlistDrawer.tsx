import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { AssetLogo } from './AssetLogo';
import {
  X,
  Trash2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Bookmark,
} from 'lucide-react';

export const WatchlistDrawer: React.FC = () => {
  const {
    isWatchlistOpen,
    setIsWatchlistOpen,
    watchlist,
    toggleWatchlist,
    assets,
    setSelectedAsset,
    portfolio,
    flashMap,
  } = useMarket();

  const [activeTab, setActiveTab] = useState<'watchlist' | 'portfolio'>('watchlist');

  if (!isWatchlistOpen) return null;

  const watchlistAssets = watchlist
    .map(sym => assets.find(a => a.symbol === sym))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#1e222d] border-l border-[#363a45] h-full flex flex-col justify-between shadow-2xl">
        {/* Header */}
        <div>
          <div className="p-4 border-b border-[#363a45] flex items-center justify-between">
            <div className="flex items-center gap-1.5 p-0.5 bg-[#131722] rounded-xs border border-[#363a45]">
              <button
                onClick={() => setActiveTab('watchlist')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-xs transition-colors ${
                  activeTab === 'watchlist'
                    ? 'bg-[#2a2e39] text-[#f0f3fa]'
                    : 'text-[#787b86] hover:text-[#dfe2f2]'
                }`}
              >
                <Bookmark size={13} className="text-[#2962ff]" />
                <span>Watchlist ({watchlist.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-xs transition-colors ${
                  activeTab === 'portfolio'
                    ? 'bg-[#2a2e39] text-[#f0f3fa]'
                    : 'text-[#787b86] hover:text-[#dfe2f2]'
                }`}
              >
                <Briefcase size={13} className="text-[#089981]" />
                <span>Portfolio ({portfolio.positions.length})</span>
              </button>
            </div>

            <button
              onClick={() => setIsWatchlistOpen(false)}
              className="p-1.5 rounded-xs hover:bg-[#2a2e39] text-[#787b86] hover:text-[#f0f3fa] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Portfolio KPI Bar when in portfolio tab */}
          {activeTab === 'portfolio' && (
            <div className="p-3 bg-[#171b26] border-b border-[#363a45] grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-[#787b86] uppercase block">Total Net Worth</span>
                <span className="text-sm font-bold text-[#f0f3fa] tabular-nums">
                  ${portfolio.totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#787b86] uppercase block">Unrealized P&L</span>
                <span
                  className={`text-sm font-bold tabular-nums flex items-center justify-end ${
                    portfolio.totalPnL >= 0 ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {portfolio.totalPnL >= 0 ? '+' : ''}$
                  {portfolio.totalPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#363a45]/40 p-2">
          {activeTab === 'watchlist' ? (
            watchlistAssets.length === 0 ? (
              <div className="py-16 text-center text-[#787b86] text-xs">
                <Bookmark size={32} className="mx-auto mb-2 opacity-30" />
                <p>Your watchlist is empty.</p>
                <p className="mt-1 text-[11px]">Click the star on any market asset to pin it here.</p>
              </div>
            ) : (
              watchlistAssets.map(asset => {
                const isPositive = asset.change >= 0;
                const flash = flashMap[asset.symbol];

                return (
                  <div
                    key={asset.symbol}
                    onClick={() => {
                      setSelectedAsset(asset);
                      setIsWatchlistOpen(false);
                    }}
                    className={`p-2.5 rounded-xs hover:bg-[#2a2e39] flex items-center justify-between cursor-pointer transition-colors ${
                      flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <AssetLogo symbol={asset.symbol} size={24} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-[#f0f3fa]">{asset.symbol}</span>
                          <span className="text-[10px] text-[#787b86] px-1 bg-[#131722] rounded-xs font-mono">
                            {asset.category}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#787b86] truncate max-w-[140px] block">
                          {asset.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#f0f3fa] tabular-nums block">
                          ${asset.price.toFixed(asset.price > 100 ? 2 : 3)}
                        </span>
                        <span
                          className={`text-[11px] font-semibold tabular-nums flex items-center justify-end ${
                            isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                          }`}
                        >
                          {isPositive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                          {isPositive ? '+' : ''}
                          {asset.changePercent.toFixed(2)}%
                        </span>
                      </div>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleWatchlist(asset.symbol);
                        }}
                        className="p-1.5 text-[#787b86] hover:text-[#f23645] rounded-xs transition-colors"
                        title="Remove from Watchlist"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            /* Portfolio Positions List */
            portfolio.positions.length === 0 ? (
              <div className="py-16 text-center text-[#787b86] text-xs">
                <Briefcase size={32} className="mx-auto mb-2 opacity-30" />
                <p>No open positions in your paper trading portfolio.</p>
                <p className="mt-1 text-[11px]">Select any instrument and submit an order to paper trade.</p>
              </div>
            ) : (
              portfolio.positions.map(pos => {
                const isPnLPositive = pos.unrealizedPnL >= 0;

                return (
                  <div
                    key={pos.symbol}
                    className="p-3 bg-[#131722] border border-[#363a45] rounded-xs mb-2 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <AssetLogo symbol={pos.symbol} size={22} />
                        <div>
                          <span className="font-bold text-xs text-[#f0f3fa]">{pos.symbol}</span>
                          <span className="text-[10px] text-[#787b86] block">
                            {pos.shares} units @ ${pos.entryPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-[#f0f3fa] tabular-nums block">
                          ${pos.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span
                          className={`text-xs font-bold tabular-nums ${
                            isPnLPositive ? 'text-[#089981]' : 'text-[#f23645]'
                          }`}
                        >
                          {isPnLPositive ? '+' : ''}${pos.unrealizedPnL.toFixed(2)} (
                          {isPnLPositive ? '+' : ''}
                          {pos.unrealizedPnLPercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#363a45] text-xs">
                      <button
                        onClick={() => {
                          const asset = assets.find(a => a.symbol === pos.symbol);
                          if (asset) setSelectedAsset(asset);
                          setIsWatchlistOpen(false);
                        }}
                        className="text-[#2962ff] hover:underline text-[11px] font-semibold"
                      >
                        View Chart
                      </button>
                      <button
                        onClick={() => portfolio.closePosition(pos.symbol)}
                        className="px-2 py-0.5 bg-[#f23645]/15 hover:bg-[#f23645] text-[#f23645] hover:text-white rounded-xs text-[11px] font-semibold transition-colors"
                      >
                        Market Close
                      </button>
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#131722] border-t border-[#363a45] flex items-center justify-between text-xs text-[#787b86]">
          <span>Cash Available:</span>
          <span className="font-bold text-[#f0f3fa] tabular-nums">
            ${portfolio.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};
