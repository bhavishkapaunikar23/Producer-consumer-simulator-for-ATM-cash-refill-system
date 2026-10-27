/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import {
  Building2,
  Users,
  Banknote,
  Lock,
  Unlock,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  ShieldCheck,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';

export const LiveSimulationStage: React.FC = () => {
  const {
    count,
    capacity,
    inPtr,
    outPtr,
    emptySemaphore,
    fullSemaphore,
    mutex,
    producerState,
    consumerState,
    isRunning,
    simSpeed,
    setSimSpeed,
    activeLiveAction,
    activeSlotIndex,
    activeActionType,
    startSimulation,
    pauseSimulation,
    stepSimulation,
    resetSimulation,
    addCash,
    withdrawCash,
  } = useSimulation();

  const isFull = count >= capacity;
  const isEmpty = count <= 0;

  return (
    <div className="bg-gradient-to-b from-purple-900/10 via-white to-purple-50/40 border-2 border-purple-300 rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden">
      {/* Top Bar: Live Status & Speed Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-purple-200">
        <div className="flex items-center gap-3">
          {/* Live Pulsing Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-purple-200 shadow-xs">
            <span className="relative flex h-3 w-3">
              {isRunning && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isRunning ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
              ></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-purple-950 uppercase">
              {isRunning ? 'LIVE SIMULATION RUNNING' : 'SIMULATION PAUSED'}
            </span>
          </div>

          <span className="text-xs font-mono text-purple-700 hidden md:inline">
            Buffer: {count}/10 Units
          </span>
        </div>

        {/* Speed & Execution Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Speed Selector */}
          <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-purple-200 text-xs font-mono">
            <span className="text-[11px] text-slate-500 px-1.5">Speed:</span>
            <button
              onClick={() => setSimSpeed(2600)}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                simSpeed === 2600 ? 'bg-purple-600 text-white font-bold' : 'text-slate-600 hover:text-purple-900'
              }`}
            >
              Slow
            </button>
            <button
              onClick={() => setSimSpeed(1600)}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                simSpeed === 1600 ? 'bg-purple-600 text-white font-bold' : 'text-slate-600 hover:text-purple-900'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setSimSpeed(900)}
              className={`px-2 py-0.5 rounded-lg transition-colors ${
                simSpeed === 900 ? 'bg-purple-600 text-white font-bold' : 'text-slate-600 hover:text-purple-900'
              }`}
            >
              Fast ⚡
            </button>
          </div>

          {/* Start / Pause */}
          <button
            onClick={isRunning ? pauseSimulation : startSimulation}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Live</span>
              </>
            )}
          </button>

          {/* Step Button */}
          <button
            onClick={stepSimulation}
            disabled={isRunning}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white text-purple-700 border border-purple-200 hover:bg-purple-50 disabled:opacity-40 transition-colors flex items-center gap-1 shadow-xs"
            title="Execute one step"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Step</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={resetSimulation}
            className="p-1.5 rounded-xl bg-white text-slate-600 hover:text-slate-900 border border-purple-200 hover:bg-slate-50 transition-colors shadow-xs"
            title="Reset simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage: Bank (Left) -> Pipeline -> ATM Storage (Center) -> Pipeline -> Customer (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Left: Producer Section (Bank Refill Team) */}
        <div className={`md:col-span-3 p-4 rounded-2xl border text-center transition-all ${
          activeActionType === 'PRODUCING'
            ? 'border-emerald-500 bg-emerald-50/90 shadow-md ring-2 ring-emerald-400 scale-102'
            : 'border-purple-200 bg-white shadow-xs'
        }`}>
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-purple-100">
            <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase">
              PRODUCER
            </span>
            <span
              className={`text-[9px] font-mono px-2 py-0.2 rounded-full font-bold uppercase ${
                producerState === 'RUNNING'
                  ? 'bg-emerald-600 text-white animate-pulse'
                  : producerState === 'ATM FULL'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {producerState}
            </span>
          </div>

          <div className="my-2 relative">
            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center transition-all ${
              activeActionType === 'PRODUCING'
                ? 'bg-emerald-600 text-white shadow-md scale-110'
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              <Building2 className="w-7 h-7" />
            </div>

            {/* Traveling Cash Animation towards ATM */}
            {activeActionType === 'PRODUCING' && (
              <div className="absolute top-1/2 -right-4 -translate-y-1/2 translate-x-full hidden md:flex items-center gap-1 z-10 animate-bounce">
                <div className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-mono font-bold shadow-md flex items-center gap-1">
                  <Banknote className="w-3 h-3" />
                  <span>+$100</span>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600 font-bold" />
              </div>
            )}
          </div>

          <h3 className="text-xs font-extrabold text-slate-900 mt-1">
            Bank Refill Team
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Inserts at Slot #{inPtr}
          </p>

          <button
            onClick={() => addCash()}
            disabled={isFull}
            className="mt-3 w-full py-1.5 px-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center justify-center gap-1 shadow-xs disabled:opacity-40"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Cash</span>
          </button>
        </div>

        {/* Center: ATM Bounded Buffer Storage (10 Slots View & Mutex Beacon) */}
        <div className="md:col-span-6 bg-white border border-purple-200 rounded-2xl p-4 shadow-xs text-center space-y-3">
          {/* Invariant & Mutex Beacon */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-purple-100 text-xs">
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-slate-500 font-bold">ATM VAULT:</span>
              <span className="font-extrabold text-purple-900 text-sm">{count}/10 UNITS</span>
            </div>

            {/* Mutex Badge with live glowing state */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-xs font-bold transition-all ${
                mutex === 0
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 ring-2 ring-amber-300 animate-pulse'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}
            >
              {mutex === 0 ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>MUTEX: {mutex === 0 ? 'LOCKED (In Critical Section)' : 'AVAILABLE (1)'}</span>
            </div>
          </div>

          {/* Visual Mini 10-Slot Rack */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 py-1">
            {Array.from({ length: capacity }).map((_, idx) => {
              const isIn = idx === inPtr;
              const isOut = idx === outPtr;
              const isSlotActive = idx === activeSlotIndex;

              return (
                <div
                  key={idx}
                  className={`relative p-1.5 rounded-lg border text-center transition-all min-h-[56px] flex flex-col justify-between ${
                    isSlotActive
                      ? activeActionType === 'PRODUCING'
                        ? 'border-emerald-500 bg-emerald-100 shadow-md ring-2 ring-emerald-400 scale-105'
                        : 'border-blue-500 bg-blue-100 shadow-md ring-2 ring-blue-400 scale-105'
                      : idx < count
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200 bg-slate-50 text-slate-400 border-dashed'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <span className="text-slate-400 font-bold">#{idx}</span>
                    {isIn && <span className="text-emerald-700 font-extrabold text-[8px]">IN</span>}
                    {isOut && <span className="text-blue-700 font-extrabold text-[8px]">OUT</span>}
                  </div>

                  <div className="my-0.5">
                    {idx < count ? (
                      <Banknote className="w-3.5 h-3.5 mx-auto text-emerald-600" />
                    ) : (
                      <span className="text-[9px] font-mono text-slate-400">0</span>
                    )}
                  </div>

                  <span className="text-[8px] font-mono font-bold">
                    {idx < count ? '$100' : 'FREE'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Semaphore Equations strip */}
          <div className="flex items-center justify-around text-[11px] font-mono pt-1 text-slate-600 bg-purple-50/50 py-1.5 rounded-xl border border-purple-100">
            <span>Empty Sem = <strong className="text-emerald-700">{emptySemaphore}</strong></span>
            <span>·</span>
            <span>Full Sem = <strong className="text-blue-700">{fullSemaphore}</strong></span>
            <span>·</span>
            <span className="text-purple-800 font-bold">Empty + Full = 10</span>
          </div>
        </div>

        {/* Right: Consumer Section (ATM Customer) */}
        <div className={`md:col-span-3 p-4 rounded-2xl border text-center transition-all ${
          activeActionType === 'CONSUMING'
            ? 'border-blue-500 bg-blue-50/90 shadow-md ring-2 ring-blue-400 scale-102'
            : 'border-purple-200 bg-white shadow-xs'
        }`}>
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-purple-100">
            <span className="text-[10px] font-mono font-bold text-blue-800 uppercase">
              CONSUMER
            </span>
            <span
              className={`text-[9px] font-mono px-2 py-0.2 rounded-full font-bold uppercase ${
                consumerState === 'RUNNING'
                  ? 'bg-blue-600 text-white animate-pulse'
                  : consumerState === 'ATM EMPTY'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {consumerState}
            </span>
          </div>

          <div className="my-2 relative">
            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center transition-all ${
              activeActionType === 'CONSUMING'
                ? 'bg-blue-600 text-white shadow-md scale-110'
                : 'bg-blue-100 text-blue-700'
            }`}>
              <Users className="w-7 h-7" />
            </div>

            {/* Traveling Cash Animation towards Customer */}
            {activeActionType === 'CONSUMING' && (
              <div className="absolute top-1/2 -left-4 -translate-y-1/2 -translate-x-full hidden md:flex items-center gap-1 z-10 animate-bounce">
                <ArrowLeft className="w-4 h-4 text-blue-600 font-bold" />
                <div className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-mono font-bold shadow-md flex items-center gap-1">
                  <Banknote className="w-3 h-3" />
                  <span>-$100</span>
                </div>
              </div>
            )}
          </div>

          <h3 className="text-xs font-extrabold text-slate-900 mt-1">
            ATM Customer
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Withdraws from Slot #{outPtr}
          </p>

          <button
            onClick={() => withdrawCash()}
            disabled={isEmpty}
            className="mt-3 w-full py-1.5 px-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-1 shadow-xs disabled:opacity-40"
          >
            <MinusCircle className="w-3.5 h-3.5" />
            <span>Withdraw Cash</span>
          </button>
        </div>
      </div>

      {/* Real-Time Live Ticker Banner */}
      <div className="mt-4 p-3 rounded-2xl bg-white border border-purple-200 flex items-center gap-2.5 shadow-xs">
        <Zap className="w-4 h-4 text-purple-600 shrink-0 animate-pulse" />
        <span className="text-xs font-mono font-bold text-purple-950 truncate">
          {activeLiveAction}
        </span>
      </div>
    </div>
  );
};
