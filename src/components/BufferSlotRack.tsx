/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CashUnit } from '../types/osSimulation';
import { Banknote, ArrowDown, ArrowUp } from 'lucide-react';

interface BufferSlotRackProps {
  buffer: (CashUnit | null)[];
  capacity: number;
  inPtr: number;
  outPtr: number;
  producerState: string;
  consumerState: string;
}

export const BufferSlotRack: React.FC<BufferSlotRackProps> = ({
  buffer,
  capacity,
  inPtr,
  outPtr,
  producerState,
  consumerState,
}) => {
  return (
    <div className="bg-[#0b132b]/80 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-200 tracking-wide uppercase font-mono">
              Shared Memory Buffer
            </span>
            <span className="text-xs text-slate-400 font-mono">
              (ATM Bounded Storage)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Circular array buffer with <code className="text-teal-400 font-mono">in</code> and <code className="text-cyan-400 font-mono">out</code> pointers
          </p>
        </div>

        {/* Pointer Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-teal-400">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-teal-500/30 border border-teal-400"></span>
            <span>in (Refill) = Slot #{inPtr}</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-cyan-500/30 border border-cyan-400"></span>
            <span>out (Dispense) = Slot #{outPtr}</span>
          </div>
        </div>
      </div>

      {/* Slots Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3">
        {Array.from({ length: capacity }).map((_, index) => {
          const unit = buffer[index];
          const isOccupied = unit !== null;
          const isInTarget = index === inPtr;
          const isOutTarget = index === outPtr;
          const isBeingProduced = isInTarget && producerState === 'PRODUCING';
          const isBeingConsumed = isOutTarget && consumerState === 'CONSUMING';

          return (
            <div
              key={index}
              className={`relative flex flex-col justify-between p-2.5 rounded-lg border transition-all duration-300 min-h-[110px] ${
                isBeingProduced
                  ? 'border-teal-400 bg-teal-950/40 shadow-lg shadow-teal-500/20 scale-102'
                  : isBeingConsumed
                  ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/20 scale-102'
                  : isOccupied
                  ? 'border-emerald-600/50 bg-gradient-to-b from-emerald-950/30 to-slate-900/80 shadow-md'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
              }`}
            >
              {/* Pointer indicators at top */}
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-mono text-slate-500 font-medium">
                  #{index}
                </span>

                <div className="flex items-center gap-1">
                  {isInTarget && (
                    <span
                      title="Next Producer insertion slot"
                      className="flex items-center gap-0.5 px-1 py-0.2 text-[9px] font-mono text-teal-300 bg-teal-950/80 border border-teal-500/60 rounded"
                    >
                      <ArrowDown className="w-2.5 h-2.5 text-teal-400 animate-bounce" />
                      IN
                    </span>
                  )}
                  {isOutTarget && (
                    <span
                      title="Next Consumer withdrawal slot"
                      className="flex items-center gap-0.5 px-1 py-0.2 text-[9px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-500/60 rounded"
                    >
                      <ArrowUp className="w-2.5 h-2.5 text-cyan-400 animate-bounce" />
                      OUT
                    </span>
                  )}
                </div>
              </div>

              {/* Center slot state */}
              <div className="my-1.5 flex flex-col items-center justify-center text-center">
                {isOccupied ? (
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-7 rounded bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
                      <Banknote className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-xs font-bold font-mono text-emerald-300 mt-1">
                      $100
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 truncate max-w-[70px]">
                      {unit.serialNumber.replace('ATM-', '')}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-1">
                    <div className="w-8 h-6 rounded border border-dashed border-slate-700 flex items-center justify-center text-slate-600">
                      <span className="text-[10px] font-mono">EMPTY</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">Available</span>
                  </div>
                )}
              </div>

              {/* Slot status footer */}
              <div className="text-[9px] font-mono text-center text-slate-500 border-t border-slate-800/60 pt-1">
                {isOccupied ? (
                  <span className="text-emerald-400 font-medium">OCCUPIED</span>
                ) : (
                  <span>FREE</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
