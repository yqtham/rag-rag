import React, { useState, useMemo } from 'react';
import { useMarket } from '../context/MarketContext';
import { AssetLogo } from './AssetLogo';
import { SlidersHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Download, Star } from 'lucide-react';

export const ProScreener: React.FC = () => {
  const { assets, setSelectedAsset, toggleWatchlist, isInWatchlist } = useMarket();

  // Filter criteria
  const [filterRsi, setFilterRsi] = useState<'all' | 'oversold' | 'overbought'>('all');
  const [filterSma, setFilterSma] = useState<'all' | 'above' | 'below'>('all');
  const [filterRating, setFilterRating] = useState<string>('all');
  const [filterCap, setFilterCap] = useState<string>('all');
  const [sortCol, setSortCol] = useState<'symbol' | 'price' | 'changePercent' | 'rsi14' | 'volume'>('changePercent');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    return assets.filter(a => {
      // RSI Filter
      if (filterRsi === 'oversold' && (a.rsi14 || 50) >= 35) return false;
      if (filterRsi === 'overbought' && (a.rsi14 || 50) <= 65) return false;

      // SMA 200 Filter
      if (filterSma === 'above' && !a.aboveSma200) return false;
      if (filterSma === 'below' && a.aboveSma200) return false;

      // Rating Filter
      if (filterRating !== 'all' && a.rating !== filterRating) return false;

      // Market Cap Tier
      if (filterCap === 'mega' && (!a.marketCap || a.marketCap < 200000000000)) return false;
      if (filterCap === 'large' && (!a.marketCap || a.marketCap >= 200000000000 || a.marketCap < 10000000000)) return false;

      return true;
    });
  }, [assets, filterRsi, filterSma, filterRating, filterCap]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA: any = a[sortCol] ?? 0;
      let valB: any = b[sortCol] ?? 0;
      if (sortCol === 'symbol') {
        return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDir === 'asc' ? valA - valB : valB - valA;
    });
  }, [filtered, sortCol, sortDir]);

  const handleSort = (col: typeof sortCol) => {
    if (sortCol === col) setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    else {
      setSortCol(col);
      setSortDir('desc');
    }
  };

  return (
    <div className="bg-[#1e222d] border border-[#363a45] rounded-xs p-4 flex flex-col gap-4">
      {/* Header and Quantitative Filters Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b border-[#363a45]">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-[#2962ff]" />
            <h3 className="text-sm font-bold text-[#f0f3fa]">Quantitative Technical Screener</h3>
            <span className="text-[10px] bg-[#089981]/15 text-[#089981] px-1.5 py-0.2 rounded-xs font-semibold">
              Live Algorithmic Scanner
            </span>
          </div>
          <p className="text-xs text-[#787b86] mt-0.5">
            Filter market universe by Relative Strength Index (RSI), 200-day Simple Moving Average, and Institutional Capitalization.
          </p>
        </div>

        {/* Filter Pickers */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* RSI Filter */}
          <div className="bg-[#131722] border border-[#363a45] rounded-xs px-2 py-1">
            <span className="text-[10px] text-[#787b86] mr-1 font-bold">RSI (14):</span>
            <select
              value={filterRsi}
              onChange={e => setFilterRsi(e.target.value as any)}
              className="bg-transparent text-[#f0f3fa] focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-[#1e222d]">All Ranges</option>
              <option value="oversold" className="bg-[#1e222d]">Oversold (&lt; 35)</option>
              <option value="overbought" className="bg-[#1e222d]">Overbought (&gt; 65)</option>
            </select>
          </div>

          {/* SMA 200 Filter */}
          <div className="bg-[#131722] border border-[#363a45] rounded-xs px-2 py-1">
            <span className="text-[10px] text-[#787b86] mr-1 font-bold">Trend (200 SMA):</span>
            <select
              value={filterSma}
              onChange={e => setFilterSma(e.target.value as any)}
              className="bg-transparent text-[#f0f3fa] focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-[#1e222d]">All Trends</option>
              <option value="above" className="bg-[#1e222d]">Above 200 SMA (Bullish)</option>
              <option value="below" className="bg-[#1e222d]">Below 200 SMA (Bearish)</option>
            </select>
          </div>

          {/* Technical Rating */}
          <div className="bg-[#131722] border border-[#363a45] rounded-xs px-2 py-1">
            <span className="text-[10px] text-[#787b86] mr-1 font-bold">Signal:</span>
            <select
              value={filterRating}
              onChange={e => setFilterRating(e.target.value)}
              className="bg-transparent text-[#f0f3fa] focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-[#1e222d]">All Ratings</option>
              <option value="Strong Buy" className="bg-[#1e222d]">Strong Buy</option>
              <option value="Buy" className="bg-[#1e222d]">Buy</option>
              <option value="Neutral" className="bg-[#1e222d]">Neutral</option>
              <option value="Sell" className="bg-[#1e222d]">Sell</option>
            </select>
          </div>
        </div>
      </div>

      {/* Screener Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#363a45] text-[#787b86] font-semibold text-[11px] uppercase tracking-wider select-none">
              <th className="py-2.5 pl-3 w-8">⭐</th>
              <th onClick={() => handleSort('symbol')} className="py-2.5 px-3 cursor-pointer hover:text-white">
                <div className="flex items-center gap-1">
                  <span>Symbol & Name</span>
                  <ArrowUpDown size={11} className="opacity-40" />
                </div>
              </th>
              <th onClick={() => handleSort('price')} className="py-2.5 px-3 text-right cursor-pointer hover:text-white">
                <div className="flex items-center justify-end gap-1">
                  <span>Last Price</span>
                  <ArrowUpDown size={11} className="opacity-40" />
                </div>
              </th>
              <th onClick={() => handleSort('changePercent')} className="py-2.5 px-3 text-right cursor-pointer hover:text-white">
                <div className="flex items-center justify-end gap-1">
                  <span>1D Chg %</span>
                  <ArrowUpDown size={11} className="opacity-40" />
                </div>
              </th>
              <th onClick={() => handleSort('rsi14')} className="py-2.5 px-3 text-center cursor-pointer hover:text-white">
                <div className="flex items-center justify-center gap-1">
                  <span>RSI (14)</span>
                  <ArrowUpDown size={11} className="opacity-40" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-center">200 SMA Status</th>
              <th className="py-2.5 px-3 text-right hidden sm:table-cell">Beta</th>
              <th className="py-2.5 px-3 text-right hidden md:table-cell">ATR (Volatility)</th>
              <th className="py-2.5 px-3 text-center">Algorithmic Rating</th>
              <th className="py-2.5 pr-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#363a45]/40 text-xs">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-[#787b86]">
                  No instruments match your quantitative criteria.
                </td>
              </tr>
            ) : (
              sorted.map(asset => {
                const isPositive = asset.changePercent >= 0;
                const inWatch = isInWatchlist(asset.symbol);
                const rsi = asset.rsi14 || 50;

                return (
                  <tr
                    key={asset.symbol}
                    onClick={() => setSelectedAsset(asset)}
                    className="hover:bg-[#262a35] transition-colors cursor-pointer group"
                  >
                    <td
                      className="py-2.5 pl-3"
                      onClick={e => {
                        e.stopPropagation();
                        toggleWatchlist(asset.symbol);
                      }}
                    >
                      <button aria-label="Toggle Watchlist">
                        <Star size={13} className={inWatch ? 'fill-[#ffd700] text-[#ffd700]' : 'text-[#787b86]'} />
                      </button>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <AssetLogo symbol={asset.symbol} size={22} />
                        <div>
                          <span className="font-bold text-[#f0f3fa] group-hover:text-white block">{asset.symbol}</span>
                          <span className="text-[11px] text-[#787b86] truncate max-w-[140px] block">{asset.name}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#f0f3fa] tabular-nums">
                      ${asset.price.toFixed(asset.price > 100 ? 2 : 4)}
                    </td>

                    <td className="py-2.5 px-3 text-right tabular-nums">
                      <span
                        className={`font-semibold px-1.5 py-0.5 rounded-xs ${
                          isPositive ? 'text-[#089981] bg-[#089981]/12' : 'text-[#f23645] bg-[#f23645]/12'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {asset.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    {/* RSI */}
                    <td className="py-2.5 px-3 text-center tabular-nums font-mono">
                      <span
                        className={`font-bold ${
                          rsi >= 70 ? 'text-[#f23645]' : rsi <= 35 ? 'text-[#089981]' : 'text-[#dfe2f2]'
                        }`}
                      >
                        {rsi.toFixed(1)}
                      </span>
                    </td>

                    {/* 200 SMA Status */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-xs text-[10px] font-bold ${
                          asset.aboveSma200 ? 'bg-[#089981]/15 text-[#089981]' : 'bg-[#f23645]/15 text-[#f23645]'
                        }`}
                      >
                        {asset.aboveSma200 ? 'Above 200 SMA' : 'Below 200 SMA'}
                      </span>
                    </td>

                    {/* Beta */}
                    <td className="py-2.5 px-3 text-right tabular-nums text-[#c3c5d8] hidden sm:table-cell font-mono">
                      {asset.beta ?? '1.00'}
                    </td>

                    {/* ATR */}
                    <td className="py-2.5 px-3 text-right tabular-nums text-[#c3c5d8] hidden md:table-cell font-mono">
                      ${asset.atr ? asset.atr.toFixed(2) : '—'}
                    </td>

                    {/* Rating */}
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-semibold text-[11px] text-[#dfe2f2]">{asset.rating}</span>
                    </td>

                    {/* Action */}
                    <td className="py-2.5 pr-3 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedAsset(asset);
                        }}
                        className="px-2 py-1 bg-[#2962ff]/15 hover:bg-[#2962ff] text-[#2962ff] hover:text-white rounded-xs font-semibold text-[11px] transition-colors"
                      >
                        Chart
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="pt-2 border-t border-[#363a45] flex items-center justify-between text-[11px] text-[#787b86]">
        <span>Scanning {sorted.length} qualifying instruments across global markets</span>
        <span>Quantitative signals update on dynamic market close</span>
      </div>
    </div>
  );
};
