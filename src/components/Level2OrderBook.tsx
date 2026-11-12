import React from 'react';
import { useMarket } from '../context/MarketContext';
import { MarketAsset } from '../types/market';
import { Layers } from 'lucide-react';

interface Level2OrderBookProps {
  asset: MarketAsset;
  onPriceSelect?: (price: number) => void;
}

export const Level2OrderBook: React.FC<Level2OrderBookProps> = ({ asset, onPriceSelect }) => {
  const { getOrderBook, portfolio } = useMarket();
  const book = getOrderBook(asset.symbol);

  return (
    <div className="bg-[#1e222d] border border-[#363a45] rounded-xs flex flex-col justify-between text-xs overflow-hidden select-none">
      {/* Header */}
      <div className="p-2.5 bg-[#171b26] border-b border-[#363a45] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Layers size={13} className="text-[#2962ff]" />
          <span className="font-bold text-[#f0f3fa]">Level 2 Depth</span>
          <span className="text-[10px] text-[#787b86] font-mono">({asset.symbol})</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] tabular-nums">
          <span className="text-[#787b86]">Spread:</span>
          <span className="text-[#dfe2f2] font-semibold">${book.spread}</span>
          <span className="text-[#787b86]">({book.spreadPercent}%)</span>
        </div>
      </div>

      {/* Columns Header */}
      <div className="grid grid-cols-3 px-3 py-1 bg-[#131722] border-b border-[#363a45]/60 text-[10px] font-bold text-[#787b86] uppercase">
        <span className="text-left">Price (USD)</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total Depth</span>
      </div>

      {/* Asks (Sellers - descending red order) */}
      <div className="flex flex-col-reverse divide-y divide-[#363a45]/30">
        {book.asks.map((ask, idx) => (
          <div
            key={'ask-' + idx}
            onClick={() => onPriceSelect && onPriceSelect(ask.price)}
            className="relative grid grid-cols-3 px-3 py-1 cursor-pointer hover:bg-[#2a2e39] font-mono text-[11px] tabular-nums transition-colors"
          >
            {/* Visual Depth Bar Fill */}
            <div
              className="absolute right-0 top-0 bottom-0 bg-[#f23645]/12 pointer-events-none"
              style={{ width: `${ask.depthPercent}%` }}
            />
            <span className="text-[#f23645] font-semibold relative z-10 text-left">
              {ask.price.toFixed(asset.price > 100 ? 2 : 4)}
            </span>
            <span className="text-[#dfe2f2] relative z-10 text-right">{ask.size.toLocaleString()}</span>
            <span className="text-[#787b86] relative z-10 text-right">{ask.total.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Mid Market Current Price Strip */}
      <div className="px-3 py-1.5 bg-[#171b26] border-y border-[#363a45] flex items-center justify-between font-mono font-bold text-xs">
        <span className="text-[#787b86] text-[10px] uppercase font-sans">Mid Market</span>
        <span className={`text-[13px] tabular-nums ${asset.change >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
          ${asset.price.toFixed(asset.price > 100 ? 2 : 4)}
        </span>
        <span className="text-[#787b86] text-[10px]">{asset.exchange}</span>
      </div>

      {/* Bids (Buyers - green order) */}
      <div className="flex flex-col divide-y divide-[#363a45]/30">
        {book.bids.map((bid, idx) => (
          <div
            key={'bid-' + idx}
            onClick={() => onPriceSelect && onPriceSelect(bid.price)}
            className="relative grid grid-cols-3 px-3 py-1 cursor-pointer hover:bg-[#2a2e39] font-mono text-[11px] tabular-nums transition-colors"
          >
            {/* Visual Depth Bar Fill */}
            <div
              className="absolute right-0 top-0 bottom-0 bg-[#089981]/12 pointer-events-none"
              style={{ width: `${bid.depthPercent}%` }}
            />
            <span className="text-[#089981] font-semibold relative z-10 text-left">
              {bid.price.toFixed(asset.price > 100 ? 2 : 4)}
            </span>
            <span className="text-[#dfe2f2] relative z-10 text-right">{bid.size.toLocaleString()}</span>
            <span className="text-[#787b86] relative z-10 text-right">{bid.total.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Bottom Quick Execution Ladder buttons */}
      <div className="p-2 bg-[#171b26] border-t border-[#363a45] grid grid-cols-2 gap-2">
        <button
          onClick={() =>
            portfolio.executeOrder({
              symbol: asset.symbol,
              type: 'BUY',
              orderType: 'MARKET',
              shares: 10,
              price: book.asks[0]?.price || asset.price,
            })
          }
          className="py-1 px-2 bg-[#089981] hover:bg-[#07856f] text-white rounded-xs font-bold text-[11px] uppercase transition-colors"
        >
          Buy Market ({book.asks[0]?.price || asset.price})
        </button>
        <button
          onClick={() =>
            portfolio.executeOrder({
              symbol: asset.symbol,
              type: 'SELL',
              orderType: 'MARKET',
              shares: 10,
              price: book.bids[0]?.price || asset.price,
            })
          }
          className="py-1 px-2 bg-[#f23645] hover:bg-[#d62b39] text-white rounded-xs font-bold text-[11px] uppercase transition-colors"
        >
          Sell Market ({book.bids[0]?.price || asset.price})
        </button>
      </div>
    </div>
  );
};
