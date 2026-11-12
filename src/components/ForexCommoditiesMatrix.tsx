import React from 'react';
import { useMarket } from '../context/MarketContext';
import { AssetLogo } from './AssetLogo';
import { ArrowUpRight, ArrowDownRight, Globe, Flame } from 'lucide-react';

export const ForexCommoditiesMatrix: React.FC = () => {
  const { assets, setSelectedAsset, flashMap } = useMarket();

  const forexAssets = assets.filter(a => a.category === 'forex');
  const commodityAssets = assets.filter(a => a.category === 'commodities');

  // Forex cross rates simplified matrix
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD'];
  const crossRates: Record<string, Record<string, number>> = {
    USD: { USD: 1.0, EUR: 0.9205, GBP: 0.7678, JPY: 149.82, AUD: 1.4959 },
    EUR: { USD: 1.0864, EUR: 1.0, GBP: 0.8341, JPY: 162.76, AUD: 1.6251 },
    GBP: { USD: 1.3025, EUR: 1.1989, GBP: 1.0, JPY: 195.14, AUD: 1.9482 },
    JPY: { USD: 0.00667, EUR: 0.00614, GBP: 0.00512, JPY: 1.0, AUD: 0.00998 },
    AUD: { USD: 0.6685, EUR: 0.6153, GBP: 0.5133, JPY: 100.15, AUD: 1.0 },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* FX Cross Rates Matrix */}
      <div className="bg-[#1e222d] border border-[#363a45] rounded-xs p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-[#363a45]">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-[#2962ff]" />
              <h3 className="text-sm font-bold text-[#f0f3fa]">FX Cross Rates Matrix</h3>
            </div>
            <span className="text-[11px] text-[#787b86]">Institutional Interbank</span>
          </div>

          <div className="overflow-x-auto mt-3">
            <table className="w-full text-center text-xs">
              <thead>
                <tr className="border-b border-[#363a45] text-[#787b86] font-semibold text-[11px]">
                  <th className="py-2 text-left pl-2">Pair</th>
                  {currencies.map(c => (
                    <th key={c} className="py-2 px-2 font-mono">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#363a45]/40 text-[11px] font-mono tabular-nums">
                {currencies.map(rowCur => (
                  <tr key={rowCur} className="hover:bg-[#262a35]/60 transition-colors">
                    <td className="py-2 text-left pl-2 font-bold text-[#f0f3fa]">
                      {rowCur}
                    </td>
                    {currencies.map(colCur => {
                      const isSame = rowCur === colCur;
                      const rate = crossRates[rowCur]?.[colCur] ?? 1.0;
                      return (
                        <td
                          key={colCur}
                          className={`py-2 px-2 ${
                            isSame
                              ? 'text-[#787b86] bg-[#131722]/50'
                              : 'text-[#dfe2f2] font-semibold hover:text-[#2962ff] cursor-pointer'
                          }`}
                        >
                          {isSame ? '—' : rate > 10 ? rate.toFixed(2) : rate.toFixed(4)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-3 border-t border-[#363a45] flex items-center justify-between text-[11px] text-[#787b86]">
          <span>Real-time global FX spread tracking</span>
          <span className="text-[#089981]">24/5 FX Session Active</span>
        </div>
      </div>

      {/* Commodities Overview */}
      <div className="bg-[#1e222d] border border-[#363a45] rounded-xs p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-[#363a45]">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-[#ff9900]" />
              <h3 className="text-sm font-bold text-[#f0f3fa]">Commodities & Energy</h3>
            </div>
            <span className="text-[11px] text-[#787b86]">NYMEX / COMEX</span>
          </div>

          <div className="divide-y divide-[#363a45]/50 mt-2">
            {commodityAssets.map(asset => {
              const isPositive = asset.change >= 0;
              const flash = flashMap[asset.symbol];

              return (
                <div
                  key={asset.symbol}
                  onClick={() => setSelectedAsset(asset)}
                  className={`py-2.5 flex items-center justify-between hover:bg-[#262a35] px-2 rounded-xs cursor-pointer transition-colors ${
                    flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <AssetLogo symbol={asset.symbol} size={22} />
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-[#f0f3fa]">{asset.symbol}</span>
                      <span className="text-[11px] text-[#787b86]">{asset.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs tabular-nums">
                    <div className="text-right">
                      <span className="font-bold text-[#f0f3fa] block">
                        ${asset.price.toFixed(asset.price > 100 ? 2 : 3)}
                      </span>
                      <span
                        className={`text-[11px] font-semibold flex items-center justify-end ${
                          isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {isPositive ? '+' : ''}
                        {asset.changePercent.toFixed(2)}%
                      </span>
                    </div>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedAsset(asset);
                      }}
                      className="px-2 py-1 bg-[#2962ff]/15 hover:bg-[#2962ff] text-[#2962ff] hover:text-white rounded-xs font-semibold text-[11px] transition-colors"
                    >
                      Chart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-[#363a45] flex items-center justify-between text-[11px] text-[#787b86]">
          <span>Precious metals & fossil energy contracts</span>
          <span>CME Globex active</span>
        </div>
      </div>
    </div>
  );
};
