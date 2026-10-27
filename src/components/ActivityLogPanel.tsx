/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActivityLogItem } from '../types/osSimulation';
import { Terminal, Trash2, Filter } from 'lucide-react';

interface ActivityLogPanelProps {
  logs: ActivityLogItem[];
  onClear: () => void;
}

export const ActivityLogPanel: React.FC<ActivityLogPanelProps> = ({ logs, onClear }) => {
  const [filter, setFilter] = useState<'ALL' | 'PRODUCER' | 'CONSUMER' | 'WAIT'>('ALL');

  const filteredLogs = logs.filter((log) => {
    if (filter === 'ALL') return true;
    if (filter === 'PRODUCER') return log.actor === 'PRODUCER';
    if (filter === 'CONSUMER') return log.actor === 'CONSUMER';
    if (filter === 'WAIT') return log.type.startsWith('WAIT');
    return true;
  });

  return (
    <div className="bg-[#0b132b]/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-teal-400" />
          <h3 className="text-xs font-semibold text-slate-200 tracking-wider uppercase font-mono">
            Process Execution & Synchronization Log
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            ({logs.length} events)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Filter */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-md border border-slate-800">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
                filter === 'ALL' ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('PRODUCER')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
                filter === 'PRODUCER' ? 'bg-teal-500/20 text-teal-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Producer
            </button>
            <button
              onClick={() => setFilter('CONSUMER')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
                filter === 'CONSUMER' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Consumer
            </button>
            <button
              onClick={() => setFilter('WAIT')}
              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
                filter === 'WAIT' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Wait States
            </button>
          </div>

          <button
            onClick={onClear}
            title="Clear logs"
            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log Feed */}
      <div className="p-3 overflow-y-auto space-y-2 flex-1 max-h-[340px] font-mono text-xs">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No activity records matching selected filter.
          </div>
        ) : (
          filteredLogs.map((item) => {
            const isWait = item.type.startsWith('WAIT');
            const isProduce = item.type === 'PRODUCE';
            const isConsume = item.type === 'CONSUME';

            return (
              <div
                key={item.id}
                className={`p-2.5 rounded-lg border text-xs transition-colors ${
                  isWait
                    ? 'border-amber-500/30 bg-amber-950/20 text-amber-200'
                    : isProduce
                    ? 'border-teal-500/30 bg-teal-950/15 text-slate-200'
                    : isConsume
                    ? 'border-cyan-500/30 bg-cyan-950/15 text-slate-200'
                    : 'border-slate-800 bg-slate-900/40 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-mono">{item.timestamp}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-semibold tracking-wider ${
                        item.actor === 'PRODUCER'
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                          : item.actor === 'CONSUMER'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {item.actor}
                    </span>
                    <span className="text-slate-400 font-semibold">{item.type}</span>
                  </div>

                  {/* Semaphore values at moment of event */}
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800/80">
                    <span>empty: <strong className="text-teal-400">{item.semaphores.empty}</strong></span>
                    <span>·</span>
                    <span>full: <strong className="text-cyan-400">{item.semaphores.full}</strong></span>
                    <span>·</span>
                    <span>mutex: <strong className={item.semaphores.mutex === 1 ? 'text-emerald-400' : 'text-rose-400'}>{item.semaphores.mutex}</strong></span>
                  </div>
                </div>

                <p className="font-sans text-xs text-slate-200 leading-snug">{item.message}</p>
                {item.details && (
                  <p className="text-[11px] font-mono text-slate-400 mt-1 pl-2 border-l border-slate-700/60">
                    {item.details}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
