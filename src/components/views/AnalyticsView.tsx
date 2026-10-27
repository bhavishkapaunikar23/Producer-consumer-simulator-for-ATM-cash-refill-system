/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import {
  BarChart3,
  RotateCcw,
  TrendingUp,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Banknote,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const {
    capacity,
    count,
    totalProduced,
    totalConsumed,
    producerWaitCount,
    consumerWaitCount,
    history,
    resetAnalytics,
  } = useSimulation();

  const totalOps = totalProduced + totalConsumed;
  const utilization = Math.round((count / capacity) * 100);

  // Bar chart data comparing operations
  const barData = [
    {
      name: 'Cash Added (Refill)',
      count: totalProduced,
      dollars: totalProduced * 100,
    },
    {
      name: 'Cash Withdrawn',
      count: totalConsumed,
      dollars: totalConsumed * 100,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white border border-purple-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-700 font-bold mb-1">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <span>Process Metrics & Execution Telemetry</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            ATM Buffer Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time charts and quantitative metrics reflecting actual simulator operations.
          </p>
        </div>

        <button
          onClick={resetAnalytics}
          className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Analytics</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Operations */}
        <div className="p-4 rounded-2xl bg-white border border-purple-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Operations</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">
            {totalOps}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            {totalProduced} refills · {totalConsumed} withdrawals
          </div>
        </div>

        {/* Buffer Utilization */}
        <div className="p-4 rounded-2xl bg-white border border-purple-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Buffer Utilization</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-purple-700">
            {utilization}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            {count} / {capacity} slots occupied
          </div>
        </div>

        {/* Producer Waiting Counts */}
        <div className="p-4 rounded-2xl bg-white border border-purple-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Producer Waits</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-700">
            {producerWaitCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Blocked when ATM was FULL (10/10)
          </div>
        </div>

        {/* Consumer Waiting Counts */}
        <div className="p-4 rounded-2xl bg-white border border-purple-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Consumer Waits</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-rose-700">
            {consumerWaitCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Blocked when ATM was EMPTY (0/10)
          </div>
        </div>
      </div>

      {/* Two Live Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: ATM Cash Level Over Time */}
        <div className="bg-white border border-purple-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-purple-100">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide font-mono">
                ATM Cash Level Over Time
              </h3>
              <p className="text-[11px] text-slate-500">
                Occupied slots in ATM buffer (0 to 10 units)
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-purple-700">
              Capacity: {capacity} Units
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#purpleGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Cash Added vs Cash Withdrawn */}
        <div className="bg-white border border-purple-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-purple-100">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide font-mono">
                Cash Added vs Cash Withdrawn
              </h3>
              <p className="text-[11px] text-slate-500">
                Comparison of producer deposits and consumer withdrawals
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-700">
              Ratio: {totalConsumed > 0 ? (totalProduced / totalConsumed).toFixed(2) : totalProduced} : 1
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
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
                <Bar
                  dataKey="count"
                  name="Total Operations"
                  fill="#7c3aed"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
