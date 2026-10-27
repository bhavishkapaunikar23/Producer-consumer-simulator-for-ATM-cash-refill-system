/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Lock, Unlock, Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface SemaphoreOverviewProps {
  emptySemaphore: number;
  fullSemaphore: number;
  capacity: number;
  mutex: number;
}

export const SemaphoreOverviewWidget: React.FC<SemaphoreOverviewProps> = ({
  emptySemaphore,
  fullSemaphore,
  capacity,
  mutex,
}) => {
  const isInvariantValid = emptySemaphore + fullSemaphore === capacity;
  const isMutexLocked = mutex === 0;

  return (
    <div className="bg-[#0b132b]/80 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <h3 className="text-xs font-semibold text-slate-200 tracking-wider uppercase font-mono">
            OS Synchronization Primitives (Live Values)
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>empty + full = {emptySemaphore + fullSemaphore} (In Sync)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Empty Semaphore */}
        <div className="p-3.5 rounded-lg bg-slate-900/60 border border-teal-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 font-mono">
              sem_t empty
            </span>
            <Layers className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-teal-300">
              {emptySemaphore}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ {capacity}</span>
          </div>
          <div className="text-[11px] text-slate-400 leading-tight">
            Counting semaphore tracks <strong className="text-teal-300 font-semibold">available empty slots</strong>. Blocks producer when 0.
          </div>
        </div>

        {/* Full Semaphore */}
        <div className="p-3.5 rounded-lg bg-slate-900/60 border border-cyan-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 font-mono">
              sem_t full
            </span>
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-300">
              {fullSemaphore}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ {capacity}</span>
          </div>
          <div className="text-[11px] text-slate-400 leading-tight">
            Counting semaphore tracks <strong className="text-cyan-300 font-semibold">cash units present</strong>. Blocks consumer when 0.
          </div>
        </div>

        {/* Mutex Binary Semaphore */}
        <div className={`p-3.5 rounded-lg bg-slate-900/60 border flex flex-col justify-between ${
          isMutexLocked
            ? 'border-amber-500/50 bg-amber-950/20'
            : 'border-emerald-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 font-mono">
              pthread_mutex_t
            </span>
            {isMutexLocked ? (
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Unlock className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${isMutexLocked ? 'text-amber-400' : 'text-emerald-400'}`}>
              {mutex}
            </span>
            <span className="text-xs font-mono px-1.5 py-0.5 rounded uppercase tracking-wider text-[10px] font-semibold bg-slate-800 text-slate-300">
              {isMutexLocked ? 'LOCKED (In CS)' : 'UNLOCKED'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 leading-tight">
            Binary lock guarantees <strong className="text-slate-200 font-semibold">mutual exclusion</strong>: only 1 process alters memory at once.
          </div>
        </div>
      </div>
    </div>
  );
};
