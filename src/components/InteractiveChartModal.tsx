import React, { useState, useMemo, useRef } from 'react';
import { useMarket } from '../context/MarketContext';
import { AssetLogo } from './AssetLogo';
import { Candle } from '../types/market';
import {
  X,
  Star,
  Maximize2,
  TrendingUp,
  TrendingDown,
  Layers,
  Activity,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
} from 'lucide-react';

export const InteractiveChartModal: React.FC = () => {
  const {
    selectedAsset,
    setSelectedAsset,
    toggleWatchlist,
    isInWatchlist,
    portfolio,
    flashMap,
  } = useMarket();

  const [chartType, setChartType] = useState<'candles' | 'line'>('candles');
  const [timeframe, setTimeframe] = useState<'1D' | '5D' | '1M' | '6M' | '1Y'>('1D');
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(false);
  const [showRSI, setShowRSI] = useState(false);

  // Order execution form state
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [shares, setShares] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<number>(selectedAsset?.price || 100);
  const [orderNotice, setOrderNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Crosshair state
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [cursorX, setCursorX] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  if (!selectedAsset) return null;

  const isPositive = selectedAsset.change >= 0;
  const inWatch = isInWatchlist(selectedAsset.symbol);
  const flash = flashMap[selectedAsset.symbol];

  // User position in this asset if any
  const currentPosition = portfolio.positions.find(p => p.symbol === selectedAsset.symbol);

  // Calculate order total
  const executionPrice = orderType === 'MARKET' ? selectedAsset.price : limitPrice;
  const totalCost = shares * executionPrice;

  // Handle Trade Execution
  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderNotice(null);

    if (shares <= 0) {
      setOrderNotice({ type: 'error', message: 'Shares must be greater than zero.' });
      return;
    }

    const res = portfolio.executeOrder({
      symbol: selectedAsset.symbol,
      type: orderSide,
      orderType,
      shares,
      price: executionPrice,
    });

    if (res.success) {
      setOrderNotice({ type: 'success', message: res.message });
      setTimeout(() => setOrderNotice(null), 4000);
    } else {
      setOrderNotice({ type: 'error', message: res.message });
    }
  };

  // Candles data
  const candles = selectedAsset.candles || [];

  // Chart dimensions
  const chartWidth = 740;
  const chartHeight = 360;
  const volumeHeight = 60;
  const mainHeight = chartHeight - volumeHeight - 20;

  // Compute scale
  const minPrice = useMemo(() => {
    if (candles.length === 0) return 0;
    return Math.min(...candles.map(c => c.low)) * 0.998;
  }, [candles]);

  const maxPrice = useMemo(() => {
    if (candles.length === 0) return 100;
    return Math.max(...candles.map(c => c.high)) * 1.002;
  }, [candles]);

  const maxVolume = useMemo(() => {
    if (candles.length === 0) return 1;
    return Math.max(...candles.map(c => c.volume));
  }, [candles]);

  const priceRange = maxPrice - minPrice || 1;

  const getY = (val: number) => {
    return mainHeight - ((val - minPrice) / priceRange) * mainHeight + 10;
  };

  // Simple Moving Average (SMA 14)
  const smaPoints = useMemo(() => {
    if (candles.length < 10) return [];
    const period = 10;
    const pts: { x: number; y: number }[] = [];
    for (let i = period - 1; i < candles.length; i++) {
      const slice = candles.slice(i - period + 1, i + 1);
      const avg = slice.reduce((acc, c) => acc + c.close, 0) / period;
      const x = (i / (candles.length - 1)) * chartWidth;
      pts.push({ x, y: getY(avg) });
    }
    return pts;
  }, [candles, chartWidth, mainHeight, minPrice, priceRange]);

  // Exponential Moving Average (EMA 20)
  const emaPoints = useMemo(() => {
    if (candles.length < 15) return [];
    const period = 14;
    const k = 2 / (period + 1);
    let ema = candles[0].close;
    const pts: { x: number; y: number }[] = [];

    candles.forEach((c, i) => {
      ema = c.close * k + ema * (1 - k);
      if (i >= period - 1) {
        const x = (i / (candles.length - 1)) * chartWidth;
        pts.push({ x, y: getY(ema) });
      }
    });
    return pts;
  }, [candles, chartWidth, mainHeight, minPrice, priceRange]);

  // Handle Chart Mouse Move for Crosshair
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relativeX = (mouseX / rect.width) * chartWidth;
    setCursorX(relativeX);

    // Find nearest candle
    const candleWidth = chartWidth / candles.length;
    const index = Math.min(candles.length - 1, Math.max(0, Math.floor(relativeX / candleWidth)));
    setHoveredCandle(candles[index]);
  };

  const activeCandle = hoveredCandle || candles[candles.length - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        ref={containerRef}
        className="w-full max-w-[1300px] max-h-[95vh] bg-[#1e222d] border border-[#363a45] rounded-xs shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Modal Top Header */}
        <div className="p-3.5 bg-[#171b26] border-b border-[#363a45] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AssetLogo symbol={selectedAsset.symbol} size={32} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#f0f3fa]">
                  {selectedAsset.symbol}
                </h2>
                <span className="text-xs text-[#787b86]">·</span>
                <span className="text-xs font-medium text-[#c3c5d8]">
                  {selectedAsset.name}
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono bg-[#131722] text-[#787b86] rounded-xs border border-[#363a45]">
                  {selectedAsset.exchange}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs">
                <span
                  className={`text-lg font-bold tabular-nums text-[#f0f3fa] ${
                    flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''
                  }`}
                >
                  {selectedAsset.price > 100
                    ? selectedAsset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : selectedAsset.price.toFixed(selectedAsset.category === 'forex' ? 4 : 3)}
                </span>
                <span
                  className={`flex items-center gap-0.5 font-semibold tabular-nums ${
                    isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {isPositive ? '+' : ''}
                  {selectedAsset.change.toFixed(2)} ({isPositive ? '+' : ''}
                  {selectedAsset.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions (Watchlist, Close) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleWatchlist(selectedAsset.symbol)}
              className={`p-2 rounded-xs border transition-colors ${
                inWatch
                  ? 'bg-[#ffd700]/10 border-[#ffd700]/40 text-[#ffd700]'
                  : 'bg-[#1e222d] border-[#363a45] text-[#787b86] hover:text-[#f0f3fa]'
              }`}
              title={inWatch ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Star size={16} className={inWatch ? 'fill-[#ffd700]' : ''} />
            </button>
            <button
              onClick={() => setSelectedAsset(null)}
              className="p-2 rounded-xs bg-[#1e222d] hover:bg-[#2a2e39] text-[#787b86] hover:text-[#f0f3fa] border border-[#363a45] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Main Content: Left Chart + Right Order Form */}
        <div className="flex-1 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
          {/* Left Column: Interactive Technical Chart */}
          <div className="lg:col-span-8 p-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#363a45] bg-[#131722]">
            {/* Chart Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#363a45]/60 text-xs">
              {/* Timeframes */}
              <div className="flex items-center gap-1 bg-[#1e222d] p-0.5 rounded-xs border border-[#363a45]">
                {(['1D', '5D', '1M', '6M', '1Y'] as const).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2 py-0.5 font-semibold rounded-xs transition-colors ${
                      timeframe === tf
                        ? 'bg-[#2962ff] text-white'
                        : 'text-[#787b86] hover:text-[#f0f3fa]'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              {/* Chart Style: Candles vs Line */}
              <div className="flex items-center gap-1 bg-[#1e222d] p-0.5 rounded-xs border border-[#363a45]">
                <button
                  onClick={() => setChartType('candles')}
                  className={`px-2 py-0.5 font-medium rounded-xs transition-colors ${
                    chartType === 'candles' ? 'bg-[#2a2e39] text-white' : 'text-[#787b86]'
                  }`}
                >
                  Candles
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`px-2 py-0.5 font-medium rounded-xs transition-colors ${
                    chartType === 'line' ? 'bg-[#2a2e39] text-white' : 'text-[#787b86]'
                  }`}
                >
                  Line
                </button>
              </div>

              {/* Technical Indicators */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSMA(!showSMA)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-medium border transition-colors ${
                    showSMA
                      ? 'bg-[#f7931a]/15 text-[#f7931a] border-[#f7931a]/40'
                      : 'bg-[#1e222d] text-[#787b86] border-[#363a45]'
                  }`}
                >
                  <Activity size={12} />
                  <span>SMA 10</span>
                </button>
                <button
                  onClick={() => setShowEMA(!showEMA)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-medium border transition-colors ${
                    showEMA
                      ? 'bg-[#00a4ef]/15 text-[#00a4ef] border-[#00a4ef]/40'
                      : 'bg-[#1e222d] text-[#787b86] border-[#363a45]'
                  }`}
                >
                  <Layers size={12} />
                  <span>EMA 14</span>
                </button>
              </div>
            </div>

            {/* Candle Details Ribbon */}
            <div className="flex items-center gap-3 py-2 text-[11px] font-mono text-[#787b86] tabular-nums">
              <span>{activeCandle?.time || 'Real-time'}</span>
              <span>
                O: <span className="text-[#f0f3fa] font-semibold">{activeCandle?.open}</span>
              </span>
              <span>
                H: <span className="text-[#089981] font-semibold">{activeCandle?.high}</span>
              </span>
              <span>
                L: <span className="text-[#f23645] font-semibold">{activeCandle?.low}</span>
              </span>
              <span>
                C: <span className="text-[#f0f3fa] font-semibold">{activeCandle?.close}</span>
              </span>
              <span>
                Vol: <span className="text-[#dfe2f2]">{activeCandle?.volume.toLocaleString()}</span>
              </span>
            </div>

            {/* SVG Chart Canvas */}
            <div className="relative w-full h-[320px] bg-[#131722] rounded-xs select-none">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-full cursor-crosshair overflow-visible"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => {
                  setHoveredCandle(null);
                  setCursorX(null);
                }}
              >
                {/* Horizontal Grid lines */}
                {[0.2, 0.4, 0.6, 0.8].map(ratio => {
                  const y = mainHeight * ratio;
                  const priceLabel = (maxPrice - ratio * priceRange).toFixed(selectedAsset.price > 100 ? 1 : 2);
                  return (
                    <g key={ratio}>
                      <line
                        x1="0"
                        y1={y}
                        x2={chartWidth}
                        y2={y}
                        stroke="#262a35"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <text
                        x={chartWidth - 5}
                        y={y - 4}
                        fill="#787b86"
                        fontSize="9"
                        textAnchor="end"
                        fontFamily="monospace"
                      >
                        {priceLabel}
                      </text>
                    </g>
                  );
                })}

                {/* Candles or Line rendering */}
                {chartType === 'candles' ? (
                  candles.map((c, i) => {
                    const candleW = (chartWidth / candles.length) * 0.65;
                    const x = (i / (candles.length - 1)) * chartWidth;
                    const isGreen = c.close >= c.open;
                    const color = isGreen ? '#089981' : '#f23645';

                    const highY = getY(c.high);
                    const lowY = getY(c.low);
                    const openY = getY(c.open);
                    const closeY = getY(c.close);
                    const topBody = Math.min(openY, closeY);
                    const bodyHeight = Math.max(2, Math.abs(openY - closeY));

                    return (
                      <g key={i}>
                        {/* Upper & lower wick */}
                        <line
                          x1={x}
                          y1={highY}
                          x2={x}
                          y2={lowY}
                          stroke={color}
                          strokeWidth="1.2"
                        />
                        {/* Body */}
                        <rect
                          x={x - candleW / 2}
                          y={topBody}
                          width={candleW}
                          height={bodyHeight}
                          fill={color}
                          rx="0.5"
                        />
                      </g>
                    );
                  })
                ) : (
                  // Line / Area chart
                  (() => {
                    const pts = candles.map((c, i) => {
                      const x = (i / (candles.length - 1)) * chartWidth;
                      const y = getY(c.close);
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    });
                    const line = `M ${pts.join(' L ')}`;
                    const area = `${line} L ${chartWidth},${mainHeight} L 0,${mainHeight} Z`;

                    return (
                      <g>
                        <defs>
                          <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2962ff" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#2962ff" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d={area} fill="url(#chartAreaGrad)" />
                        <path d={line} fill="none" stroke="#2962ff" strokeWidth="2" />
                      </g>
                    );
                  })()
                )}

                {/* SMA Overlay Line */}
                {showSMA && smaPoints.length > 1 && (
                  <path
                    d={`M ${smaPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`}
                    fill="none"
                    stroke="#f7931a"
                    strokeWidth="1.5"
                  />
                )}

                {/* EMA Overlay Line */}
                {showEMA && emaPoints.length > 1 && (
                  <path
                    d={`M ${emaPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`}
                    fill="none"
                    stroke="#00a4ef"
                    strokeWidth="1.5"
                  />
                )}

                {/* Volume Histogram Bars at Bottom */}
                {candles.map((c, i) => {
                  const barW = (chartWidth / candles.length) * 0.6;
                  const x = (i / (candles.length - 1)) * chartWidth;
                  const barH = (c.volume / maxVolume) * volumeHeight;
                  const y = chartHeight - barH;
                  const isGreen = c.close >= c.open;

                  return (
                    <rect
                      key={'vol-' + i}
                      x={x - barW / 2}
                      y={y}
                      width={barW}
                      height={barH}
                      fill={isGreen ? 'rgba(8, 153, 129, 0.4)' : 'rgba(242, 54, 69, 0.4)'}
                    />
                  );
                })}

                {/* Crosshair cursor */}
                {cursorX !== null && (
                  <g>
                    <line
                      x1={cursorX}
                      y1="0"
                      x2={cursorX}
                      y2={chartHeight}
                      stroke="#787b86"
                      strokeDasharray="2 2"
                      strokeWidth="1"
                    />
                    {hoveredCandle && (
                      <line
                        x1="0"
                        y1={getY(hoveredCandle.close)}
                        x2={chartWidth}
                        y2={getY(hoveredCandle.close)}
                        stroke="#787b86"
                        strokeDasharray="2 2"
                        strokeWidth="1"
                      />
                    )}
                  </g>
                )}
              </svg>
            </div>

            {/* Quick Metrics Strip */}
            <div className="pt-3 border-t border-[#363a45] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-[#787b86] uppercase block">52W Range</span>
                <span className="font-semibold text-[#f0f3fa] tabular-nums">
                  ${selectedAsset.low52.toFixed(1)} - ${selectedAsset.high52.toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#787b86] uppercase block">Volume</span>
                <span className="font-semibold text-[#f0f3fa] tabular-nums">
                  {selectedAsset.volumeFormatted}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#787b86] uppercase block">Market Cap</span>
                <span className="font-semibold text-[#f0f3fa] tabular-nums">
                  {selectedAsset.marketCapFormatted || '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#787b86] uppercase block">P/E Ratio</span>
                <span className="font-semibold text-[#f0f3fa] tabular-nums">
                  {selectedAsset.peRatio || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Institutional Order Execution & Paper Trade Panel */}
          <div className="lg:col-span-4 p-4 flex flex-col justify-between bg-[#1e222d]">
            <div>
              {/* Order Form Header & Buy/Sell Toggle */}
              <div className="flex items-center justify-between pb-3 border-b border-[#363a45]">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#f0f3fa]">Order Terminal</span>
                  <span className="text-[10px] text-[#089981] bg-[#089981]/15 px-1.5 py-0.2 rounded-xs font-semibold">
                    Paper Trading
                  </span>
                </div>
                <span className="text-[11px] text-[#787b86] tabular-nums">
                  Bal: ${portfolio.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>

              {/* Buy / Sell Tabs */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#131722] rounded-xs my-3 border border-[#363a45]">
                <button
                  type="button"
                  onClick={() => setOrderSide('BUY')}
                  className={`py-2 text-xs font-bold rounded-xs transition-colors ${
                    orderSide === 'BUY'
                      ? 'bg-[#089981] text-white shadow-xs'
                      : 'text-[#787b86] hover:text-[#dfe2f2]'
                  }`}
                >
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => setOrderSide('SELL')}
                  className={`py-2 text-xs font-bold rounded-xs transition-colors ${
                    orderSide === 'SELL'
                      ? 'bg-[#f23645] text-white shadow-xs'
                      : 'text-[#787b86] hover:text-[#dfe2f2]'
                  }`}
                >
                  SELL / SHORT
                </button>
              </div>

              {/* Order Execution Details Form */}
              <form onSubmit={handleExecuteTrade} className="space-y-3 text-xs">
                {/* Order Type: Market / Limit */}
                <div>
                  <label className="text-[10px] font-semibold text-[#787b86] uppercase tracking-wider block mb-1">
                    Order Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType('MARKET')}
                      className={`py-1.5 px-3 rounded-xs border text-xs font-medium transition-colors ${
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
                        setLimitPrice(selectedAsset.price);
                      }}
                      className={`py-1.5 px-3 rounded-xs border text-xs font-medium transition-colors ${
                        orderType === 'LIMIT'
                          ? 'bg-[#2a2e39] border-[#2962ff] text-[#f0f3fa]'
                          : 'bg-[#131722] border-[#363a45] text-[#787b86]'
                      }`}
                    >
                      Limit
                    </button>
                  </div>
                </div>

                {/* Limit Price Input if selected */}
                {orderType === 'LIMIT' && (
                  <div>
                    <label className="text-[10px] font-semibold text-[#787b86] uppercase tracking-wider block mb-1">
                      Limit Price (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={limitPrice}
                      onChange={e => setLimitPrice(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-[#131722] border border-[#363a45] focus:border-[#2962ff] text-[#f0f3fa] rounded-xs tabular-nums focus:outline-hidden"
                    />
                  </div>
                )}

                {/* Shares / Quantity Stepper */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-semibold text-[#787b86] uppercase tracking-wider">
                      Quantity (Units)
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 10, 50, 100].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setShares(amt)}
                          className="px-1.5 py-0.2 text-[10px] bg-[#131722] hover:bg-[#2a2e39] text-[#787b86] hover:text-[#f0f3fa] rounded-xs border border-[#363a45]"
                        >
                          {amt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center bg-[#131722] border border-[#363a45] focus-within:border-[#2962ff] rounded-xs">
                    <button
                      type="button"
                      onClick={() => setShares(Math.max(1, shares - 1))}
                      className="p-2 text-[#787b86] hover:text-white transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={shares}
                      onChange={e => setShares(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full py-1.5 text-center bg-transparent text-[#f0f3fa] font-bold tabular-nums focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShares(shares + 1)}
                      className="p-2 text-[#787b86] hover:text-white transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Order Summary Breakdown */}
                <div className="p-2.5 bg-[#131722] rounded-xs border border-[#363a45]/80 space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#787b86]">
                    <span>Execution Price</span>
                    <span className="text-[#f0f3fa] tabular-nums font-mono">${executionPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#787b86]">
                    <span>Est. Fee (0%)</span>
                    <span className="text-[#089981] tabular-nums font-mono">$0.00</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#363a45] font-bold">
                    <span className="text-[#dfe2f2]">Total Value</span>
                    <span className="text-[#f0f3fa] tabular-nums font-mono text-sm">
                      ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Feedback Notification */}
                {orderNotice && (
                  <div
                    className={`p-2 rounded-xs flex items-center gap-2 text-xs ${
                      orderNotice.type === 'success'
                        ? 'bg-[#089981]/15 text-[#089981] border border-[#089981]/30'
                        : 'bg-[#f23645]/15 text-[#f23645] border border-[#f23645]/30'
                    }`}
                  >
                    {orderNotice.type === 'success' ? (
                      <CheckCircle2 size={14} className="shrink-0" />
                    ) : (
                      <AlertCircle size={14} className="shrink-0" />
                    )}
                    <span className="truncate">{orderNotice.message}</span>
                  </div>
                )}

                {/* Primary Execution CTA */}
                <button
                  type="submit"
                  className={`w-full py-2.5 rounded-xs font-bold text-xs uppercase tracking-wider text-white transition-transform active:scale-98 shadow-md cursor-pointer ${
                    orderSide === 'BUY'
                      ? 'bg-[#089981] hover:bg-[#07856f]'
                      : 'bg-[#f23645] hover:bg-[#d62b39]'
                  }`}
                >
                  {orderSide} {shares} {selectedAsset.symbol}
                </button>
              </form>
            </div>

            {/* Existing Position Card if owned */}
            {currentPosition && (
              <div className="mt-3 p-2.5 bg-[#171b26] border border-[#363a45] rounded-xs text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-[#787b86] uppercase font-bold">Your Open Position</span>
                  <span
                    className={`font-semibold tabular-nums text-[11px] ${
                      currentPosition.unrealizedPnL >= 0 ? 'text-[#089981]' : 'text-[#f23645]'
                    }`}
                  >
                    {currentPosition.unrealizedPnL >= 0 ? '+' : ''}$
                    {currentPosition.unrealizedPnL.toFixed(2)} ({currentPosition.unrealizedPnLPercent.toFixed(2)}%)
                  </span>
                </div>
                <div className="flex justify-between text-[#c3c5d8] text-[11px] mb-2 tabular-nums">
                  <span>Shares: {currentPosition.shares}</span>
                  <span>Entry: ${currentPosition.entryPrice.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => portfolio.closePosition(selectedAsset.symbol)}
                  className="w-full py-1 text-[11px] font-semibold bg-[#2a2e39] hover:bg-[#363a45] text-[#dfe2f2] rounded-xs border border-[#434651] transition-colors"
                >
                  Close Position
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
