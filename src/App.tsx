import React, { useState } from 'react';
import { MarketProvider, useMarket } from './context/MarketContext';
import { TopNavbar } from './components/TopNavbar';
import { MarketTickerRibbon } from './components/MarketTickerRibbon';
import { HeroBenchmarkCards } from './components/HeroBenchmarkCards';
import { MarketDataTable } from './components/MarketDataTable';
import { MarketHeatmap } from './components/MarketHeatmap';
import { ForexCommoditiesMatrix } from './components/ForexCommoditiesMatrix';
import { EconomicCalendar } from './components/EconomicCalendar';
import { InteractiveChartModal } from './components/InteractiveChartModal';
import { WatchlistDrawer } from './components/WatchlistDrawer';
import { SearchSymbolModal } from './components/SearchSymbolModal';
import {
  TrendingUp,
  BarChart3,
  Flame,
  ShieldCheck,
  Compass,
  Clock,
  Layers,
} from 'lucide-react';

function MarketsDashboard() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const { setActiveCategory } = useMarket();

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    if (tab === 'stocks') setActiveCategory('stocks');
    else if (tab === 'crypto') setActiveCategory('crypto');
    else if (tab === 'forex') setActiveCategory('forex');
    else if (tab === 'indices') setActiveCategory('indices');
    else setActiveCategory('all');
  };

  return (
    <div className="min-h-screen bg-[#131722] text-[#f0f3fa] flex flex-col font-sans selection:bg-[#2962ff] selection:text-white">
      {/* Top Navbar */}
      <TopNavbar currentTab={currentTab} onTabChange={handleTabChange} />

      {/* Top Ticker Ribbon */}
      <MarketTickerRibbon />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 lg:px-6 py-5 flex flex-col gap-6">
        {/* Market Overview Header Banner */}
        <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#1e222d] border border-[#363a45] rounded-xs p-4 sm:p-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-[#2962ff] uppercase tracking-wider bg-[#2962ff]/10 px-2 py-0.5 rounded-xs">
                Global Markets Intelligence
              </span>
              <span className="text-xs text-[#787b86]">Institutional Feed</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f0f3fa]">
              World financial markets at a glance
            </h1>
            <p className="text-xs sm:text-sm text-[#787b86] mt-1 max-w-2xl">
              Track global equities, cryptocurrencies, foreign exchange, commodities, and benchmark rates with real-time analytics and simulated execution.
            </p>
          </div>

          {/* Quick Institutional Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#131722] p-3 rounded-xs border border-[#363a45] shrink-0 w-full md:w-auto text-xs">
            <div>
              <span className="text-[10px] text-[#787b86] uppercase block">Global MktCap</span>
              <span className="font-bold text-[#f0f3fa] tabular-nums">$118.42T</span>
            </div>
            <div>
              <span className="text-[10px] text-[#787b86] uppercase block">24h Volume</span>
              <span className="font-bold text-[#f0f3fa] tabular-nums">$284.15B</span>
            </div>
            <div>
              <span className="text-[10px] text-[#787b86] uppercase block">BTC Dominance</span>
              <span className="font-bold text-[#f7931a] tabular-nums">57.4%</span>
            </div>
            <div>
              <span className="text-[10px] text-[#787b86] uppercase block">Fear & Greed</span>
              <span className="font-bold text-[#089981] tabular-nums">71 (Greed)</span>
            </div>
          </div>
        </section>

        {/* Tab-driven View Content */}
        {currentTab === 'overview' && (
          <>
            {/* Section 1: Hero Benchmark Cards */}
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <h2 className="text-sm font-bold text-[#f0f3fa] flex items-center gap-2">
                  <TrendingUp size={15} className="text-[#2962ff]" />
                  <span>Key World Benchmarks</span>
                </h2>
                <span className="text-[#787b86] text-[11px]">Hover or click to view full candlestick chart</span>
              </div>
              <HeroBenchmarkCards />
            </section>

            {/* Section 2: Core Market Data Table */}
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <h2 className="text-sm font-bold text-[#f0f3fa] flex items-center gap-2">
                  <BarChart3 size={15} className="text-[#2962ff]" />
                  <span>Market Movers & Screeners</span>
                </h2>
                <span className="text-[#787b86] text-[11px]">Streaming live bid/ask quotes</span>
              </div>
              <MarketDataTable />
            </section>

            {/* Section 3: Heatmap Treemap */}
            <section>
              <MarketHeatmap />
            </section>

            {/* Section 4: FX Matrix & Commodities */}
            <section>
              <ForexCommoditiesMatrix />
            </section>

            {/* Section 5: Macro Economic Calendar */}
            <section>
              <EconomicCalendar />
            </section>
          </>
        )}

        {currentTab === 'stocks' && (
          <div className="space-y-6">
            <HeroBenchmarkCards />
            <MarketDataTable />
            <MarketHeatmap />
          </div>
        )}

        {currentTab === 'crypto' && (
          <div className="space-y-6">
            <HeroBenchmarkCards />
            <MarketDataTable />
          </div>
        )}

        {currentTab === 'forex' && (
          <div className="space-y-6">
            <ForexCommoditiesMatrix />
            <MarketDataTable />
          </div>
        )}

        {currentTab === 'indices' && (
          <div className="space-y-6">
            <HeroBenchmarkCards />
            <MarketDataTable />
          </div>
        )}

        {currentTab === 'heatmap' && (
          <div className="space-y-6">
            <MarketHeatmap />
            <MarketDataTable />
          </div>
        )}

        {currentTab === 'calendar' && (
          <div className="space-y-6">
            <EconomicCalendar />
            <MarketDataTable />
          </div>
        )}
      </main>

      {/* Modals & Slide-out Drawers */}
      <InteractiveChartModal />
      <WatchlistDrawer />
      <SearchSymbolModal />

      {/* Institutional Footer */}
      <footer className="mt-auto border-t border-[#363a45] bg-[#1e222d] py-5 px-4 lg:px-6 text-xs text-[#787b86]">
        <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-xs bg-[#2962ff] flex items-center justify-center text-white font-bold text-[10px]">
              A
            </div>
            <span className="font-semibold text-[#dfe2f2]">Apex Markets</span>
            <span>·</span>
            <span>Markets data calibrated to institutional standard</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-[#089981]" />
              <span>Quotes Real-time / CME / NASDAQ</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-[#2962ff]" />
              <span>Simulated Paper Execution Active</span>
            </span>
            <span>·</span>
            <span>© {new Date().getFullYear()} Apex Precision Markets</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <MarketProvider>
      <MarketsDashboard />
    </MarketProvider>
  );
}
