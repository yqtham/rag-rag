import React from 'react';
import { useMarket } from '../context/MarketContext';
import { AssetLogo } from './AssetLogo';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const MarketTickerRibbon: React.FC = () => {
  const { assets, setSelectedAsset, flashMap } = useMarket();

  // Filter 8 key marquee benchmark assets
  const keySymbols = ['SPX', 'NDX', 'DJI', 'BTCUSD', 'ETHUSD', 'EURUSD', 'XAUUSD', 'USOIL', 'US10Y'];
  const ribbonAssets = keySymbols
    .map(sym => assets.find(a => a.symbol === sym))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  return (
    <div className="w-full bg-[#131722] border-b border-[#363a45] overflow-x-auto select-none py-1.5 px-4 scrollbar-none">
      <div className="max-w-[1720px] mx-auto flex items-center gap-6 min-w-max">
        {ribbonAssets.map(asset => {
          const isPositive = asset.change >= 0;
          const flash = flashMap[asset.symbol];

          return (
            <button
              key={asset.symbol}
              onClick={() => setSelectedAsset(asset)}
              className={`flex items-center gap-2.5 px-2 py-1 rounded-xs hover:bg-[#1e222d] transition-all text-left group focus:outline-hidden ${
                flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''
              }`}
            >
              <AssetLogo symbol={asset.symbol} size={18} />
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-semibold text-[#dfe2f2] group-hover:text-white transition-colors">
                  {asset.symbol}
                </span>
                <span className="tabular-nums font-medium text-[#f0f3fa]">
                  {asset.price > 100
                    ? asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : asset.price.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 4 })}
                </span>
                <span
                  className={`flex items-center text-[11px] font-semibold tabular-nums ${
                    isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {isPositive ? '+' : ''}
                  {asset.changePercent.toFixed(2)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
