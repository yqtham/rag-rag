import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { MOCK_SECTORS } from '../data/mockMarkets';
import { MarketAsset } from '../types/market';
import { AssetLogo } from './AssetLogo';
import { ArrowUpRight, ArrowDownRight, Layers, BarChart2 } from 'lucide-react';

export const MarketHeatmap: React.FC = () => {
  const { assets, setSelectedAsset } = useMarket();
  const [heatmapView, setHeatmapView] = useState<'stocks' | 'sectors'>('stocks');

  // Filter stocks for heatmap
  const stockAssets = assets.filter(a => a.category === 'stocks');

  // Color generator based on percent change
  const getTileColor = (chg: number) => {
    if (chg >= 3.0) return 'bg-[#089981] text-white';
    if (chg >= 1.5) return 'bg-[#0b7f6b] text-white';
    if (chg > 0.0) return 'bg-[#1b5e50] text-[#dfe2f2]';
    if (chg === 0) return 'bg-[#2a2e39] text-[#dfe2f2]';
    if (chg > -1.5) return 'bg-[#7a222a] text-[#dfe2f2]';
    if (chg > -3.0) return 'bg-[#b32633] text-white';
    return 'bg-[#f23645] text-white';
  };

  return (
    <div className="bg-[#1e222d] border border-[#363a45] rounded-xs p-4 flex flex-col gap-4">
      {/* Header and Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#363a45]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#f0f3fa]">Market Performance Heatmap</h3>
            <span className="text-[10px] bg-[#2962ff]/20 text-[#2962ff] px-1.5 py-0.5 rounded-xs font-semibold">
              Live Treemap
            </span>
          </div>
          <p className="text-xs text-[#787b86] mt-0.5">
            Visual map of asset class returns weighted by market capitalization
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#131722] p-0.5 rounded-xs border border-[#363a45] text-xs">
          <button
            onClick={() => setHeatmapView('stocks')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xs transition-colors font-medium ${
              heatmapView === 'stocks'
                ? 'bg-[#2a2e39] text-[#f0f3fa]'
                : 'text-[#787b86] hover:text-[#dfe2f2]'
            }`}
          >
            <BarChart2 size={13} />
            <span>Mega-Cap Equities</span>
          </button>
          <button
            onClick={() => setHeatmapView('sectors')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xs transition-colors font-medium ${
              heatmapView === 'sectors'
                ? 'bg-[#2a2e39] text-[#f0f3fa]'
                : 'text-[#787b86] hover:text-[#dfe2f2]'
            }`}
          >
            <Layers size={13} />
            <span>S&P 500 Sectors</span>
          </button>
        </div>
      </div>

      {/* Main Heatmap Grid */}
      {heatmapView === 'stocks' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 min-h-[340px]">
          {stockAssets.map(asset => {
            const isPositive = asset.changePercent >= 0;
            const tileBg = getTileColor(asset.changePercent);

            return (
              <button
                key={asset.symbol}
                onClick={() => setSelectedAsset(asset)}
                className={`p-3 rounded-xs flex flex-col justify-between transition-all hover:scale-[1.02] hover:shadow-lg focus:outline-hidden text-left cursor-pointer border border-black/20 ${tileBg}`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-extrabold text-sm tracking-tight">{asset.symbol}</span>
                  <AssetLogo symbol={asset.symbol} size={20} />
                </div>
                <div className="my-2">
                  <span className="text-[11px] opacity-80 block truncate">{asset.name}</span>
                  <span className="text-xs font-mono font-semibold tabular-nums">
                    ${asset.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-white/20">
                  <span className="text-[10px] opacity-75">{asset.marketCapFormatted}</span>
                  <span className="tabular-nums flex items-center">
                    {isPositive ? '+' : ''}
                    {asset.changePercent.toFixed(2)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* Sector Performance View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {MOCK_SECTORS.map(sec => {
            const isPositive = sec.performance >= 0;
            return (
              <div
                key={sec.name}
                className="bg-[#131722] border border-[#363a45] rounded-xs p-3.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-[#f0f3fa]">{sec.name}</span>
                    <span
                      className={`text-xs font-bold tabular-nums flex items-center ${
                        isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                      {isPositive ? '+' : ''}
                      {sec.performance.toFixed(2)}%
                    </span>
                  </div>
                  <span className="text-[11px] text-[#787b86]">Cap: {sec.marketCap}</span>
                </div>

                <div className="mt-3 pt-2 border-t border-[#363a45]/60">
                  <span className="text-[10px] text-[#787b86] uppercase block mb-1">Leaders</span>
                  <div className="flex items-center gap-1.5">
                    {sec.leaders.map(lead => (
                      <span
                        key={lead}
                        className="px-1.5 py-0.5 text-[10px] font-mono bg-[#1e222d] text-[#c3c5d8] border border-[#363a45] rounded-xs"
                      >
                        {lead}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Heatmap Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-[#787b86] border-t border-[#363a45]">
        <div className="flex items-center gap-2">
          <span>Scale:</span>
          <div className="flex items-center gap-1">
            <span className="w-4 h-3 bg-[#f23645] rounded-xs" title="-3% or less" />
            <span className="w-4 h-3 bg-[#b32633] rounded-xs" />
            <span className="w-4 h-3 bg-[#7a222a] rounded-xs" />
            <span className="w-4 h-3 bg-[#2a2e39] rounded-xs" title="0%" />
            <span className="w-4 h-3 bg-[#1b5e50] rounded-xs" />
            <span className="w-4 h-3 bg-[#0b7f6b] rounded-xs" />
            <span className="w-4 h-3 bg-[#089981] rounded-xs" title="+3% or more" />
          </div>
          <span className="tabular-nums">-3% to +3%</span>
        </div>
        <span>Click any tile to open technical charting and order execution</span>
      </div>
    </div>
  );
};
