/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActivityLogItem } from '../types/osSimulation';
import { Terminal, Trash2, Filter } from 'lucide-react';

interface ActivityLogTableProps {
  logs: ActivityLogItem[];
  onClear: () => void;
}

export const ActivityLogTable: React.FC<ActivityLogTableProps> = ({ logs, onClear }) => {
  const [filter, setFilter] = useState<'ALL' | 'PRODUCER' | 'CONSUMER' | 'WAIT'>('ALL');

  const filteredLogs = logs.filter((log) => {
    if (filter === 'ALL') return true;
    if (filter === 'PRODUCER') return log.actor === 'PRODUCER';
    if (filter === 'CONSUMER') return log.actor === 'CONSUMER';
    if (filter === 'WAIT') return log.type === 'WAIT';
    return true;
  });

  return (
    <div className="bg-white border border-purple-200/80 rounded-2xl overflow-hidden shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 bg-purple-50/60 border-b border-purple-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-purple-700" />
          <h3 className="text-xs font-bold text-purple-950 uppercase tracking-wider font-mono">
            Recent Activity Log
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            ({logs.length} events)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented Filter */}
          <div className="flex items-center gap-1 p-0.5 bg-white rounded-lg border border-purple-200 text-[11px]">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                filter === 'ALL'
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('PRODUCER')}
              className={`px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                filter === 'PRODUCER'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Producer
            </button>
            <button
              onClick={() => setFilter('CONSUMER')}
              className={`px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                filter === 'CONSUMER'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Consumer
            </button>
            <button
              onClick={() => setFilter('WAIT')}
              className={`px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                filter === 'WAIT'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Wait States
            </button>
          </div>

          <button
            onClick={onClear}
            title="Clear logs"
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log Feed */}
      <div className="p-3.5 overflow-y-auto space-y-2 flex-1 max-h-[300px] font-mono text-xs">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No activity records matching selected filter.
          </div>
        ) : (
          filteredLogs.map((item) => {
            const isWait = item.type === 'WAIT';
            const isProduce = item.type === 'PRODUCE';
            const isConsume = item.type === 'CONSUME';

            return (
              <div
                key={item.id}
                className={`p-2.5 rounded-xl border text-xs transition-colors ${
                  isWait
                    ? 'border-amber-200 bg-amber-50/70 text-amber-950'
                    : isProduce
                    ? 'border-emerald-200 bg-emerald-50/40 text-emerald-950'
                    : isConsume
                    ? 'border-blue-200 bg-blue-50/40 text-blue-950'
                    : 'border-slate-200 bg-slate-50/60 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap mb-1 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono">{item.timestamp}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold tracking-wider uppercase ${
                        item.actor === 'PRODUCER'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : item.actor === 'CONSUMER'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}
                    >
                      {item.actor}
                    </span>
                    <span className="text-slate-500 font-semibold">{item.type}</span>
                  </div>

                  {/* Semaphores at event moment */}
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    <span>empty: <strong className="text-emerald-700">{item.semaphores.empty}</strong></span>
                    <span>·</span>
                    <span>full: <strong className="text-blue-700">{item.semaphores.full}</strong></span>
                    <span>·</span>
                    <span>mutex: <strong className={item.semaphores.mutex === 1 ? 'text-purple-700' : 'text-amber-700'}>{item.semaphores.mutex}</strong></span>
                  </div>
                </div>

                <p className="font-sans text-xs text-slate-800 leading-snug">{item.message}</p>
                {item.details && (
                  <p className="text-[11px] font-mono text-slate-500 mt-1 pl-2 border-l-2 border-purple-200">
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
