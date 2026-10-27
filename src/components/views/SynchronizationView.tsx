/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Layers,
  ArrowRight,
  CheckCircle2,
  Info,
  Code2,
} from 'lucide-react';

export const SynchronizationView: React.FC = () => {
  const {
    capacity,
    count,
    emptySemaphore,
    fullSemaphore,
    mutex,
    addCash,
    withdrawCash,
  } = useSimulation();

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white border border-purple-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono text-purple-700 font-bold mb-1">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <span>Process Synchronization Primitives</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Semaphore & Mutex Synchronization
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Three synchronization primitives ensure that the ATM cash buffer operates safely without data corruption, race conditions, buffer overflow, or buffer underflow.
        </p>
      </div>

      {/* 3 Primitives Cards: Empty Semaphore | Full Semaphore | Mutex Lock */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Empty Semaphore */}
        <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide font-mono">
                Empty Semaphore
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>

            <div className="my-3 flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono text-emerald-700">
                {emptySemaphore}
              </span>
              <span className="text-xs font-mono text-slate-500">
                / {capacity} slots
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>Role:</strong> Counting semaphore that tracks the <strong>number of empty buffer slots</strong>.
              </p>
              <p>
                Initialized to <strong>{capacity}</strong>. The Bank Refill Team executes <code className="font-mono text-emerald-700 font-bold">wait(&empty)</code> before depositing. If <code className="font-mono font-bold">empty == 0</code>, the producer is automatically blocked to prevent <strong>buffer overflow</strong>.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-100 text-[11px] font-mono text-emerald-800 font-medium">
            Status: {emptySemaphore > 0 ? `${emptySemaphore} slots available for refill` : '0 (Buffer Full, Producer Blocked)'}
          </div>
        </div>

        {/* 2. Full Semaphore */}
        <div className="p-5 rounded-2xl bg-white border border-blue-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-blue-100">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wide font-mono">
                Full Semaphore
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>

            <div className="my-3 flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono text-blue-700">
                {fullSemaphore}
              </span>
              <span className="text-xs font-mono text-slate-500">
                / {capacity} items
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>Role:</strong> Counting semaphore that tracks the <strong>number of occupied cash slots</strong>.
              </p>
              <p>
                Initialized to <strong>0</strong>. Customers execute <code className="font-mono text-blue-700 font-bold">wait(&full)</code> before withdrawing. If <code className="font-mono font-bold">full == 0</code>, the consumer is automatically blocked to prevent <strong>buffer underflow</strong>.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-blue-100 text-[11px] font-mono text-blue-800 font-medium">
            Status: {fullSemaphore > 0 ? `${fullSemaphore} cash notes available to withdraw` : '0 (Buffer Empty, Consumer Blocked)'}
          </div>
        </div>

        {/* 3. Mutex Lock */}
        <div className={`p-5 rounded-2xl bg-white border shadow-xs flex flex-col justify-between transition-all ${
          mutex === 0 ? 'border-amber-300 bg-amber-50/40 ring-1 ring-amber-300' : 'border-purple-200'
        }`}>
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <span className="text-xs font-bold text-purple-950 uppercase tracking-wide font-mono">
                Mutex Lock
              </span>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                mutex === 0 ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
              }`}>
                {mutex === 0 ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </div>
            </div>

            <div className="my-3 flex items-baseline gap-2">
              <span className={`text-4xl font-black font-mono ${mutex === 0 ? 'text-amber-700' : 'text-purple-700'}`}>
                {mutex}
              </span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                  mutex === 0 ? 'bg-amber-100 text-amber-900' : 'bg-purple-100 text-purple-900'
                }`}
              >
                {mutex === 0 ? 'HELD (Locked)' : 'AVAILABLE (Unlocked)'}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>Role:</strong> Binary semaphore (0 or 1) that enforces <strong>Mutual Exclusion</strong>.
              </p>
              <p>
                Protects the critical section. Only <strong>one process</strong> (either Producer or Consumer) can read or modify the shared buffer array at any given instant.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-100 text-[11px] font-mono text-purple-800 font-medium">
            {mutex === 1 ? 'Buffer available for exclusive access' : 'Critical section in progress'}
          </div>
        </div>
      </div>

      {/* Synchronization Mathematical Invariant Card */}
      <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-purple-700 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-purple-950 uppercase font-mono">
                System Invariant: Empty + Full == Buffer Capacity
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                In a correctly synchronized system, the sum of free slots and occupied slots is mathematically constant:
              </p>
            </div>
          </div>

          <div className="px-4 py-2 bg-white rounded-xl border border-purple-200 font-mono text-sm font-bold text-purple-900 whitespace-nowrap shadow-xs">
            {emptySemaphore} (Empty) + {fullSemaphore} (Full) = 10 (Capacity)
          </div>
        </div>
      </div>

      {/* Synchronized POSIX C Execution Code Reference */}
      <div className="bg-white border border-purple-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-purple-100">
          <Code2 className="w-4 h-4 text-purple-700" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide font-mono">
            How Synchronization Controls Access in Code
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          {/* Producer C Algorithm */}
          <div className="p-4 rounded-xl bg-slate-900 text-slate-200 border border-slate-800">
            <div className="text-emerald-400 font-bold pb-2 mb-3 border-b border-slate-800 flex items-center justify-between">
              <span>Producer (Bank Refill Team)</span>
              <span className="text-[10px] text-slate-400 font-normal">Step-by-Step</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div><span className="text-slate-500">1.</span> <span className="text-amber-400">sem_wait(&empty);</span> <span className="text-slate-500">// Block if buffer full</span></div>
              <div><span className="text-slate-500">2.</span> <span className="text-purple-400">pthread_mutex_lock(&mutex);</span> <span className="text-slate-500">// Acquire lock</span></div>
              <div className="text-emerald-300 font-semibold bg-emerald-950/40 px-1 py-0.5 rounded">
                <span className="text-slate-500">3.</span> buffer[in] = cash; in = (in + 1) % 10;
              </div>
              <div><span className="text-slate-500">4.</span> <span className="text-purple-400">pthread_mutex_unlock(&mutex);</span> <span className="text-slate-500">// Release lock</span></div>
              <div><span className="text-slate-500">5.</span> <span className="text-blue-400">sem_post(&full);</span> <span className="text-slate-500">// Wake waiting consumer</span></div>
            </div>
          </div>

          {/* Consumer C Algorithm */}
          <div className="p-4 rounded-xl bg-slate-900 text-slate-200 border border-slate-800">
            <div className="text-blue-400 font-bold pb-2 mb-3 border-b border-slate-800 flex items-center justify-between">
              <span>Consumer (ATM Customer)</span>
              <span className="text-[10px] text-slate-400 font-normal">Step-by-Step</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div><span className="text-slate-500">1.</span> <span className="text-amber-400">sem_wait(&full);</span> <span className="text-slate-500">// Block if buffer empty</span></div>
              <div><span className="text-slate-500">2.</span> <span className="text-purple-400">pthread_mutex_lock(&mutex);</span> <span className="text-slate-500">// Acquire lock</span></div>
              <div className="text-blue-300 font-semibold bg-blue-950/40 px-1 py-0.5 rounded">
                <span className="text-slate-500">3.</span> cash = buffer[out]; out = (out + 1) % 10;
              </div>
              <div><span className="text-slate-500">4.</span> <span className="text-purple-400">pthread_mutex_unlock(&mutex);</span> <span className="text-slate-500">// Release lock</span></div>
              <div><span className="text-slate-500">5.</span> <span className="text-emerald-400">sem_post(&empty);</span> <span className="text-slate-500">// Wake waiting producer</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
