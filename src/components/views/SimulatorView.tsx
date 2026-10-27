/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { AtmSlotRack } from '../AtmSlotRack';
import { ActivityLogTable } from '../ActivityLogTable';
import { LiveSimulationStage } from '../LiveSimulationStage';
import {
  Banknote,
  Building2,
  Users,
  PlusCircle,
  MinusCircle,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const SimulatorView: React.FC = () => {
  const {
    buffer,
    capacity,
    inPtr,
    outPtr,
    count,
    emptySemaphore,
    fullSemaphore,
    mutex,
    producerState,
    consumerState,
    addCash,
    withdrawCash,
    totalProduced,
    totalConsumed,
    logs,
    clearLogs,
  } = useSimulation();

  const isFull = count >= capacity;
  const isEmpty = count <= 0;

  return (
    <div className="space-y-6">
      {/* 1. Main Live Visual Animated Stage */}
      <LiveSimulationStage />

      {/* 2. Detailed 3-Section Visual Layout: Producer | Shared Buffer | Consumer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Section 1: Producer (Bank Cash Refill Team) */}
        <div className="lg:col-span-3 bg-white border border-purple-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Bank Refill Team
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold">
                    Producer Process
                  </span>
                </div>
              </div>

              {/* Status Tag */}
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  producerState === 'RUNNING'
                    ? 'bg-emerald-600 text-white animate-pulse'
                    : producerState === 'ATM FULL'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {producerState}
              </span>
            </div>

            {/* Visual Production Card */}
            <div className={`p-4 rounded-xl border text-center transition-all ${
              producerState === 'RUNNING'
                ? 'border-emerald-400 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-300'
                : 'border-slate-200 bg-slate-50/50'
            }`}>
              <div className="relative inline-block my-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                  <Banknote className="w-7 h-7" />
                </div>
              </div>
              <div className="text-xs font-bold text-slate-800 mt-1">
                {producerState === 'RUNNING'
                  ? 'Refilling $100 note...'
                  : producerState === 'ATM FULL'
                  ? 'Blocked: ATM Buffer Full'
                  : 'Ready to Refill'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                Total Refilled: <strong className="text-emerald-700">{totalProduced} units</strong>
              </div>
            </div>

            {/* Add Cash Manual Button */}
            <button
              onClick={() => addCash()}
              disabled={isFull}
              className={`w-full py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                isFull
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98 shadow-emerald-600/20'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Cash (+$100)</span>
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-100 text-[11px] text-slate-500">
            Calls: <code className="font-mono text-purple-700 font-bold">wait(empty) &rarr; wait(mutex) &rarr; buffer[in] = cash</code>
          </div>
        </div>

        {/* Section 2: Shared Buffer (ATM Cash Storage 10 Slots) */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          <AtmSlotRack
            buffer={buffer}
            capacity={capacity}
            inPtr={inPtr}
            outPtr={outPtr}
            producerState={producerState}
            consumerState={consumerState}
          />

          {/* Quick Synchronization Status Indicator Bar */}
          <div className="p-4 rounded-2xl bg-white border border-purple-200/80 shadow-xs flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-600">
                Empty: <strong className="text-emerald-700 text-sm">{emptySemaphore}</strong>
              </span>
              <span>·</span>
              <span className="text-slate-600">
                Full: <strong className="text-blue-700 text-sm">{fullSemaphore}</strong>
              </span>
              <span>·</span>
              <span className="text-slate-600 flex items-center gap-1">
                Mutex:
                {mutex === 1 ? (
                  <span className="text-purple-700 font-bold flex items-center gap-0.5">
                    <Unlock className="w-3 h-3" /> 1 (Unlocked)
                  </span>
                ) : (
                  <span className="text-amber-700 font-bold flex items-center gap-0.5">
                    <Lock className="w-3 h-3" /> 0 (Locked)
                  </span>
                )}
              </span>
            </div>

            <div className="text-[11px] font-mono text-purple-700 font-semibold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              empty + full = {emptySemaphore + fullSemaphore} (Strict Invariant)
            </div>
          </div>
        </div>

        {/* Section 3: Consumer (ATM Customer) */}
        <div className="lg:col-span-3 bg-white border border-purple-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    ATM Customer
                  </h3>
                  <span className="text-[10px] font-mono text-blue-700 font-bold">
                    Consumer Process
                  </span>
                </div>
              </div>

              {/* Status Tag */}
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  consumerState === 'RUNNING'
                    ? 'bg-blue-600 text-white animate-pulse'
                    : consumerState === 'ATM EMPTY'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}
              >
                {consumerState}
              </span>
            </div>

            {/* Visual Consumption Card */}
            <div className={`p-4 rounded-xl border text-center transition-all ${
              consumerState === 'RUNNING'
                ? 'border-blue-400 bg-blue-50/70 shadow-xs ring-2 ring-blue-300'
                : 'border-slate-200 bg-slate-50/50'
            }`}>
              <div className="relative inline-block my-2">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto shadow-xs">
                  <Banknote className="w-7 h-7" />
                </div>
              </div>
              <div className="text-xs font-bold text-slate-800 mt-1">
                {consumerState === 'RUNNING'
                  ? 'Dispensing $100 note...'
                  : consumerState === 'ATM EMPTY'
                  ? 'Blocked: ATM Buffer Empty'
                  : 'Ready to Withdraw'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                Total Withdrawn: <strong className="text-blue-700">{totalConsumed} units</strong>
              </div>
            </div>

            {/* Withdraw Cash Manual Button */}
            <button
              onClick={() => withdrawCash()}
              disabled={isEmpty}
              className={`w-full py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                isEmpty
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-98 shadow-blue-600/20'
              }`}
            >
              <MinusCircle className="w-4 h-4" />
              <span>Withdraw Cash (-$100)</span>
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-100 text-[11px] text-slate-500">
            Calls: <code className="font-mono text-purple-700 font-bold">wait(full) &rarr; wait(mutex) &rarr; cash = buffer[out]</code>
          </div>
        </div>
      </div>

      {/* Activity Log Feed */}
      <ActivityLogTable logs={logs} onClear={clearLogs} />
    </div>
  );
};
