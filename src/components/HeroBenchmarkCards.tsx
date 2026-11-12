import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { AssetLogo } from './AssetLogo';
import { MarketAsset } from '../types/market';
import { ArrowUpRight, ArrowDownRight, Maximize2 } from 'lucide-react';

interface SparklineProps {
  data: number[];
  isPositive: boolean;
  height?: number;
}

const SparklineChart: React.FC<SparklineProps> = ({ data, isPositive, height = 48 }) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 220;
  const paddingY = 4;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - paddingY - ((val - min) / range) * (height - paddingY * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  const strokeColor = isPositive ? '#089981' : '#f23645';
  const fillColor = isPositive ? 'url(#greenGrad)' : 'url(#redGrad)';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#089981" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#089981" stopOpacity="0.0" />
        </linearGradient>
        <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f23645" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#f23645" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={fillColor} />
      <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const HeroBenchmarkCards: React.FC = () => {
  const { assets, setSelectedAsset, flashMap } = useMarket();
  const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null);

  // Key hero assets
  const heroSymbols = ['SPX', 'NDX', 'BTCUSD', 'XAUUSD', 'USOIL', 'US10Y'];
  const heroAssets = heroSymbols
    .map(sym => assets.find(a => a.symbol === sym))
    .filter((a): a is MarketAsset => Boolean(a));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {heroAssets.map(asset => {
        const isPositive = asset.change >= 0;
        const flash = flashMap[asset.symbol];
        const isHovered = hoveredSymbol === asset.symbol;

        // Day range progress calculation
        const dayRangeSpan = asset.high - asset.low || 1;
        const currentPos = Math.max(0, Math.min(100, ((asset.price - asset.low) / dayRangeSpan) * 100));

        return (
          <div
            key={asset.symbol}
            onClick={() => setSelectedAsset(asset)}
            onMouseEnter={() => setHoveredSymbol(asset.symbol)}
            onMouseLeave={() => setHoveredSymbol(null)}
            className={`cursor-pointer group relative bg-[#1e222d] hover:bg-[#262a35] border border-[#363a45] rounded-xs p-3.5 flex flex-col justify-between transition-all duration-150 ${
              flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''
            }`}
          >
            {/* Header: Logo, Symbol, Expand Icon */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <AssetLogo symbol={asset.symbol} size={22} />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#f0f3fa] group-hover:text-white transition-colors">
                    {asset.symbol}
                  </span>
                  <span className="text-[11px] text-[#787b86] truncate max-w-[110px]">
                    {asset.name}
                  </span>
                </div>
              </div>
              <span className={`text-[10px] text-[#787b86] opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-[#131722] rounded-xs`}>
                <Maximize2 size={11} className="text-[#dfe2f2]" />
              </span>
            </div>

            {/* Price & Delta */}
            <div className="flex items-baseline justify-between gap-1 mb-2">
              <div className="text-[17px] font-bold text-[#f0f3fa] tabular-nums tracking-tight">
                {asset.price > 100
                  ? asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : asset.price.toFixed(asset.category === 'forex' ? 4 : 3)}
              </div>
              <div
                className={`flex items-center gap-0.5 text-xs font-semibold tabular-nums px-1.5 py-0.5 rounded-xs ${
                  isPositive
                    ? 'text-[#089981] bg-[#089981]/12'
                    : 'text-[#f23645] bg-[#f23645]/12'
                }`}
              >
                {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                <span>
                  {isPositive ? '+' : ''}
                  {asset.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Mini Sparkline Chart */}
            <div className="h-10 w-full my-1 relative">
              <SparklineChart data={asset.sparkline} isPositive={isPositive} height={40} />
            </div>

            {/* Day Range Mini Bar */}
            <div className="pt-2 border-t border-[#363a45]/60 flex flex-col gap-1 text-[10px] text-[#787b86]">
              <div className="flex justify-between items-center tabular-nums">
                <span>L: {asset.low.toFixed(asset.price > 100 ? 1 : 2)}</span>
                <span>H: {asset.high.toFixed(asset.price > 100 ? 1 : 2)}</span>
              </div>
              <div className="w-full h-1 bg-[#131722] rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-[#2962ff] rounded-full"
                  style={{ width: `${currentPos}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
