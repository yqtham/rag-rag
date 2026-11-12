import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { AssetLogo } from './AssetLogo';
import { Bell, X, Trash2, Plus, Volume2, VolumeX, CheckCircle2 } from 'lucide-react';

export const AlertsManagerModal: React.FC = () => {
  const {
    isAlertsModalOpen,
    setIsAlertsModalOpen,
    alerts,
    addAlert,
    removeAlert,
    assets,
    setSelectedAsset,
    soundEnabled,
    setSoundEnabled,
  } = useMarket();

  const [symbol, setSymbol] = useState('NVDA');
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [targetPrice, setTargetPrice] = useState<number>(140);
  const [message, setMessage] = useState('');

  if (!isAlertsModalOpen) return null;

  const currentAsset = assets.find(a => a.symbol === symbol) || assets[0];

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetPrice <= 0) return;
    addAlert(symbol, targetPrice, condition, message);
    setMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#1e222d] border border-[#363a45] rounded-xs shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-3.5 bg-[#171b26] border-b border-[#363a45] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-[#2962ff]" />
            <h3 className="text-sm font-bold text-[#f0f3fa]">Price Alerts Manager</h3>
            <span className="text-[10px] bg-[#2962ff]/20 text-[#2962ff] px-1.5 py-0.2 rounded-xs font-semibold">
              Pro Cloud Alerts
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Audio notifications enabled' : 'Audio notifications muted'}
              className="p-1.5 rounded-xs text-[#787b86] hover:text-[#f0f3fa] border border-[#363a45]"
            >
              {soundEnabled ? <Volume2 size={14} className="text-[#089981]" /> : <VolumeX size={14} />}
            </button>
            <button
              onClick={() => setIsAlertsModalOpen(false)}
              className="p-1.5 rounded-xs hover:bg-[#2a2e39] text-[#787b86] hover:text-[#f0f3fa]"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Create Alert Form */}
        <form onSubmit={handleAddAlert} className="p-4 bg-[#131722] border-b border-[#363a45] space-y-3 text-xs">
          <span className="text-[10px] font-bold text-[#787b86] uppercase tracking-wider block">
            Create New Market Alert
          </span>

          <div className="grid grid-cols-3 gap-2">
            {/* Symbol Select */}
            <div>
              <label className="text-[10px] text-[#787b86] block mb-1">Asset</label>
              <select
                value={symbol}
                onChange={e => {
                  setSymbol(e.target.value);
                  const a = assets.find(x => x.symbol === e.target.value);
                  if (a) setTargetPrice(Number((a.price * 1.02).toFixed(2)));
                }}
                className="w-full px-2 py-1.5 bg-[#1e222d] border border-[#363a45] text-[#f0f3fa] rounded-xs font-semibold"
              >
                {assets.map(a => (
                  <option key={a.symbol} value={a.symbol}>
                    {a.symbol} (${a.price.toFixed(a.price > 100 ? 1 : 2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="text-[10px] text-[#787b86] block mb-1">Condition</label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value as any)}
                className="w-full px-2 py-1.5 bg-[#1e222d] border border-[#363a45] text-[#f0f3fa] rounded-xs font-semibold"
              >
                <option value="ABOVE">Rises Above (≥)</option>
                <option value="BELOW">Falls Below (≤)</option>
              </select>
            </div>

            {/* Target Price */}
            <div>
              <label className="text-[10px] text-[#787b86] block mb-1">Target (USD)</label>
              <input
                type="number"
                step="any"
                value={targetPrice}
                onChange={e => setTargetPrice(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-[#1e222d] border border-[#363a45] focus:border-[#2962ff] text-[#f0f3fa] rounded-xs tabular-nums focus:outline-hidden font-semibold"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Custom note (e.g. 50-day breakout, resistance test)..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-[#1e222d] border border-[#363a45] text-[#f0f3fa] rounded-xs placeholder-[#787b86] focus:outline-hidden text-xs"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#2962ff] hover:bg-[#1e4bd8] text-white rounded-xs font-bold text-xs flex items-center gap-1 shrink-0"
            >
              <Plus size={14} />
              <span>Add Alert</span>
            </button>
          </div>
        </form>

        {/* Existing Alerts List */}
        <div className="flex-1 overflow-y-auto max-h-72 divide-y divide-[#363a45]/40 p-2 text-xs">
          {alerts.length === 0 ? (
            <div className="py-12 text-center text-[#787b86]">
              No active alerts. Add one above to receive instant triggers when price levels are touched.
            </div>
          ) : (
            alerts.map(al => {
              const asset = assets.find(a => a.symbol === al.symbol);
              return (
                <div key={al.id} className="p-2.5 rounded-xs hover:bg-[#262a35] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <AssetLogo symbol={al.symbol} size={22} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#f0f3fa]">{al.symbol}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-xs ${
                            al.condition === 'ABOVE'
                              ? 'bg-[#089981]/15 text-[#089981]'
                              : 'bg-[#f23645]/15 text-[#f23645]'
                          }`}
                        >
                          {al.condition === 'ABOVE' ? '≥ $' : '≤ $'}
                          {al.targetPrice.toLocaleString()}
                        </span>
                        {al.triggered && (
                          <span className="text-[10px] bg-[#ffd700]/20 text-[#ffd700] px-1 rounded-xs font-bold flex items-center gap-0.5">
                            <CheckCircle2 size={10} /> Triggered
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#787b86] block truncate max-w-[260px]">
                        {al.message}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {asset && (
                      <button
                        onClick={() => {
                          setSelectedAsset(asset);
                          setIsAlertsModalOpen(false);
                        }}
                        className="text-[11px] text-[#2962ff] hover:underline font-semibold"
                      >
                        Chart
                      </button>
                    )}
                    <button
                      onClick={() => removeAlert(al.id)}
                      className="p-1 text-[#787b86] hover:text-[#f23645] rounded-xs"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-[#171b26] border-t border-[#363a45] flex items-center justify-between text-[11px] text-[#787b86]">
          <span>Alerts persist in browser local storage</span>
          <span className="text-[#089981]">Synthesizer active: {soundEnabled ? 'Sound ON' : 'Muted'}</span>
        </div>
      </div>
    </div>
  );
};
