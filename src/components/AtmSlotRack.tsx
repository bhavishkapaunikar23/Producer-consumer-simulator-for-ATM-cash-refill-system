/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CashUnit } from '../types/osSimulation';
import { Banknote, ArrowDown, ArrowUp, Sparkles } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

interface AtmSlotRackProps {
  buffer: (CashUnit | null)[];
  capacity: number;
  inPtr: number;
  outPtr: number;
  producerState: string;
  consumerState: string;
}

export const AtmSlotRack: React.FC<AtmSlotRackProps> = ({
  buffer,
  capacity,
  inPtr,
  outPtr,
  producerState,
  consumerState,
}) => {
  const { activeSlotIndex, activeActionType } = useSimulation();

  const filledCount = buffer.filter((item) => item !== null).length;
  const availableCount = capacity - filledCount;

  return (
    <div className="bg-white border border-purple-200/80 rounded-2xl p-5 shadow-xs">
      {/* Header with buffer stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-purple-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-purple-950 uppercase tracking-wide font-mono">
              ATM Cash Storage Buffer
            </span>
            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {filledCount} / {capacity} Occupied ({availableCount} Available)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Bounded circular array of 10 cash storage units with synchronized <code className="text-purple-700 font-mono font-semibold">in</code> and <code className="text-purple-700 font-mono font-semibold">out</code> pointers.
          </p>
        </div>

        {/* Pointer Legend */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ArrowDown className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
            <span>in (Refill) = Slot #{inPtr}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
            <ArrowUp className="w-3.5 h-3.5 text-blue-600 animate-bounce" />
            <span>out (Dispense) = Slot #{outPtr}</span>
          </div>
        </div>
      </div>

      {/* 10 Cash Slots Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5">
        {Array.from({ length: capacity }).map((_, index) => {
          const unit = buffer[index];
          const isOccupied = unit !== null;
          const isInTarget = index === inPtr;
          const isOutTarget = index === outPtr;
          const isBeingProduced = (isInTarget && producerState === 'RUNNING') || (activeSlotIndex === index && activeActionType === 'PRODUCING');
          const isBeingConsumed = (isOutTarget && consumerState === 'RUNNING') || (activeSlotIndex === index && activeActionType === 'CONSUMING');

          return (
            <div
              key={index}
              className={`relative flex flex-col justify-between p-2.5 rounded-xl border transition-all duration-300 min-h-[120px] ${
                isBeingProduced
                  ? 'border-emerald-500 bg-emerald-100 shadow-lg ring-4 ring-emerald-300 scale-105 z-10'
                  : isBeingConsumed
                  ? 'border-blue-500 bg-blue-100 shadow-lg ring-4 ring-blue-300 scale-105 z-10'
                  : isOccupied
                  ? 'border-emerald-200 bg-gradient-to-b from-emerald-50/70 to-white shadow-xs'
                  : 'border-slate-200 bg-slate-50/60 border-dashed hover:border-purple-200'
              }`}
            >
              {/* Slot Index and Pointer Badges */}
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-mono text-slate-400 font-bold">
                  #{index}
                </span>

                <div className="flex items-center gap-1">
                  {isInTarget && (
                    <span
                      title="Next refill insertion slot"
                      className="flex items-center gap-0.5 px-1 py-0.2 text-[9px] font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 rounded shadow-xs"
                    >
                      <ArrowDown className="w-2.5 h-2.5 text-emerald-600 animate-bounce" />
                      IN
                    </span>
                  )}
                  {isOutTarget && (
                    <span
                      title="Next withdrawal extraction slot"
                      className="flex items-center gap-0.5 px-1 py-0.2 text-[9px] font-mono font-bold text-blue-800 bg-blue-100 border border-blue-300 rounded shadow-xs"
                    >
                      <ArrowUp className="w-2.5 h-2.5 text-blue-600 animate-bounce" />
                      OUT
                    </span>
                  )}
                </div>
              </div>

              {/* Slot Center: Cash Note or Empty */}
              <div className="my-1.5 flex flex-col items-center justify-center text-center">
                {isOccupied ? (
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <Banknote className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-extrabold font-mono text-emerald-900 mt-1">
                      $100
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 truncate max-w-[65px]">
                      {unit.serialNumber}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-1">
                    <div className="w-8 h-6 rounded border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                      <span className="text-[9px] font-mono font-semibold">EMPTY</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 font-medium">Free</span>
                  </div>
                )}
              </div>

              {/* Slot Footer */}
              <div className="text-[9px] font-mono text-center border-t border-slate-100 pt-1">
                {isOccupied ? (
                  <span className="text-emerald-700 font-bold">FILLED</span>
                ) : (
                  <span className="text-slate-400 font-medium">AVAILABLE</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
