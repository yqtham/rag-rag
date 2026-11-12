import React, { useState, useMemo, useRef } from 'react';
import { useMarket } from '../context/MarketContext';
import { MarketAsset, Candle, DrawingItem } from '../types/market';
import {
  TrendingUp,
  Activity,
  Layers,
  Sliders,
  Maximize2,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AdvancedChartProps {
  asset: MarketAsset;
  compact?: boolean;
  onMaximize?: () => void;
}

export const AdvancedChart: React.FC<AdvancedChartProps> = ({ asset, compact = false, onMaximize }) => {
  const {
    chartStyle,
    setChartStyle,
    activeTool,
    setActiveTool,
    drawings,
    addDrawing,
    removeDrawing,
    clearDrawings,
    indicators,
    toggleIndicator,
    flashMap,
  } = useMarket();

  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1H' | '1D' | '1W'>('1D');
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [crosshairPos, setCrosshairPos] = useState<{ x: number; y: number; price: number } | null>(null);
  const [drawingStart, setDrawingStart] = useState<{ x: number; y: number; price: number; idx: number } | null>(null);
  const [showIndicatorMenu, setShowIndicatorMenu] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const flash = flashMap[asset.symbol];
  const candles = asset.candles || [];

  // Dimensions
  const width = 820;
  const height = compact ? 280 : 420;
  const rsiHeight = indicators.rsi ? 70 : 0;
  const macdHeight = indicators.macd ? 70 : 0;
  const subWindowsHeight = rsiHeight + macdHeight;
  const volumeHeight = 50;
  const mainHeight = height - subWindowsHeight - volumeHeight - 30;

  // Compute Scales
  const minPrice = useMemo(() => {
    if (candles.length === 0) return 0;
    return Math.min(...candles.map(c => c.low)) * 0.998;
  }, [candles]);

  const maxPrice = useMemo(() => {
    if (candles.length === 0) return 100;
    return Math.max(...candles.map(c => c.high)) * 1.002;
  }, [candles]);

  const priceRange = maxPrice - minPrice || 1;
  const maxVolume = useMemo(() => {
    if (candles.length === 0) return 1;
    return Math.max(...candles.map(c => c.volume));
  }, [candles]);

  const getY = (price: number) => {
    return mainHeight - ((price - minPrice) / priceRange) * mainHeight + 15;
  };

  const getPriceFromY = (y: number) => {
    const norm = (mainHeight - (y - 15)) / mainHeight;
    return Number((minPrice + norm * priceRange).toFixed(asset.price > 100 ? 2 : 4));
  };

  // Convert Candles to Heikin Ashi if chosen
  const displayCandles = useMemo(() => {
    if (chartStyle !== 'heikin') return candles;

    const ha: Candle[] = [];
    candles.forEach((c, idx) => {
      const haClose = (c.open + c.high + c.low + c.close) / 4;
      const haOpen = idx === 0 ? (c.open + c.close) / 2 : (ha[idx - 1].open + ha[idx - 1].close) / 2;
      const haHigh = Math.max(c.high, haOpen, haClose);
      const haLow = Math.min(c.low, haOpen, haClose);

      ha.push({
        time: c.time,
        open: haOpen,
        high: haHigh,
        low: haLow,
        close: haClose,
        volume: c.volume,
      });
    });
    return ha;
  }, [candles, chartStyle]);

  // Moving Averages
  const calculateSMA = (period: number) => {
    if (displayCandles.length < period) return [];
    const pts: { x: number; y: number }[] = [];
    for (let i = period - 1; i < displayCandles.length; i++) {
      const slice = displayCandles.slice(i - period + 1, i + 1);
      const avg = slice.reduce((acc, c) => acc + c.close, 0) / period;
      const x = (i / (displayCandles.length - 1)) * width;
      pts.push({ x, y: getY(avg) });
    }
    return pts;
  };

  const sma20Pts = useMemo(() => (indicators.sma20 ? calculateSMA(10) : []), [displayCandles, indicators.sma20]);
  const sma50Pts = useMemo(() => (indicators.sma50 ? calculateSMA(20) : []), [displayCandles, indicators.sma50]);
  const sma200Pts = useMemo(() => (indicators.sma200 ? calculateSMA(30) : []), [displayCandles, indicators.sma200]);

  // Bollinger Bands (20, 2)
  const bollingerData = useMemo(() => {
    if (!indicators.bollinger || displayCandles.length < 12) return null;
    const period = 12;
    const upper: { x: number; y: number }[] = [];
    const lower: { x: number; y: number }[] = [];

    for (let i = period - 1; i < displayCandles.length; i++) {
      const slice = displayCandles.slice(i - period + 1, i + 1);
      const mean = slice.reduce((a, b) => a + b.close, 0) / period;
      const variance = slice.reduce((a, b) => a + Math.pow(b.close - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      const x = (i / (displayCandles.length - 1)) * width;

      upper.push({ x, y: getY(mean + stdDev * 2) });
      lower.push({ x, y: getY(mean - stdDev * 2) });
    }

    const bandPath = [
      ...upper.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`),
      ...lower.reverse().map(p => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`),
      'Z',
    ].join(' ');

    return { upper, lower, bandPath };
  }, [displayCandles, indicators.bollinger]);

  // Volume Profile (Right side distribution histogram)
  const volumeProfileBars = useMemo(() => {
    if (!indicators.volumeProfile || displayCandles.length === 0) return [];
    const bins = 16;
    const binSize = priceRange / bins;
    const volumes = new Array(bins).fill(0);

    displayCandles.forEach(c => {
      const binIdx = Math.min(bins - 1, Math.max(0, Math.floor((c.close - minPrice) / binSize)));
      volumes[binIdx] += c.volume;
    });

    const maxBinVol = Math.max(...volumes) || 1;
    return volumes.map((vol, idx) => {
      const p = minPrice + (idx + 0.5) * binSize;
      const y = getY(p);
      const barW = (vol / maxBinVol) * 75; // max 75px wide
      return { y, barW, vol };
    });
  }, [displayCandles, indicators.volumeProfile, minPrice, priceRange]);

  // RSI Calculations (14 periods)
  const rsiSeries = useMemo(() => {
    if (!indicators.rsi || displayCandles.length < 15) return [];
    const period = 14;
    const rsiVals: { x: number; y: number; rsi: number }[] = [];

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const diff = displayCandles[i].close - displayCandles[i - 1].close;
      if (diff >= 0) gains += diff;
      else losses -= diff;
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = period + 1; i < displayCandles.length; i++) {
      const diff = displayCandles[i].close - displayCandles[i - 1].close;
      avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period;
      avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period;

      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = 100 - 100 / (1 + rs);
      const x = (i / (displayCandles.length - 1)) * width;
      const subTop = height - subWindowsHeight;
      const y = subTop + rsiHeight - (rsi / 100) * rsiHeight;
      rsiVals.push({ x, y, rsi });
    }
    return rsiVals;
  }, [displayCandles, indicators.rsi, width, height, subWindowsHeight, rsiHeight]);

  // Handle Mouse Interactions for Drawings and Crosshairs
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const relativeX = (mouseX / rect.width) * width;
    const relativeY = (mouseY / rect.height) * height;

    const candleWidth = width / displayCandles.length;
    const index = Math.min(displayCandles.length - 1, Math.max(0, Math.floor(relativeX / candleWidth)));
    setHoveredCandle(displayCandles[index]);

    const price = getPriceFromY(relativeY);
    setCrosshairPos({ x: relativeX, y: relativeY, price });
  };

  const handleChartClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool === 'cursor' || !crosshairPos) return;

    const candleWidth = width / displayCandles.length;
    const idx = Math.min(displayCandles.length - 1, Math.max(0, Math.floor(crosshairPos.x / candleWidth)));

    if (activeTool === 'horizontal') {
      addDrawing({
        id: 'drw-' + Date.now(),
        tool: 'horizontal',
        symbol: asset.symbol,
        price1: crosshairPos.price,
        timeIndex1: idx,
      });
      setActiveTool('cursor');
    } else if (activeTool === 'trendline' || activeTool === 'fibonacci' || activeTool === 'risk_reward') {
      if (!drawingStart) {
        setDrawingStart({ x: crosshairPos.x, y: crosshairPos.y, price: crosshairPos.price, idx });
      } else {
        addDrawing({
          id: 'drw-' + Date.now(),
          tool: activeTool,
          symbol: asset.symbol,
          price1: drawingStart.price,
          timeIndex1: drawingStart.idx,
          price2: crosshairPos.price,
          timeIndex2: idx,
          entry: drawingStart.price,
          stopLoss: Number((drawingStart.price * 0.97).toFixed(2)),
          target: Number((drawingStart.price * 1.06).toFixed(2)),
          riskRewardRatio: 2.0,
        });
        setDrawingStart(null);
        setActiveTool('cursor');
      }
    }
  };

  const assetDrawings = drawings.filter(d => d.symbol === asset.symbol);
  const activeCandle = hoveredCandle || displayCandles[displayCandles.length - 1];

  return (
    <div
      ref={containerRef}
      className="bg-[#131722] border border-[#363a45] rounded-xs flex flex-col justify-between overflow-hidden relative select-none"
    >
      {/* Chart Top Pro Header */}
      <div className="p-2.5 bg-[#171b26] border-b border-[#363a45] flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Symbol & Price readout */}
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm text-[#f0f3fa]">{asset.symbol}</span>
          <span
            className={`font-mono font-bold text-sm tabular-nums text-[#f0f3fa] ${
              flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''
            }`}
          >
            ${asset.price.toFixed(asset.price > 100 ? 2 : 4)}
          </span>
          <span
            className={`text-xs font-semibold tabular-nums px-1.5 py-0.5 rounded-xs ${
              asset.change >= 0 ? 'text-[#089981] bg-[#089981]/15' : 'text-[#f23645] bg-[#f23645]/15'
            }`}
          >
            {asset.change >= 0 ? '+' : ''}
            {asset.changePercent.toFixed(2)}%
          </span>
        </div>

        {/* Timeframe Selectors */}
        <div className="flex items-center gap-0.5 bg-[#1e222d] p-0.5 rounded-xs border border-[#363a45]">
          {(['1m', '5m', '15m', '1H', '1D', '1W'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-0.5 rounded-xs text-[11px] font-semibold transition-colors ${
                timeframe === tf ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-[#f0f3fa]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Chart Style Switcher (Candles, Hollow, Heikin Ashi, Bars, Line, Area) */}
        <div className="flex items-center gap-1 bg-[#1e222d] p-0.5 rounded-xs border border-[#363a45]">
          <select
            value={chartStyle}
            onChange={e => setChartStyle(e.target.value as any)}
            className="bg-transparent text-[#dfe2f2] text-[11px] font-medium focus:outline-hidden cursor-pointer"
          >
            <option value="candles" className="bg-[#1e222d]">Candles</option>
            <option value="hollow" className="bg-[#1e222d]">Hollow Candles</option>
            <option value="heikin" className="bg-[#1e222d]">Heikin Ashi</option>
            <option value="bars" className="bg-[#1e222d]">OHLC Bars</option>
            <option value="line" className="bg-[#1e222d]">Line</option>
            <option value="area" className="bg-[#1e222d]">Area</option>
          </select>
        </div>

        {/* Indicators Trigger Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowIndicatorMenu(!showIndicatorMenu)}
            className="flex items-center gap-1 px-2 py-1 bg-[#1e222d] hover:bg-[#2a2e39] text-[#c3c5d8] border border-[#363a45] rounded-xs text-[11px] font-semibold"
          >
            <Sliders size={12} className="text-[#2962ff]" />
            <span>Indicators ({Object.values(indicators).filter(Boolean).length})</span>
          </button>

          {showIndicatorMenu && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-[#1e222d] border border-[#434651] shadow-2xl rounded-xs p-2 z-50 text-xs flex flex-col gap-1">
              <span className="text-[10px] text-[#787b86] uppercase font-bold tracking-wider px-1 pb-1 border-b border-[#363a45]">
                Overlays & Oscillators
              </span>
              {[
                { id: 'sma20', label: 'SMA (20)' },
                { id: 'sma50', label: 'SMA (50)' },
                { id: 'sma200', label: 'SMA (200)' },
                { id: 'bollinger', label: 'Bollinger Bands (20, 2)' },
                { id: 'volumeProfile', label: 'Volume Profile' },
                { id: 'rsi', label: 'RSI Oscillator (14)' },
              ].map(ind => {
                const active = (indicators as any)[ind.id];
                return (
                  <button
                    key={ind.id}
                    onClick={() => toggleIndicator(ind.id as any)}
                    className="flex items-center justify-between px-2 py-1 hover:bg-[#2a2e39] rounded-xs text-left text-xs transition-colors"
                  >
                    <span className={active ? 'text-[#f0f3fa] font-bold' : 'text-[#787b86]'}>{ind.label}</span>
                    {active ? <Eye size={12} className="text-[#2962ff]" /> : <EyeOff size={12} className="text-[#787b86]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Maximize or Clear drawings */}
        <div className="flex items-center gap-1">
          {assetDrawings.length > 0 && (
            <button
              onClick={clearDrawings}
              title="Clear all drawings"
              className="p-1 text-[#787b86] hover:text-[#f23645] rounded-xs"
            >
              <Trash2 size={13} />
            </button>
          )}
          {onMaximize && (
            <button
              onClick={onMaximize}
              title="Maximize Chart"
              className="p-1 text-[#787b86] hover:text-[#f0f3fa] rounded-xs"
            >
              <Maximize2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Real-time OHLCV Bar */}
      <div className="px-3 py-1 bg-[#131722] border-b border-[#363a45]/60 flex items-center gap-3 text-[11px] font-mono tabular-nums text-[#787b86]">
        <span>{activeCandle?.time || 'Live'}</span>
        <span>
          O: <span className="text-[#f0f3fa] font-semibold">{activeCandle?.open.toFixed(2)}</span>
        </span>
        <span>
          H: <span className="text-[#089981] font-semibold">{activeCandle?.high.toFixed(2)}</span>
        </span>
        <span>
          L: <span className="text-[#f23645] font-semibold">{activeCandle?.low.toFixed(2)}</span>
        </span>
        <span>
          C: <span className="text-[#f0f3fa] font-semibold">{activeCandle?.close.toFixed(2)}</span>
        </span>
        <span>
          Vol: <span className="text-[#dfe2f2]">{activeCandle?.volume.toLocaleString()}</span>
        </span>
      </div>

      {/* Main SVG Interactive Chart */}
      <div className="relative w-full flex-1 bg-[#131722] overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full cursor-crosshair overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            setHoveredCandle(null);
            setCrosshairPos(null);
          }}
          onClick={handleChartClick}
        >
          {/* Price Gridlines */}
          {[0.2, 0.4, 0.6, 0.8].map(ratio => {
            const y = mainHeight * ratio + 15;
            const priceLabel = (maxPrice - ratio * priceRange).toFixed(asset.price > 100 ? 2 : 4);
            return (
              <g key={ratio}>
                <line x1="0" y1={y} x2={width} y2={y} stroke="#262a35" strokeDasharray="3 3" strokeWidth="1" />
                <text x={width - 6} y={y - 3} fill="#787b86" fontSize="9" textAnchor="end" fontFamily="monospace">
                  {priceLabel}
                </text>
              </g>
            );
          })}

          {/* Bollinger Bands Shaded Channel */}
          {bollingerData && (
            <g>
              <path d={bollingerData.bandPath} fill="rgba(41, 98, 255, 0.08)" />
              <path
                d={`M ${bollingerData.upper.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}`}
                fill="none"
                stroke="rgba(41, 98, 255, 0.4)"
                strokeWidth="1"
              />
              <path
                d={`M ${bollingerData.lower.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}`}
                fill="none"
                stroke="rgba(41, 98, 255, 0.4)"
                strokeWidth="1"
              />
            </g>
          )}

          {/* Volume Profile on Right Axis */}
          {volumeProfileBars.map((bar, i) => (
            <rect
              key={'vp-' + i}
              x={width - bar.barW - 5}
              y={bar.y - 4}
              width={bar.barW}
              height="7"
              fill="rgba(41, 98, 255, 0.16)"
              rx="1"
            />
          ))}

          {/* Candles / Bars / Lines Rendering */}
          {chartStyle === 'line' || chartStyle === 'area' ? (
            (() => {
              const pts = displayCandles.map((c, i) => {
                const x = (i / (displayCandles.length - 1)) * width;
                const y = getY(c.close);
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              });
              const line = `M ${pts.join(' L ')}`;
              const area = `${line} L ${width},${mainHeight + 15} L 0,${mainHeight + 15} Z`;

              return (
                <g>
                  {chartStyle === 'area' && (
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2962ff" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#2962ff" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                  )}
                  {chartStyle === 'area' && <path d={area} fill="url(#areaGrad)" />}
                  <path d={line} fill="none" stroke="#2962ff" strokeWidth="2" />
                </g>
              );
            })()
          ) : chartStyle === 'bars' ? (
            // OHLC Bar Chart
            displayCandles.map((c, i) => {
              const x = (i / (displayCandles.length - 1)) * width;
              const isUp = c.close >= c.open;
              const color = isUp ? '#089981' : '#f23645';
              const openY = getY(c.open);
              const closeY = getY(c.close);
              const highY = getY(c.high);
              const lowY = getY(c.low);
              const tickW = 4;

              return (
                <g key={i}>
                  <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1.2" />
                  <line x1={x - tickW} y1={openY} x2={x} y2={openY} stroke={color} strokeWidth="1.2" />
                  <line x1={x} y1={closeY} x2={x + tickW} y2={closeY} stroke={color} strokeWidth="1.2" />
                </g>
              );
            })
          ) : (
            // Standard / Hollow / Heikin Ashi Candlesticks
            displayCandles.map((c, i) => {
              const candleW = (width / displayCandles.length) * 0.68;
              const x = (i / (displayCandles.length - 1)) * width;
              const isGreen = c.close >= c.open;
              const color = isGreen ? '#089981' : '#f23645';
              const highY = getY(c.high);
              const lowY = getY(c.low);
              const openY = getY(c.open);
              const closeY = getY(c.close);
              const topBody = Math.min(openY, closeY);
              const bodyHeight = Math.max(2, Math.abs(openY - closeY));
              const isHollow = chartStyle === 'hollow' && isGreen;

              return (
                <g key={i}>
                  <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1.2" />
                  <rect
                    x={x - candleW / 2}
                    y={topBody}
                    width={candleW}
                    height={bodyHeight}
                    fill={isHollow ? '#131722' : color}
                    stroke={color}
                    strokeWidth={isHollow ? '1.5' : '0'}
                    rx="0.5"
                  />
                </g>
              );
            })
          )}

          {/* SMA 20 */}
          {sma20Pts.length > 1 && (
            <path
              d={`M ${sma20Pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`}
              fill="none"
              stroke="#f7931a"
              strokeWidth="1.5"
            />
          )}

          {/* SMA 50 */}
          {sma50Pts.length > 1 && (
            <path
              d={`M ${sma50Pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`}
              fill="none"
              stroke="#00a4ef"
              strokeWidth="1.5"
            />
          )}

          {/* SMA 200 */}
          {sma200Pts.length > 1 && (
            <path
              d={`M ${sma200Pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`}
              fill="none"
              stroke="#e91e63"
              strokeWidth="1.5"
            />
          )}

          {/* Volume Histogram Bars */}
          {displayCandles.map((c, i) => {
            const barW = (width / displayCandles.length) * 0.6;
            const x = (i / (displayCandles.length - 1)) * width;
            const barH = (c.volume / maxVolume) * volumeHeight;
            const y = mainHeight + 20 + volumeHeight - barH;
            const isGreen = c.close >= c.open;

            return (
              <rect
                key={'v-' + i}
                x={x - barW / 2}
                y={y}
                width={barW}
                height={barH}
                fill={isGreen ? 'rgba(8, 153, 129, 0.45)' : 'rgba(242, 54, 69, 0.45)'}
              />
            );
          })}

          {/* RSI Sub-window */}
          {indicators.rsi && (
            <g>
              <line
                x1="0"
                y1={height - rsiHeight}
                x2={width}
                y2={height - rsiHeight}
                stroke="#363a45"
                strokeWidth="1"
              />
              {/* Overbought 70 & Oversold 30 lines */}
              <line
                x1="0"
                y1={height - rsiHeight * 0.7}
                x2={width}
                y2={height - rsiHeight * 0.7}
                stroke="#f23645"
                strokeDasharray="2 2"
                strokeWidth="0.8"
                strokeOpacity="0.6"
              />
              <line
                x1="0"
                y1={height - rsiHeight * 0.3}
                x2={width}
                y2={height - rsiHeight * 0.3}
                stroke="#089981"
                strokeDasharray="2 2"
                strokeWidth="0.8"
                strokeOpacity="0.6"
              />
              <text x="6" y={height - rsiHeight + 12} fill="#787b86" fontSize="9" fontWeight="bold">
                RSI (14) · {rsiSeries.length > 0 ? rsiSeries[rsiSeries.length - 1].rsi.toFixed(1) : '50'}
              </text>
              {rsiSeries.length > 1 && (
                <path
                  d={`M ${rsiSeries.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`}
                  fill="none"
                  stroke="#9945ff"
                  strokeWidth="1.5"
                />
              )}
            </g>
          )}

          {/* User Drawings on Chart */}
          {assetDrawings.map(d => {
            if (d.tool === 'horizontal') {
              const y = getY(d.price1);
              return (
                <g key={d.id}>
                  <line x1="0" y1={y} x2={width} y2={y} stroke="#ffd700" strokeWidth="1.5" strokeDasharray="4 4" />
                  <text x={width - 50} y={y - 4} fill="#ffd700" fontSize="10" fontFamily="monospace">
                    ${d.price1.toFixed(2)}
                  </text>
                </g>
              );
            }
            if (d.tool === 'trendline' && d.price2 !== undefined && d.timeIndex2 !== undefined) {
              const x1 = (d.timeIndex1 / (displayCandles.length - 1)) * width;
              const y1 = getY(d.price1);
              const x2 = (d.timeIndex2 / (displayCandles.length - 1)) * width;
              const y2 = getY(d.price2);
              return (
                <line
                  key={d.id}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#2962ff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              );
            }
            if (d.tool === 'fibonacci' && d.price2 !== undefined) {
              const high = Math.max(d.price1, d.price2);
              const low = Math.min(d.price1, d.price2);
              const diff = high - low;
              const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0];

              return (
                <g key={d.id}>
                  {levels.map(lvl => {
                    const price = high - diff * lvl;
                    const y = getY(price);
                    return (
                      <g key={lvl}>
                        <line x1="0" y1={y} x2={width} y2={y} stroke="#787b86" strokeWidth="0.8" strokeDasharray="3 3" />
                        <text x="10" y={y - 3} fill="#787b86" fontSize="9" fontFamily="monospace">
                          {(lvl * 100).toFixed(1)}% (${price.toFixed(2)})
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            }
            if (d.tool === 'risk_reward' && d.entry && d.target && d.stopLoss) {
              const entryY = getY(d.entry);
              const targetY = getY(d.target);
              const stopY = getY(d.stopLoss);
              const x = (d.timeIndex1 / (displayCandles.length - 1)) * width;
              const boxW = 90;

              return (
                <g key={d.id}>
                  {/* Profit zone */}
                  <rect
                    x={x}
                    y={targetY}
                    width={boxW}
                    height={entryY - targetY}
                    fill="rgba(8, 153, 129, 0.25)"
                    stroke="#089981"
                    strokeWidth="1"
                  />
                  {/* Loss zone */}
                  <rect
                    x={x}
                    y={entryY}
                    width={boxW}
                    height={stopY - entryY}
                    fill="rgba(242, 54, 69, 0.25)"
                    stroke="#f23645"
                    strokeWidth="1"
                  />
                  <text x={x + 5} y={targetY + 12} fill="#089981" fontSize="9" fontWeight="bold">
                    Target: ${d.target}
                  </text>
                  <text x={x + 5} y={stopY - 4} fill="#f23645" fontSize="9" fontWeight="bold">
                    Stop: ${d.stopLoss}
                  </text>
                  <text x={x + 5} y={entryY - 3} fill="#f0f3fa" fontSize="9" fontWeight="bold">
                    R:R 2.0
                  </text>
                </g>
              );
            }
            return null;
          })}

          {/* Interactive Crosshair & Price Flag */}
          {crosshairPos && (
            <g>
              <line x1={crosshairPos.x} y1="0" x2={crosshairPos.x} y2={height} stroke="#787b86" strokeDasharray="2 2" strokeWidth="1" />
              <line x1="0" y1={crosshairPos.y} x2={width} y2={crosshairPos.y} stroke="#787b86" strokeDasharray="2 2" strokeWidth="1" />
              {/* Price Flag on Right Y-axis */}
              <rect x={width - 58} y={crosshairPos.y - 9} width="58" height="18" fill="#2962ff" rx="1" />
              <text x={width - 6} y={crosshairPos.y + 3} fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="end" fontFamily="monospace">
                ${crosshairPos.price.toFixed(asset.price > 100 ? 2 : 4)}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Drawing Mode Notification pill if active */}
      {activeTool !== 'cursor' && (
        <div className="absolute top-12 left-4 z-20 px-2.5 py-1 bg-[#2962ff] text-white rounded-xs text-[11px] font-bold shadow-md flex items-center gap-2">
          <span>Mode: {activeTool.toUpperCase()} (Click on chart to anchor)</span>
          <button onClick={() => setActiveTool('cursor')} className="text-white hover:underline text-[10px]">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
