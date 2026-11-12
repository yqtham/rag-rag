import React, { useState } from 'react';
import { MOCK_ECONOMIC_CALENDAR } from '../data/mockMarkets';
import { Calendar, AlertCircle } from 'lucide-react';

export const EconomicCalendar: React.FC = () => {
  const [filterImpact, setFilterImpact] = useState<'All' | 'High' | 'Medium'>('All');

  const filteredEvents = MOCK_ECONOMIC_CALENDAR.filter(e => {
    if (filterImpact === 'All') return true;
    return e.impact === filterImpact;
  });

  return (
    <div className="bg-[#1e222d] border border-[#363a45] rounded-xs p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#363a45]">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-[#2962ff]" />
          <h3 className="text-sm font-bold text-[#f0f3fa]">Economic Calendar & Catalysts</h3>
        </div>

        {/* Impact Filter */}
        <div className="flex items-center gap-1 bg-[#131722] p-0.5 rounded-xs border border-[#363a45] text-xs">
          {(['All', 'High', 'Medium'] as const).map(imp => (
            <button
              key={imp}
              onClick={() => setFilterImpact(imp)}
              className={`px-2.5 py-0.5 rounded-xs font-medium transition-colors ${
                filterImpact === imp
                  ? 'bg-[#2a2e39] text-[#f0f3fa]'
                  : 'text-[#787b86] hover:text-[#dfe2f2]'
              }`}
            >
              {imp === 'High' ? '🔴 High Impact' : imp === 'Medium' ? '🟡 Medium' : 'All Events'}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#363a45] text-[#787b86] font-semibold text-[11px] uppercase">
              <th className="py-2 pl-2">Time</th>
              <th className="py-2 px-2">Country</th>
              <th className="py-2 px-2">Event</th>
              <th className="py-2 px-2 text-center">Impact</th>
              <th className="py-2 px-2 text-right">Actual</th>
              <th className="py-2 px-2 text-right">Forecast</th>
              <th className="py-2 pr-2 text-right">Previous</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#363a45]/50">
            {filteredEvents.map(ev => {
              const isHigh = ev.impact === 'High';
              return (
                <tr key={ev.id} className="hover:bg-[#262a35] transition-colors">
                  <td className="py-2.5 pl-2 font-mono text-[#c3c5d8] tabular-nums whitespace-nowrap">
                    {ev.time}
                  </td>
                  <td className="py-2.5 px-2 font-medium text-[#f0f3fa] whitespace-nowrap">
                    <span className="px-1.5 py-0.5 rounded-xs bg-[#131722] text-[#787b86] font-mono mr-1.5">
                      {ev.countryCode}
                    </span>
                    {ev.country}
                  </td>
                  <td className="py-2.5 px-2 font-semibold text-[#f0f3fa]">{ev.title}</td>
                  <td className="py-2.5 px-2 text-center">
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded-xs text-[10px] font-bold ${
                        isHigh
                          ? 'bg-[#f23645]/15 text-[#f23645]'
                          : 'bg-[#e5a000]/15 text-[#e5a000]'
                      }`}
                    >
                      {ev.impact}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono font-bold text-[#089981] tabular-nums">
                    {ev.actual || '—'}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-[#dfe2f2] tabular-nums">
                    {ev.forecast}
                  </td>
                  <td className="py-2.5 pr-2 text-right font-mono text-[#787b86] tabular-nums">
                    {ev.previous}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pt-2 border-t border-[#363a45] flex items-center gap-1.5 text-[11px] text-[#787b86]">
        <AlertCircle size={13} className="text-[#2962ff]" />
        <span>Catalyst impact calibrated against Bloomberg consensus & Federal Reserve releases</span>
      </div>
    </div>
  );
};
