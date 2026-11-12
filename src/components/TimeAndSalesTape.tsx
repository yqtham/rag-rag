import React from 'react';
import { useMarket } from '../context/MarketContext';
import { MarketAsset } from '../types/market';
import { Activity } from 'lucide-react';

interface TimeAndSalesTapeProps {
  asset: MarketAsset;
}

export const TimeAndSalesTape: React.FC<TimeAndSalesTapeProps> = ({ asset }) => {
  const { tapePrints } = useMarket();

  return (
    <div className="bg-[#1e222d] border border-[#363a45] rounded-xs flex flex-col justify-between text-xs overflow-hidden select-none max-h-[380px]">
      {/* Header */}
      <div className="p-2.5 bg-[#171b26] border-b border-[#363a45] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Activity size={13} className="text-[#089981]" />
          <span className="font-bold text-[#f0f3fa]">Time & Sales Tape</span>
        </div>
        <span className="text-[10px] text-[#089981] font-mono animate-pulse">● LIVE</span>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 px-3 py-1 bg-[#131722] border-b border-[#363a45]/60 text-[10px] font-bold text-[#787b86] uppercase">
        <span className="text-left">Time</span>
        <span className="text-right">Price</span>
        <span className="text-right">Size</span>
      </div>

      {/* Stream List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#363a45]/30 font-mono text-[11px] tabular-nums">
        {tapePrints.slice(0, 20).map(tp => (
          <div
            key={tp.id}
            className={`grid grid-cols-3 px-3 py-1 hover:bg-[#262a35] transition-colors ${
              tp.side === 'BUY' ? 'text-[#089981]' : 'text-[#f23645]'
            }`}
          >
            <span className="text-[#787b86] text-left">{tp.time}</span>
            <span className="text-right font-semibold">${tp.price.toFixed(asset.price > 100 ? 2 : 4)}</span>
            <span className="text-right text-[#dfe2f2]">{tp.size}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-2 bg-[#171b26] border-t border-[#363a45] text-[10px] text-[#787b86] flex justify-between">
        <span>Direct NASDAQ / SIP Feed</span>
        <span>Speed: Ultra Low Latency</span>
      </div>
    </div>
  );
};
