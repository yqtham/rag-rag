import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { AdvancedChart } from './AdvancedChart';
import { Level2OrderBook } from './Level2OrderBook';
import { TimeAndSalesTape } from './TimeAndSalesTape';
import { AssetLogo } from './AssetLogo';
import { DrawingTool, MultiChartLayout } from '../types/market';
import {
  Grid,
  Square,
  Columns,
  LayoutGrid,
  MousePointer,
  Minus,
  Maximize2,
  TrendingUp,
  Percent,
  Compass,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Sliders,
  Bell,
  Download,
} from 'lucide-react';

export const ProWorkstation: React.FC = () => {
  const {
    assets,
    multiChartLayout,
    setMultiChartLayout,
    multiChartSymbols,
    setMultiChartSymbols,
    activeChartIndex,
    setActiveChartIndex,
    activeTool,
    setActiveTool,
    clearDrawings,
    setIsAlertsModalOpen,
    portfolio,
  } = useMarket();

  const [activeSideTab, setActiveSideTab] = useState<'orderbook' | 'tape' | 'trade'>('trade');
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);

  // Active asset for the focused chart quadrant
  const activeSymbol = multiChartSymbols[activeChartIndex] || multiChartSymbols[0] || 'NVDA';
  const focusedAsset = assets.find(a => a.symbol === activeSymbol) || assets[0];

  // Change symbol of focused quadrant
  const handleSelectSymbolForActiveQuadrant = (sym: string) => {
    setMultiChartSymbols(prev => {
      const copy = [...prev];
      copy[activeChartIndex] = sym;
      return copy;
    });
  };

  // Trade order state in side terminal
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [shares, setShares] = useState(25);
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [customPrice, setCustomPrice] = useState(focusedAsset.price);
  const [tradeStatus, setTradeStatus] = useState<string | null>(null);

  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    const p = orderType === 'MARKET' ? focusedAsset.price : customPrice;
    const res = portfolio.executeOrder({
      symbol: focusedAsset.symbol,
      type: orderSide,
      orderType,
      shares,
      price: p,
    });
    setTradeStatus(res.message);
    setTimeout(() => setTradeStatus(null), 3500);
  };

  // Export CSV of market data
  const handleExportCSV = () => {
    const headerStr = 'Symbol,Name,Category,Price,Change,ChangePercent,Volume,High52,Low52,Rating\n';
    const rows = assets.map(
      a =>
        `"${a.symbol}","${a.name}","${a.category}",${a.price},${a.change},${a.changePercent},${a.volume},${a.high52},${a.low52},"${a.rating}"`
    );
    const blob = new Blob([headerStr + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `apex_markets_data_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const drawingTools: { id: DrawingTool; label: string; icon: React.ReactNode }[] = [
    { id: 'cursor', label: 'Pointer Crosshair', icon: <MousePointer size={14} /> },
    { id: 'trendline', label: 'Trendline Ray', icon: <TrendingUp size={14} /> },
    { id: 'horizontal', label: 'Horizontal Level', icon: <Minus size={14} /> },
    { id: 'fibonacci', label: 'Fibonacci Retracement', icon: <Percent size={14} /> },
    { id: 'risk_reward', label: 'Risk/Reward Box', icon: <Compass size={14} /> },
  ];

  return (
    <div className="flex flex-col gap-2 w-full h-[calc(100vh-145px)] min-h-[680px]">
      {/* Pro Toolbar Bar */}
      <div className="bg-[#1e222d] border border-[#363a45] rounded-xs px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Active Quadrant Asset Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#787b86] uppercase font-bold tracking-wider">
            Chart Slot {activeChartIndex + 1}:
          </span>
          <div className="flex items-center gap-1.5 bg-[#131722] px-2 py-1 rounded-xs border border-[#363a45]">
            <AssetLogo symbol={focusedAsset.symbol} size={18} />
            <select
              value={focusedAsset.symbol}
              onChange={e => handleSelectSymbolForActiveQuadrant(e.target.value)}
              className="bg-transparent text-[#f0f3fa] font-bold text-xs focus:outline-hidden cursor-pointer"
            >
              {assets.map(a => (
                <option key={a.symbol} value={a.symbol} className="bg-[#1e222d]">
                  {a.symbol} · ${a.price.toFixed(a.price > 100 ? 2 : 4)}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] tabular-nums text-[#787b86] pl-2 border-l border-[#363a45]">
            <span>Vol: {focusedAsset.volumeFormatted}</span>
            <span>·</span>
            <span className={focusedAsset.change >= 0 ? 'text-[#089981] font-bold' : 'text-[#f23645] font-bold'}>
              {focusedAsset.change >= 0 ? '+' : ''}
              {focusedAsset.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Center: Multi-Chart Split Selector (1x1, 2x1, 2x2) */}
        <div className="flex items-center gap-1 bg-[#131722] p-0.5 rounded-xs border border-[#363a45]">
          <span className="text-[10px] text-[#787b86] uppercase font-bold px-1.5 hidden sm:inline">
            Layout:
          </span>
          <button
            onClick={() => setMultiChartLayout('1x1')}
            className={`p-1 rounded-xs transition-colors ${
              multiChartLayout === '1x1' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-[#dfe2f2]'
            }`}
            title="Single Chart (1x1)"
          >
            <Square size={13} />
          </button>
          <button
            onClick={() => setMultiChartLayout('2x1')}
            className={`p-1 rounded-xs transition-colors ${
              multiChartLayout === '2x1' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-[#dfe2f2]'
            }`}
            title="Dual Side-by-Side (2x1)"
          >
            <Columns size={13} />
          </button>
          <button
            onClick={() => setMultiChartLayout('2x2')}
            className={`p-1 rounded-xs transition-colors ${
              multiChartLayout === '2x2' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-[#dfe2f2]'
            }`}
            title="Quad Matrix (2x2)"
          >
            <LayoutGrid size={13} />
          </button>
        </div>

        {/* Right Actions: Alerts & CSV Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAlertsModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#131722] hover:bg-[#2a2e39] text-[#dfe2f2] border border-[#363a45] rounded-xs text-[11px] font-semibold"
          >
            <Bell size={13} className="text-[#2962ff]" />
            <span>Set Alert</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#131722] hover:bg-[#2a2e39] text-[#dfe2f2] border border-[#363a45] rounded-xs text-[11px] font-semibold"
            title="Export all market quotes as CSV"
          >
            <Download size={13} className="text-[#089981]" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className="p-1.5 bg-[#131722] hover:bg-[#2a2e39] text-[#787b86] hover:text-[#f0f3fa] border border-[#363a45] rounded-xs"
            title={isSidePanelOpen ? 'Collapse side panel' : 'Expand side panel'}
          >
            {isSidePanelOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </div>

      {/* Main Workspace: Left Drawing Rail + Center Multi-Chart View + Right Institutional Dock */}
      <div className="flex-1 flex gap-2 overflow-hidden min-h-0">
        {/* Left Drawing Tools Vertical Rail (TradingView iconic left toolbar) */}
        <div className="w-10 bg-[#1e222d] border border-[#363a45] rounded-xs flex flex-col items-center py-2 gap-1.5 shrink-0 select-none">
          {drawingTools.map(t => {
            const isActive = activeTool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTool(t.id)}
                title={t.label}
                className={`w-7 h-7 flex items-center justify-center rounded-xs transition-colors ${
                  isActive
                    ? 'bg-[#2962ff] text-white shadow-xs'
                    : 'text-[#787b86] hover:text-[#f0f3fa] hover:bg-[#2a2e39]'
                }`}
              >
                {t.icon}
              </button>
            );
          })}
        </div>

        {/* Center Multi-Chart Canvas Grid */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {multiChartLayout === '1x1' && (
            <div className="w-full h-full">
              <AdvancedChart asset={focusedAsset} />
            </div>
          )}

          {multiChartLayout === '2x1' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full h-full">
              {[0, 1].map(idx => {
                const sym = multiChartSymbols[idx] || (idx === 0 ? 'NVDA' : 'SPX');
                const asset = assets.find(a => a.symbol === sym) || assets[0];
                const isFocused = activeChartIndex === idx;

                return (
                  <div
                    key={idx}
                    onClick={() => setActiveChartIndex(idx)}
                    className={`h-full rounded-xs transition-all ${
                      isFocused ? 'ring-1 ring-[#2962ff]' : 'opacity-90 hover:opacity-100'
                    }`}
                  >
                    <AdvancedChart asset={asset} compact />
                  </div>
                );
              })}
            </div>
          )}

          {multiChartLayout === '2x2' && (
            <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-2 w-full h-full overflow-y-auto md:overflow-hidden">
              {[0, 1, 2, 3].map(idx => {
                const defaultSyms = ['NVDA', 'SPX', 'BTCUSD', 'AAPL'];
                const sym = multiChartSymbols[idx] || defaultSyms[idx];
                const asset = assets.find(a => a.symbol === sym) || assets[idx];
                const isFocused = activeChartIndex === idx;

                return (
                  <div
                    key={idx}
                    onClick={() => setActiveChartIndex(idx)}
                    className={`h-full min-h-[220px] rounded-xs transition-all ${
                      isFocused ? 'ring-1 ring-[#2962ff]' : 'opacity-90 hover:opacity-100'
                    }`}
                  >
                    <AdvancedChart asset={asset} compact />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Dock: Level 2 Order Book, Time & Sales Tape, Execution Terminal */}
        {isSidePanelOpen && (
          <div className="w-80 md:w-88 bg-[#1e222d] border border-[#363a45] rounded-xs flex flex-col justify-between overflow-hidden shrink-0">
            {/* Dock Tabs */}
            <div className="grid grid-cols-3 p-1 bg-[#131722] border-b border-[#363a45] text-xs font-semibold">
              <button
                onClick={() => setActiveSideTab('trade')}
                className={`py-1.5 rounded-xs transition-colors ${
                  activeSideTab === 'trade' ? 'bg-[#2a2e39] text-[#f0f3fa]' : 'text-[#787b86]'
                }`}
              >
                Trade
              </button>
              <button
                onClick={() => setActiveSideTab('orderbook')}
                className={`py-1.5 rounded-xs transition-colors ${
                  activeSideTab === 'orderbook' ? 'bg-[#2a2e39] text-[#f0f3fa]' : 'text-[#787b86]'
                }`}
              >
                DOM L2
              </button>
              <button
                onClick={() => setActiveSideTab('tape')}
                className={`py-1.5 rounded-xs transition-colors ${
                  activeSideTab === 'tape' ? 'bg-[#2a2e39] text-[#f0f3fa]' : 'text-[#787b86]'
                }`}
              >
                Tape
              </button>
            </div>

            {/* Dock Content */}
            <div className="flex-1 overflow-y-auto p-3">
              {activeSideTab === 'orderbook' && (
                <Level2OrderBook
                  asset={focusedAsset}
                  onPriceSelect={p => {
                    setCustomPrice(p);
                    setOrderType('LIMIT');
                    setActiveSideTab('trade');
                  }}
                />
              )}

              {activeSideTab === 'tape' && <TimeAndSalesTape asset={focusedAsset} />}

              {activeSideTab === 'trade' && (
                <div className="flex flex-col gap-3">
                  {/* Symbol header info */}
                  <div className="p-2.5 bg-[#131722] rounded-xs border border-[#363a45] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <AssetLogo symbol={focusedAsset.symbol} size={22} />
                      <div>
                        <span className="font-bold text-[#f0f3fa] block">{focusedAsset.symbol}</span>
                        <span className="text-[10px] text-[#787b86]">{focusedAsset.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-[#f0f3fa] block tabular-nums">
                        ${focusedAsset.price.toFixed(focusedAsset.price > 100 ? 2 : 4)}
                      </span>
                      <span className="text-[10px] text-[#089981] font-semibold">Ready to route</span>
                    </div>
                  </div>

                  {/* Buy / Sell Selector */}
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#131722] rounded-xs border border-[#363a45]">
                    <button
                      type="button"
                      onClick={() => setOrderSide('BUY')}
                      className={`py-2 text-xs font-bold rounded-xs transition-colors ${
                        orderSide === 'BUY' ? 'bg-[#089981] text-white shadow-xs' : 'text-[#787b86]'
                      }`}
                    >
                      BUY / LONG
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderSide('SELL')}
                      className={`py-2 text-xs font-bold rounded-xs transition-colors ${
                        orderSide === 'SELL' ? 'bg-[#f23645] text-white shadow-xs' : 'text-[#787b86]'
                      }`}
                    >
                      SELL / SHORT
                    </button>
                  </div>

                  {/* Order Execution Form */}
                  <form onSubmit={handleExecuteTrade} className="space-y-3 text-xs">
                    {/* Order Type */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setOrderType('MARKET')}
                        className={`py-1.5 rounded-xs border text-xs font-medium ${
                          orderType === 'MARKET'
                            ? 'bg-[#2a2e39] border-[#2962ff] text-[#f0f3fa]'
                            : 'bg-[#131722] border-[#363a45] text-[#787b86]'
                        }`}
                      >
                        Market
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOrderType('LIMIT');
                          setCustomPrice(focusedAsset.price);
                        }}
                        className={`py-1.5 rounded-xs border text-xs font-medium ${
                          orderType === 'LIMIT'
                            ? 'bg-[#2a2e39] border-[#2962ff] text-[#f0f3fa]'
                            : 'bg-[#131722] border-[#363a45] text-[#787b86]'
                        }`}
                      >
                        Limit
                      </button>
                    </div>

                    {orderType === 'LIMIT' && (
                      <div>
                        <label className="text-[10px] text-[#787b86] block mb-1">Limit Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={customPrice}
                          onChange={e => setCustomPrice(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-[#131722] border border-[#363a45] text-[#f0f3fa] rounded-xs font-mono font-bold"
                        />
                      </div>
                    )}

                    {/* Quantity Stepper */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] text-[#787b86] uppercase font-bold">Quantity (Shares)</label>
                        <div className="flex gap-1">
                          {[10, 50, 100].map(n => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setShares(n)}
                              className="px-1.5 py-0.2 text-[10px] bg-[#131722] text-[#787b86] hover:text-[#f0f3fa] rounded-xs border border-[#363a45]"
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="number"
                        min="1"
                        value={shares}
                        onChange={e => setShares(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-2.5 py-1.5 bg-[#131722] border border-[#363a45] text-[#f0f3fa] rounded-xs text-center font-mono font-bold"
                      />
                    </div>

                    {/* Total Value */}
                    <div className="p-2 bg-[#131722] rounded-xs border border-[#363a45] flex justify-between items-center text-xs">
                      <span className="text-[#787b86]">Total Value</span>
                      <span className="font-mono font-bold text-[#f0f3fa] tabular-nums">
                        ${(shares * (orderType === 'MARKET' ? focusedAsset.price : customPrice)).toLocaleString(
                          'en-US',
                          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                        )}
                      </span>
                    </div>

                    {tradeStatus && (
                      <div className="p-2 bg-[#089981]/15 border border-[#089981]/30 text-[#089981] rounded-xs text-xs font-semibold">
                        {tradeStatus}
                      </div>
                    )}

                    <button
                      type="submit"
                      className={`w-full py-2.5 rounded-xs font-bold text-xs uppercase tracking-wider text-white transition-all shadow-md ${
                        orderSide === 'BUY'
                          ? 'bg-[#089981] hover:bg-[#07856f]'
                          : 'bg-[#f23645] hover:bg-[#d62b39]'
                      }`}
                    >
                      Execute {orderSide} Order
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Footer with Balance */}
            <div className="p-2.5 bg-[#171b26] border-t border-[#363a45] flex justify-between text-xs text-[#787b86]">
              <span>Paper Bal:</span>
              <span className="font-bold text-[#f0f3fa] tabular-nums font-mono">
                ${portfolio.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
