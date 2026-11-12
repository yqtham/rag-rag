import React from 'react';
import { useMarket } from '../context/MarketContext';
import { MarketCategory } from '../types/market';
import { Search, Bookmark, TrendingUp, Bell, Zap, Volume2, VolumeX } from 'lucide-react';

interface TopNavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ currentTab, onTabChange }) => {
  const {
    watchlist,
    setIsWatchlistOpen,
    setIsSearchOpen,
    portfolio,
    marketStatus,
    isProMode,
    setIsProMode,
    alerts,
    triggeredAlerts,
    setIsAlertsModalOpen,
    soundEnabled,
    setSoundEnabled,
  } = useMarket();

  const navLinks: { id: string; label: string; isProBadge?: boolean }[] = [
    { id: 'workstation', label: 'Workstation', isProBadge: true },
    { id: 'overview', label: 'Overview' },
    { id: 'screener', label: 'Screener' },
    { id: 'stocks', label: 'Stocks' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'forex', label: 'Forex' },
    { id: 'heatmap', label: 'Heatmap' },
    { id: 'calendar', label: 'Calendar' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#1e222d] border-b border-[#363a45] px-4 lg:px-6 py-2">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onTabChange('workstation')}
            className="flex items-center gap-2.5 text-left group focus:outline-hidden"
          >
            <div className="w-8 h-8 rounded-xs bg-[#2962ff] flex items-center justify-center text-white font-bold tracking-tight shadow-xs">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[17px] font-bold tracking-tight text-[#f0f3fa] group-hover:text-white transition-colors whitespace-nowrap">
                  Apex Markets
                </span>
                <span className="px-1.5 py-0.2 bg-gradient-to-r from-[#2962ff] to-[#9945ff] text-white font-extrabold text-[9px] rounded-xs tracking-wider uppercase">
                  PRO
                </span>
              </div>
            </div>
          </button>

          {/* Market Status Live Pill */}
          <div className="hidden xl:flex items-center gap-2 pl-3 ml-2 border-l border-[#363a45] text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                marketStatus.isOpen ? 'bg-[#089981]' : 'bg-[#e5a000]'
              }`}
            />
            <span className="text-[#c3c5d8] font-medium">{marketStatus.sessionName}</span>
            <span className="text-[#787b86]">·</span>
            <span className="text-[#787b86] tabular-nums text-[11px]">{marketStatus.countdown}</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
          {navLinks.map(link => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onTabChange(link.id)}
                className={`relative px-2.5 py-1.5 text-xs lg:text-[13px] font-medium transition-colors whitespace-nowrap shrink-0 rounded-xs flex items-center gap-1.5 ${
                  isActive
                    ? 'text-[#f0f3fa] bg-[#2a2e39]'
                    : 'text-[#787b86] hover:text-[#f0f3fa] hover:bg-[#262a35]'
                }`}
              >
                <span>{link.label}</span>
                {link.isProBadge && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2962ff]" />
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#2962ff]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Quick Search */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-[#131722] hover:bg-[#2a2e39] text-[#787b86] hover:text-[#f0f3fa] border border-[#363a45] rounded-xs text-xs transition-colors"
            title="Search symbols (Ctrl+K)"
          >
            <Search size={14} />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] bg-[#1e222d] border border-[#363a45] rounded-xs text-[#787b86]">
              ⌘K
            </kbd>
          </button>

          {/* Alerts Trigger */}
          <button
            onClick={() => setIsAlertsModalOpen(true)}
            className="relative flex items-center gap-1.5 px-2 py-1.5 bg-[#1e222d] hover:bg-[#2a2e39] text-[#dfe2f2] border border-[#363a45] rounded-xs text-xs font-medium transition-colors"
            title="Manage Price Alerts"
          >
            <Bell size={14} className={triggeredAlerts.length > 0 ? 'text-[#ffd700]' : 'text-[#787b86]'} />
            <span className="hidden sm:inline">Alerts</span>
            {alerts.length > 0 && (
              <span className="px-1 py-0.2 bg-[#2962ff]/20 text-[#2962ff] rounded-xs text-[10px] font-bold tabular-nums">
                {alerts.length}
              </span>
            )}
            {triggeredAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#f23645] animate-ping" />
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 bg-[#1e222d] hover:bg-[#2a2e39] text-[#787b86] hover:text-[#f0f3fa] border border-[#363a45] rounded-xs"
            title={soundEnabled ? 'Synthesizer Audio Enabled' : 'Audio Muted'}
          >
            {soundEnabled ? <Volume2 size={14} className="text-[#089981]" /> : <VolumeX size={14} />}
          </button>

          {/* Watchlist Drawer Toggle */}
          <button
            onClick={() => setIsWatchlistOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1e222d] hover:bg-[#2a2e39] text-[#dfe2f2] border border-[#363a45] rounded-xs text-xs font-medium transition-colors"
          >
            <Bookmark size={14} className="text-[#2962ff]" />
            <span className="hidden sm:inline">Watchlist</span>
            <span className="px-1.5 py-0.2 bg-[#2962ff]/20 text-[#2962ff] rounded-xs text-[11px] font-semibold tabular-nums">
              {watchlist.length}
            </span>
          </button>

          {/* Paper Trading Portfolio Quick Stats */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-[#363a45]">
            <div className="flex flex-col text-right">
              <div className="flex items-center justify-end gap-1 text-[10px] text-[#787b86] font-medium tracking-wide uppercase">
                <TrendingUp size={11} className="text-[#089981]" />
                <span>Sim Equity</span>
              </div>
              <div className="text-xs font-semibold text-[#f0f3fa] tabular-nums font-mono">
                ${portfolio.totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
