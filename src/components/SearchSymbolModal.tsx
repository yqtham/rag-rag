import React, { useState, useEffect, useRef } from 'react';
import { useMarket } from '../context/MarketContext';
import { AssetLogo } from './AssetLogo';
import { Search, X, TrendingUp, Star } from 'lucide-react';

export const SearchSymbolModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    assets,
    setSelectedAsset,
    toggleWatchlist,
    isInWatchlist,
  } = useMarket();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K / Slash)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredAssets = assets.filter(asset => {
    if (selectedCategory !== 'all' && asset.category !== selectedCategory) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      asset.symbol.toLowerCase().includes(q) ||
      asset.name.toLowerCase().includes(q) ||
      asset.exchange.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#1e222d] border border-[#363a45] rounded-xs shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-3 bg-[#171b26] border-b border-[#363a45] flex items-center gap-2.5">
          <Search size={18} className="text-[#2962ff] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by symbol, company, commodity, or currency pair..."
            className="w-full bg-transparent text-[#f0f3fa] text-sm placeholder-[#787b86] focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#787b86] hover:text-[#f0f3fa]"
            >
              <X size={14} />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 text-xs text-[#787b86] hover:text-[#f0f3fa] border border-[#363a45] rounded-xs"
          >
            ESC
          </button>
        </div>

        {/* Quick Category Tabs */}
        <div className="px-3 py-2 bg-[#131722] border-b border-[#363a45] flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
          {[
            { id: 'all', label: 'All' },
            { id: 'stocks', label: 'Stocks' },
            { id: 'crypto', label: 'Crypto' },
            { id: 'forex', label: 'Forex' },
            { id: 'indices', label: 'Indices' },
            { id: 'commodities', label: 'Commodities' },
            { id: 'bonds', label: 'Bonds' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-2.5 py-1 rounded-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === tab.id
                  ? 'bg-[#2962ff] text-white'
                  : 'text-[#787b86] hover:text-[#dfe2f2] hover:bg-[#1e222d]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-[#363a45]/40 p-1">
          {filteredAssets.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#787b86]">
              No instruments found for "{query}".
            </div>
          ) : (
            filteredAssets.slice(0, 15).map(asset => {
              const inWatch = isInWatchlist(asset.symbol);
              const isPositive = asset.change >= 0;

              return (
                <div
                  key={asset.symbol}
                  onClick={() => {
                    setSelectedAsset(asset);
                    setIsSearchOpen(false);
                  }}
                  className="p-2.5 rounded-xs hover:bg-[#2a2e39] flex items-center justify-between cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <AssetLogo symbol={asset.symbol} size={26} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#f0f3fa] group-hover:text-white">
                          {asset.symbol}
                        </span>
                        <span className="text-[10px] text-[#787b86] px-1 bg-[#131722] rounded-xs font-mono">
                          {asset.exchange}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#787b86] truncate max-w-xs block">
                        {asset.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#f0f3fa] tabular-nums block">
                        ${asset.price.toFixed(asset.price > 100 ? 2 : 3)}
                      </span>
                      <span
                        className={`text-[11px] font-semibold tabular-nums ${
                          isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {asset.changePercent.toFixed(2)}%
                      </span>
                    </div>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleWatchlist(asset.symbol);
                      }}
                      className="p-1.5 text-[#787b86] hover:text-[#ffd700] rounded-xs"
                      title={inWatch ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    >
                      <Star
                        size={14}
                        className={inWatch ? 'fill-[#ffd700] text-[#ffd700]' : ''}
                      />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2 bg-[#171b26] border-t border-[#363a45] flex items-center justify-between text-[11px] text-[#787b86]">
          <span>Navigation: Click to select</span>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
