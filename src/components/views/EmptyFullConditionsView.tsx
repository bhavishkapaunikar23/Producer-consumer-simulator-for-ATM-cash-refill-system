/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { AtmSlotRack } from '../AtmSlotRack';
import {
  AlertOctagon,
  RotateCcw,
  PlusCircle,
  MinusCircle,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

export const EmptyFullConditionsView: React.FC = () => {
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
    forceDrain,
    forceFill,
    addCash,
    withdrawCash,
    resetSimulation,
  } = useSimulation();

  const [feedback, setFeedback] = useState<{
    type: 'BLOCKED' | 'SUCCESS';
    title: string;
    description: string;
  } | null>(null);

  const isFull = count >= capacity;
  const isEmpty = count <= 0;

  const tryAddCash = () => {
    if (isFull) {
      setFeedback({
        type: 'BLOCKED',
        title: 'PRODUCER BLOCKED: ATM Buffer is Full!',
        description:
          'Buffer count is 10/10 (empty = 0). The OS kernel puts the Bank Refill Team thread into the sleep queue on sem_wait(&empty). Overflow prevented!',
      });
    } else {
      addCash();
      setFeedback({
        type: 'SUCCESS',
        title: 'Cash Unit Added',
        description: `Refilled $100 note. Current buffer occupancy is ${count + 1}/10.`,
      });
    }
  };

  const tryWithdrawCash = () => {
    if (isEmpty) {
      setFeedback({
        type: 'BLOCKED',
        title: 'CONSUMER BLOCKED: ATM Buffer is Empty!',
        description:
          'Buffer count is 0/10 (full = 0). The OS kernel puts the Customer thread into the sleep queue on sem_wait(&full). Underflow prevented!',
      });
    } else {
      withdrawCash();
      setFeedback({
        type: 'SUCCESS',
        title: 'Cash Unit Withdrawn',
        description: `Withdrew $100 note. Current buffer occupancy is ${count - 1}/10.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white border border-purple-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono text-purple-700 font-bold mb-1">
          <AlertOctagon className="w-4 h-4 text-purple-600" />
          <span>Boundary Value Handling & Process Blocking</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Empty & Full Conditions Lab
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Demonstrates how semaphores prevent buffer overflow and underflow by suspending calling threads when capacity boundaries are hit.
        </p>

        {/* Quick Actions to trigger conditions */}
        <div className="flex items-center gap-2.5 mt-5 flex-wrap">
          <button
            onClick={() => {
              forceDrain();
              setFeedback(null);
            }}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-100 text-blue-900 hover:bg-blue-200 border border-blue-200 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Ban className="w-3.5 h-3.5 text-blue-700" />
            <span>Demonstrate ATM Empty (0/10 units)</span>
          </button>

          <button
            onClick={() => {
              forceFill();
              setFeedback(null);
            }}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-200 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
            <span>Demonstrate ATM Full (10/10 units)</span>
          </button>

          <button
            onClick={() => {
              resetSimulation();
              setFeedback(null);
            }}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Initial State</span>
          </button>
        </div>
      </div>

      {/* Real-time Operation Result Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
            feedback.type === 'BLOCKED'
              ? 'bg-rose-50 border-rose-200 text-rose-950'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}
        >
          {feedback.type === 'BLOCKED' ? (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <div>
            <h4 className="text-xs font-bold font-mono uppercase tracking-wide">
              {feedback.title}
            </h4>
            <p className="text-xs mt-0.5 leading-relaxed font-mono">
              {feedback.description}
            </p>
          </div>
        </div>
      )}

      {/* Visual ATM Cash Storage Rack */}
      <AtmSlotRack
        buffer={buffer}
        capacity={capacity}
        inPtr={inPtr}
        outPtr={outPtr}
        producerState={producerState}
        consumerState={consumerState}
      />

      {/* Two Visual Cards: ATM Empty vs ATM Full */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: ATM Empty Condition */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isEmpty
              ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-300 shadow-sm'
              : 'bg-white border-purple-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Ban className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono">
                Condition 1: ATM Empty
              </h3>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                isEmpty
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {isEmpty ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>

          {/* Condition Display Banner */}
          {isEmpty && (
            <div className="p-3 mb-3 rounded-xl bg-blue-600 text-white text-xs font-bold font-mono tracking-wide">
              ATM EMPTY — Consumer Waiting
            </div>
          )}

          <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
            <p>
              <strong>Trigger:</strong> Cash count is <strong>zero</strong> (<code className="font-mono text-blue-700">full == 0</code>).
            </p>
            <p>
              <strong>Behavior:</strong> Withdrawal action is completely <strong>blocked</strong>. When a customer calls <code className="font-mono text-blue-700">sem_wait(&full)</code>, the thread is placed on the waiting queue until the bank refills cash.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] space-y-1">
              <div>// Customer withdrawal attempt:</div>
              <div className="text-amber-400">sem_wait(&full); // &lt;-- BLOCKED (full == 0)</div>
              <div className="text-slate-500">// Cannot enter critical section</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-100">
            <button
              onClick={tryWithdrawCash}
              className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <MinusCircle className="w-3.5 h-3.5" />
              <span>Test Customer Withdrawal Action</span>
            </button>
            <p className="text-[10px] text-slate-500 text-center mt-1 font-mono">
              {isEmpty ? 'Clicking demonstrates that withdrawal is safely blocked.' : 'Click to withdraw one unit.'}
            </p>
          </div>
        </div>

        {/* Card 2: ATM Full Condition */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isFull
              ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-300 shadow-sm'
              : 'bg-white border-purple-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono">
                Condition 2: ATM Full
              </h3>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                isFull
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {isFull ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>

          {/* Condition Display Banner */}
          {isFull && (
            <div className="p-3 mb-3 rounded-xl bg-amber-600 text-white text-xs font-bold font-mono tracking-wide">
              ATM FULL — Producer Waiting
            </div>
          )}

          <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
            <p>
              <strong>Trigger:</strong> Cash count equals <strong>10</strong> (<code className="font-mono text-emerald-700">empty == 0</code>).
            </p>
            <p>
              <strong>Behavior:</strong> Add cash action is completely <strong>blocked</strong>. When the bank refill team calls <code className="font-mono text-emerald-700">sem_wait(&empty)</code>, the thread is suspended until a customer frees up a slot.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] space-y-1">
              <div>// Bank refill attempt:</div>
              <div className="text-amber-400">sem_wait(&empty); // &lt;-- BLOCKED (empty == 0)</div>
              <div className="text-slate-500">// Cannot enter critical section</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-100">
            <button
              onClick={tryAddCash}
              className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Test Bank Cash Refill Action</span>
            </button>
            <p className="text-[10px] text-slate-500 text-center mt-1 font-mono">
              {isFull ? 'Clicking demonstrates that cash addition is safely blocked.' : 'Click to add one cash unit.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
