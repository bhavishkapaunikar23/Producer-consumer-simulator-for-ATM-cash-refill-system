/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import {
  Banknote,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { AtmSlotRack } from '../AtmSlotRack';
import { ActivityLogTable } from '../ActivityLogTable';
import { LiveSimulationStage } from '../LiveSimulationStage';

export const DashboardView: React.FC = () => {
  const {
    buffer,
    capacity,
    inPtr,
    outPtr,
    count,
    emptySemaphore,
    fullSemaphore,
    producerState,
    consumerState,
    totalProduced,
    totalConsumed,
    logs,
    history,
    addCash,
    withdrawCash,
    clearLogs,
  } = useSimulation();

  const isFull = count >= capacity;
  const isEmpty = count <= 0;

  return (
    <div className="space-y-6">
      {/* 1. Prominent Live Visual Simulation Stage */}
      <LiveSimulationStage />

      {/* Boundary Alerts */}
      {isFull && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>ATM FULL — Producer Waiting:</strong> Buffer reached maximum capacity of 10 cash units (empty = 0). Producer is blocked until a customer withdraws cash.
          </span>
        </div>
      )}

      {isEmpty && (
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-300 text-blue-900 text-xs font-medium flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>ATM EMPTY — Consumer Waiting:</strong> Buffer is completely depleted (0/10 units, full = 0). Consumer is blocked until the bank refills the ATM.
          </span>
        </div>
      )}

      {/* Metrics Row: 4 Clean Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Cash Units */}
        <div className="p-4 rounded-2xl bg-white border border-purple-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">ATM Cash Units</span>
            <Banknote className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-purple-950">
              ${count * 100}
            </span>
            <span className="text-xs font-mono text-slate-500">
              ({count} / {capacity} units)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-purple-50 pt-1.5">
            <span>Buffer Occupancy</span>
            <span className="font-mono font-bold text-purple-700">{Math.round((count / capacity) * 100)}%</span>
          </div>
        </div>

        {/* Available & Occupied Slots */}
        <div className="p-4 rounded-2xl bg-white border border-purple-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Available Slots</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-emerald-700">
              {emptySemaphore}
            </span>
            <span className="text-xs font-mono text-slate-500">
              free slots
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-purple-50 pt-1.5">
            <span>Occupied (Full Sem)</span>
            <span className="font-mono font-bold text-blue-700">{fullSemaphore} slots</span>
          </div>
        </div>

        {/* Total Cash Additions */}
        <div className="p-4 rounded-2xl bg-white border border-purple-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Total Refills (Additions)</span>
            <ArrowDownRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900">
              {totalProduced}
            </span>
            <span className="text-xs font-mono text-emerald-600 font-bold">
              (${totalProduced * 100})
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-purple-50 pt-1.5">
            <span>Producer Status</span>
            <span className={`font-mono font-bold text-[10px] uppercase ${
              producerState === 'RUNNING'
                ? 'text-emerald-700'
                : producerState === 'ATM FULL'
                ? 'text-amber-700'
                : 'text-slate-500'
            }`}>
              {producerState}
            </span>
          </div>
        </div>

        {/* Total Withdrawals */}
        <div className="p-4 rounded-2xl bg-white border border-purple-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-medium">Total Withdrawals</span>
            <ArrowUpRight className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900">
              {totalConsumed}
            </span>
            <span className="text-xs font-mono text-blue-600 font-bold">
              (${totalConsumed * 100})
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-purple-50 pt-1.5">
            <span>Consumer Status</span>
            <span className={`font-mono font-bold text-[10px] uppercase ${
              consumerState === 'RUNNING'
                ? 'text-blue-700'
                : consumerState === 'ATM EMPTY'
                ? 'text-rose-700'
                : 'text-slate-500'
            }`}>
              {consumerState}
            </span>
          </div>
        </div>
      </div>

      {/* Visual ATM Cash Storage Buffer (10 Slots Detailed Rack) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide font-mono">
            Shared ATM Buffer (10 Slots Detailed View)
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => addCash()}
              disabled={count >= capacity}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-all flex items-center gap-1 shadow-xs"
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Add Cash (+$100)</span>
            </button>
            <button
              onClick={() => withdrawCash()}
              disabled={count <= 0}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-all flex items-center gap-1 shadow-xs"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Withdraw Cash (-$100)</span>
            </button>
          </div>
        </div>

        <AtmSlotRack
          buffer={buffer}
          capacity={capacity}
          inPtr={inPtr}
          outPtr={outPtr}
          producerState={producerState}
          consumerState={consumerState}
        />
      </div>

      {/* Two Column: Live Recharts Area Chart and Recent Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Chart Card */}
        <div className="bg-white border border-purple-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-purple-100">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide font-mono">
                ATM Cash Level Over Time
              </h3>
              <p className="text-[11px] text-slate-500">
                Real-time tracking of occupied buffer slots (0 to 10 units)
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-purple-700">
              Capacity: {capacity} Units
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="purpleCashGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#94a3b8"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <YAxis
                  domain={[0, capacity]}
                  stroke="#94a3b8"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="bufferCount"
                  name="Cash Units"
                  stroke="#7c3aed"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#purpleCashGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-purple-50 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>Min: 0 units (Empty)</span>
            <span>Current: <strong>{count} units (${count * 100})</strong></span>
            <span>Max: 10 units (Full)</span>
          </div>
        </div>

        {/* Recent Activity Log */}
        <ActivityLogTable logs={logs} onClear={clearLogs} />
      </div>
    </div>
  );
};
