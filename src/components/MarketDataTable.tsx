import React, { useState, useMemo } from 'react';
import { useMarket } from '../context/MarketContext';
import { MarketAsset, TechnicalRating } from '../types/market';
import { AssetLogo } from './AssetLogo';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  Search,
  Filter,
  TrendingUp,
} from 'lucide-react';

type TableViewMode = 'all' | 'gainers' | 'losers' | 'active' | 'highs' | 'tech';

type SortField = 'symbol' | 'price' | 'changePercent' | 'volume' | 'marketCap';
type SortOrder = 'asc' | 'desc';

export const MarketDataTable: React.FC = () => {
  const {
    assets,
    setSelectedAsset,
    toggleWatchlist,
    isInWatchlist,
    flashMap,
    activeCategory,
    setActiveCategory,
  } = useMarket();

  const [viewMode, setViewMode] = useState<TableViewMode>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('marketCap');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Sectors list
  const sectors = useMemo(() => {
    const set = new Set<string>();
    assets.forEach(a => {
      if (a.sector) set.add(a.sector);
    });
    return ['All', ...Array.from(set)];
  }, [assets]);

  // Handle column header sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filter & Sort
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // Category filter
      if (activeCategory === 'watchlist') {
        if (!isInWatchlist(asset.symbol)) return false;
      } else if (activeCategory !== 'all') {
        if (asset.category !== activeCategory) return false;
      }

      // Sector filter
      if (selectedSector !== 'All' && asset.sector !== selectedSector) {
        return false;
      }

      // View mode filters
      if (viewMode === 'gainers' && asset.changePercent <= 0) return false;
      if (viewMode === 'losers' && asset.changePercent >= 0) return false;
      if (viewMode === 'highs') {
        const distFrom52High = ((asset.high52 - asset.price) / asset.high52) * 100;
        if (distFrom52High > 5) return false;
      }
      if (viewMode === 'tech') {
        if (asset.rating !== 'Strong Buy' && asset.rating !== 'Strong Sell') return false;
      }

      // Search term
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        return (
          asset.symbol.toLowerCase().includes(query) ||
          asset.name.toLowerCase().includes(query) ||
          (asset.sector && asset.sector.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [assets, activeCategory, selectedSector, viewMode, searchTerm, isInWatchlist]);

  // Sort
  const sortedAssets = useMemo(() => {
    const list = [...filteredAssets];

    if (viewMode === 'active') {
      return list.sort((a, b) => b.volume - a.volume);
    }
    if (viewMode === 'gainers') {
      return list.sort((a, b) => b.changePercent - a.changePercent);
    }
    if (viewMode === 'losers') {
      return list.sort((a, b) => a.changePercent - b.changePercent);
    }

    return list.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'marketCap') {
        valA = a.marketCap || 0;
        valB = b.marketCap || 0;
      }

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [filteredAssets, viewMode, sortField, sortOrder]);

  const getRatingBadge = (rating: TechnicalRating) => {
    switch (rating) {
      case 'Strong Buy':
        return <span className="px-2 py-0.5 rounded-xs text-[11px] font-bold bg-[#089981]/15 text-[#089981]">Strong Buy</span>;
      case 'Buy':
        return <span className="px-2 py-0.5 rounded-xs text-[11px] font-medium bg-[#089981]/10 text-[#089981]">Buy</span>;
      case 'Neutral':
        return <span className="px-2 py-0.5 rounded-xs text-[11px] font-medium bg-[#787b86]/15 text-[#c3c5d8]">Neutral</span>;
      case 'Sell':
        return <span className="px-2 py-0.5 rounded-xs text-[11px] font-medium bg-[#f23645]/10 text-[#f23645]">Sell</span>;
      case 'Strong Sell':
        return <span className="px-2 py-0.5 rounded-xs text-[11px] font-bold bg-[#f23645]/15 text-[#f23645]">Strong Sell</span>;
    }
  };

  return (
    <div className="bg-[#1e222d] border border-[#363a45] rounded-xs overflow-hidden flex flex-col">
      {/* Table Navigation & Filter Toolbar */}
      <div className="p-3 border-b border-[#363a45] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 lg:pb-0">
          {[
            { id: 'all', label: 'All Markets' },
            { id: 'gainers', label: 'Top Gainers' },
            { id: 'losers', label: 'Top Losers' },
            { id: 'active', label: 'Most Active' },
            { id: 'highs', label: '52W Highs' },
            { id: 'tech', label: 'Technical Signals' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as TableViewMode)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xs transition-colors whitespace-nowrap shrink-0 ${
                viewMode === tab.id
                  ? 'bg-[#2a2e39] text-[#f0f3fa] font-semibold border-b-2 border-[#2962ff]'
                  : 'text-[#787b86] hover:text-[#dfe2f2] hover:bg-[#262a35]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sector Filters */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#131722] border border-[#363a45] rounded-xs text-xs text-[#c3c5d8]">
            <Filter size={12} className="text-[#787b86]" />
            <select
              value={activeCategory}
              onChange={e => setActiveCategory(e.target.value as any)}
              aria-label="Filter asset class"
              className="bg-transparent text-[#f0f3fa] focus:outline-hidden text-xs cursor-pointer"
            >
              <option value="all" className="bg-[#1e222d]">All Asset Classes</option>
              <option value="stocks" className="bg-[#1e222d]">Equities</option>
              <option value="crypto" className="bg-[#1e222d]">Crypto</option>
              <option value="forex" className="bg-[#1e222d]">Forex</option>
              <option value="indices" className="bg-[#1e222d]">Indices</option>
              <option value="commodities" className="bg-[#1e222d]">Commodities</option>
              <option value="bonds" className="bg-[#1e222d]">Bonds</option>
              <option value="watchlist" className="bg-[#1e222d]">⭐ My Watchlist</option>
            </select>
          </div>

          {/* Sector Filter */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-[#131722] border border-[#363a45] rounded-xs text-xs text-[#c3c5d8]">
            <select
              value={selectedSector}
              onChange={e => setSelectedSector(e.target.value)}
              aria-label="Filter sector"
              className="bg-transparent text-[#f0f3fa] focus:outline-hidden text-xs cursor-pointer"
            >
              {sectors.map(s => (
                <option key={s} value={s} className="bg-[#1e222d]">
                  {s === 'All' ? 'All Sectors' : s}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-[#787b86]" />
            <input
              type="text"
              placeholder="Filter symbol/name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-36 md:w-44 pl-8 pr-2 py-1 bg-[#131722] border border-[#363a45] focus:border-[#2962ff] text-xs text-[#f0f3fa] placeholder-[#787b86] rounded-xs focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#1e222d] border-b border-[#363a45] text-[#787b86] font-semibold text-[11px] uppercase tracking-wider select-none">
              <th className="py-2.5 pl-4 pr-2 w-8 text-center">⭐</th>
              <th
                onClick={() => handleSort('symbol')}
                className="py-2.5 px-3 cursor-pointer hover:text-[#f0f3fa] transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Symbol & Name</span>
                  {sortField === 'symbol' ? (
                    sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                  ) : (
                    <ArrowUpDown size={12} className="opacity-40" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('price')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-[#f0f3fa] transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Last Price</span>
                  {sortField === 'price' ? (
                    sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                  ) : (
                    <ArrowUpDown size={12} className="opacity-40" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('changePercent')}
                className="py-2.5 px-3 text-right cursor-pointer hover:text-[#f0f3fa] transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Chg %</span>
                  {sortField === 'changePercent' ? (
                    sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                  ) : (
                    <ArrowUpDown size={12} className="opacity-40" />
                  )}
                </div>
              </th>
              <th className="py-2.5 px-3 text-right hidden md:table-cell">Chg $</th>
              <th className="py-2.5 px-3 text-center hidden lg:table-cell">Technical</th>
              <th
                onClick={() => handleSort('volume')}
                className="py-2.5 px-3 text-right hidden sm:table-cell cursor-pointer hover:text-[#f0f3fa] transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Volume</span>
                  {sortField === 'volume' ? (
                    sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                  ) : (
                    <ArrowUpDown size={12} className="opacity-40" />
                  )}
                </div>
              </th>
              <th
                onClick={() => handleSort('marketCap')}
                className="py-2.5 px-3 text-right hidden xl:table-cell cursor-pointer hover:text-[#f0f3fa] transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Mkt Cap</span>
                  {sortField === 'marketCap' ? (
                    sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                  ) : (
                    <ArrowUpDown size={12} className="opacity-40" />
                  )}
                </div>
              </th>
              <th className="py-2.5 px-3 text-center w-28 hidden md:table-cell">7D Trend</th>
              <th className="py-2.5 pr-4 pl-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#363a45]/50">
            {sortedAssets.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-[#787b86]">
                  <p className="text-sm font-medium">No market instruments match your filters</p>
                  <button
                    onClick={() => {
                      setViewMode('all');
                      setSearchTerm('');
                      setSelectedSector('All');
                      setActiveCategory('all');
                    }}
                    className="mt-2 text-xs text-[#2962ff] hover:underline"
                  >
                    Reset all filters
                  </button>
                </td>
              </tr>
            ) : (
              sortedAssets.map(asset => {
                const isPositive = asset.change >= 0;
                const inWatch = isInWatchlist(asset.symbol);
                const flash = flashMap[asset.symbol];

                return (
                  <tr
                    key={asset.symbol}
                    className={`hover:bg-[#2a2e39]/70 group transition-colors cursor-pointer ${
                      flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''
                    }`}
                    onClick={() => setSelectedAsset(asset)}
                  >
                    {/* Watchlist Star */}
                    <td
                      className="py-2 pl-4 pr-2 text-center"
                      onClick={e => {
                        e.stopPropagation();
                        toggleWatchlist(asset.symbol);
                      }}
                    >
                      <button
                        aria-label={`Toggle ${asset.symbol} in watchlist`}
                        className="text-[#787b86] hover:text-[#ffd700] transition-colors focus:outline-hidden"
                      >
                        <Star
                          size={14}
                          className={inWatch ? 'fill-[#ffd700] text-[#ffd700]' : ''}
                        />
                      </button>
                    </td>

                    {/* Symbol & Name */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <AssetLogo symbol={asset.symbol} size={24} />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#f0f3fa] group-hover:text-white transition-colors">
                              {asset.symbol}
                            </span>
                            <span className="text-[10px] text-[#787b86] px-1 bg-[#131722] rounded-xs font-mono">
                              {asset.exchange}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#787b86] truncate max-w-[130px] sm:max-w-[200px]">
                            {asset.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Last Price */}
                    <td className="py-2.5 px-3 text-right">
                      <span className="font-semibold text-[#f0f3fa] tabular-nums text-[13px]">
                        {asset.price > 100
                          ? asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : asset.price.toFixed(asset.category === 'forex' ? 4 : 3)}
                      </span>
                    </td>

                    {/* Change % */}
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`inline-block font-semibold tabular-nums text-xs px-1.5 py-0.5 rounded-xs ${
                          isPositive
                            ? 'text-[#089981] bg-[#089981]/12'
                            : 'text-[#f23645] bg-[#f23645]/12'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {asset.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    {/* Change $ */}
                    <td className="py-2.5 px-3 text-right hidden md:table-cell tabular-nums text-xs">
                      <span className={isPositive ? 'text-[#089981]' : 'text-[#f23645]'}>
                        {isPositive ? '+' : ''}
                        {asset.change > 100
                          ? asset.change.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : asset.change.toFixed(asset.category === 'forex' ? 4 : 2)}
                      </span>
                    </td>

                    {/* Technical Rating */}
                    <td className="py-2.5 px-3 text-center hidden lg:table-cell">
                      {getRatingBadge(asset.rating)}
                    </td>

                    {/* Volume */}
                    <td className="py-2.5 px-3 text-right hidden sm:table-cell tabular-nums text-[#dfe2f2]">
                      {asset.volumeFormatted}
                    </td>

                    {/* Market Cap */}
                    <td className="py-2.5 px-3 text-right hidden xl:table-cell tabular-nums text-[#c3c5d8]">
                      {asset.marketCapFormatted || '—'}
                    </td>

                    {/* 7D Trend Mini Sparkline */}
                    <td className="py-2.5 px-3 text-center hidden md:table-cell">
                      <div className="w-24 h-6 mx-auto">
                        {asset.sparkline.length > 2 && (
                          <svg viewBox="0 0 100 24" className="w-full h-full overflow-visible">
                            <path
                              d={`M ${asset.sparkline
                                .map((v, i) => {
                                  const min = Math.min(...asset.sparkline);
                                  const max = Math.max(...asset.sparkline);
                                  const range = max - min || 1;
                                  const x = (i / (asset.sparkline.length - 1)) * 100;
                                  const y = 22 - ((v - min) / range) * 20;
                                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                                })
                                .join(' L ')}`}
                              fill="none"
                              stroke={isPositive ? '#089981' : '#f23645'}
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="py-2.5 pr-4 pl-2 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedAsset(asset);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold bg-[#2962ff]/15 hover:bg-[#2962ff] text-[#2962ff] hover:text-white rounded-xs transition-colors inline-flex items-center gap-1"
                      >
                        <TrendingUp size={12} />
                        <span>Trade</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer info */}
      <div className="p-2.5 bg-[#131722] border-t border-[#363a45] flex items-center justify-between text-[11px] text-[#787b86]">
        <span>Showing {sortedAssets.length} instruments · Real-time quotes from global exchanges</span>
        <span className="hidden sm:inline">Data refreshed continuously · Tabular numbers active</span>
      </div>
    </div>
  );
};
