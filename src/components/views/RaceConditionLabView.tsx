/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  GitFork,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  User,
  Clock,
  ShieldCheck,
  Ban,
} from 'lucide-react';

interface RaceStep {
  stepNum: number;
  actor: 'CUSTOMER_A' | 'CUSTOMER_B' | 'SYSTEM';
  description: string;
  localRegA: string;
  localRegB: string;
  balance: number;
  isAnomaly?: boolean;
}

export const RaceConditionLabView: React.FC = () => {
  const [mode, setMode] = useState<'WITHOUT_MUTEX' | 'WITH_MUTEX'>('WITHOUT_MUTEX');
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const initialBalance = 1000;
  const withdrawAmount = 300;

  const unsynchronizedSteps: RaceStep[] = [
    {
      stepNum: 0,
      actor: 'SYSTEM',
      description: 'Initial State: ATM shared balance is $1,000. Customer A and Customer B both submit $300 withdrawal requests.',
      localRegA: '—',
      localRegB: '—',
      balance: 1000,
    },
    {
      stepNum: 1,
      actor: 'CUSTOMER_A',
      description: 'Customer A reads shared balance ($1,000) into Local CPU Register A.',
      localRegA: '$1,000',
      localRegB: '—',
      balance: 1000,
    },
    {
      stepNum: 2,
      actor: 'SYSTEM',
      description: '⚡ Context Switch! CPU preempts Customer A before write-back occurs.',
      localRegA: '$1,000',
      localRegB: '—',
      balance: 1000,
      isAnomaly: true,
    },
    {
      stepNum: 3,
      actor: 'CUSTOMER_B',
      description: 'Customer B preempts: reads shared balance ($1,000) into Local CPU Register B.',
      localRegA: '$1,000',
      localRegB: '$1,000',
      balance: 1000,
      isAnomaly: true,
    },
    {
      stepNum: 4,
      actor: 'CUSTOMER_B',
      description: 'Customer B calculates $1,000 - $300 = $700 and writes $700 into shared memory.',
      localRegA: '$1,000',
      localRegB: '$700',
      balance: 700,
    },
    {
      stepNum: 5,
      actor: 'SYSTEM',
      description: '⚡ Context Switch back to Customer A.',
      localRegA: '$1,000',
      localRegB: '$700',
      balance: 700,
    },
    {
      stepNum: 6,
      actor: 'CUSTOMER_A',
      description: 'Customer A resumes with stale register value ($1,000), computes $1,000 - $300 = $700, and overwrites shared memory!',
      localRegA: '$700',
      localRegB: '$700',
      balance: 700,
      isAnomaly: true,
    },
    {
      stepNum: 7,
      actor: 'SYSTEM',
      description: '🚨 RACE CONDITION: Customer B\'s withdrawal was LOST! Two customers withdrew $300 ($600 total), but the balance only dropped by $300!',
      localRegA: '$700',
      localRegB: '$700',
      balance: 700,
      isAnomaly: true,
    },
  ];

  const synchronizedSteps: RaceStep[] = [
    {
      stepNum: 0,
      actor: 'SYSTEM',
      description: 'Initial State: ATM shared balance is $1,000. Mutex lock = 1 (Available).',
      localRegA: '—',
      localRegB: '—',
      balance: 1000,
    },
    {
      stepNum: 1,
      actor: 'CUSTOMER_A',
      description: 'Customer A calls pthread_mutex_lock(&mutex). Lock acquired (mutex = 0). Enters Critical Section.',
      localRegA: '$1,000',
      localRegB: '—',
      balance: 1000,
    },
    {
      stepNum: 2,
      actor: 'CUSTOMER_B',
      description: 'Customer B attempts to acquire mutex. Mutex is locked! OS puts Customer B in waiting queue.',
      localRegA: '$1,000',
      localRegB: 'BLOCKED',
      balance: 1000,
    },
    {
      stepNum: 3,
      actor: 'CUSTOMER_A',
      description: 'Customer A completes withdrawal: balance = $1,000 - $300 = $700.',
      localRegA: '$700',
      localRegB: 'BLOCKED',
      balance: 700,
    },
    {
      stepNum: 4,
      actor: 'CUSTOMER_A',
      description: 'Customer A exits Critical Section: pthread_mutex_unlock(&mutex). Mutex restored to 1.',
      localRegA: '$700 (Done)',
      localRegB: 'BLOCKED',
      balance: 700,
    },
    {
      stepNum: 5,
      actor: 'CUSTOMER_B',
      description: 'OS wakes Customer B. Customer B acquires Mutex (mutex = 0) and enters Critical Section.',
      localRegA: '$700 (Done)',
      localRegB: '—',
      balance: 700,
    },
    {
      stepNum: 6,
      actor: 'CUSTOMER_B',
      description: 'Customer B reads updated balance ($700), computes $700 - $300 = $400, and writes $400.',
      localRegA: '$700 (Done)',
      localRegB: '$400',
      balance: 400,
    },
    {
      stepNum: 7,
      actor: 'CUSTOMER_B',
      description: 'Customer B exits Critical Section: pthread_mutex_unlock(&mutex). Mutex restored to 1.',
      localRegA: '$700 (Done)',
      localRegB: '$400 (Done)',
      balance: 400,
    },
    {
      stepNum: 8,
      actor: 'SYSTEM',
      description: '✅ SYNCHRONIZATION SUCCESS: Both withdrawals processed sequentially. Final balance is correctly $400.',
      localRegA: '$700 (Done)',
      localRegB: '$400 (Done)',
      balance: 400,
    },
  ];

  const currentTimeline = mode === 'WITHOUT_MUTEX' ? unsynchronizedSteps : synchronizedSteps;
  const currentStep = currentTimeline[Math.min(currentStepIdx, currentTimeline.length - 1)];

  const startTest = () => {
    setIsPlaying(true);
    if (currentStepIdx >= currentTimeline.length - 1) {
      setCurrentStepIdx(0);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentStepIdx(0);
  };

  useEffect(() => {
    if (!isPlaying) return;

    timerRef.current = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev < currentTimeline.length - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, 1400);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentTimeline.length]);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white border border-purple-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono text-purple-700 font-bold mb-1">
          <GitFork className="w-4 h-4 text-purple-600" />
          <span>Concurrent Process Anomaly Demonstration</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Race Condition Demonstration
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
          Observe how two customers trying to withdraw $300 simultaneously from the same shared ATM account ($1,000) causes a <strong>Lost Update</strong> bug without a Mutex, and how Mutex serialization guarantees the correct result.
        </p>

        {/* Mode Selector and Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-5 pt-4 border-t border-purple-100">
          <div className="flex items-center gap-1 p-1 bg-purple-50/70 rounded-xl border border-purple-200 text-xs">
            <button
              onClick={() => {
                setMode('WITHOUT_MUTEX');
                handleReset();
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                mode === 'WITHOUT_MUTEX'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Without Mutex (Race Condition)
            </button>
            <button
              onClick={() => {
                setMode('WITH_MUTEX');
                handleReset();
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                mode === 'WITH_MUTEX'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              With Mutex Lock (Synchronized)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={startTest}
              disabled={isPlaying}
              className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm ${
                isPlaying
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : mode === 'WITHOUT_MUTEX'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                  : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isPlaying ? 'Running Test...' : 'Start Race Test'}</span>
            </button>

            <button
              onClick={() => setCurrentStepIdx((p) => Math.min(p + 1, currentTimeline.length - 1))}
              disabled={isPlaying || currentStepIdx >= currentTimeline.length - 1}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 disabled:opacity-40 transition-colors"
            >
              Step &gt;
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors"
              title="Reset Test"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Balance & Customer Status Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Customer A Card */}
        <div className="p-5 rounded-2xl bg-white border border-purple-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Customer A</h3>
                  <span className="text-[10px] text-slate-500 font-mono">Thread 1</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Withdraw $300
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Local CPU Register A:</span>
                <span className="font-mono font-bold text-emerald-800 text-sm">
                  {currentStep.localRegA}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                {currentStep.actor === 'CUSTOMER_A' ? (
                  <strong className="text-emerald-700 font-mono">Active thread executing operation</strong>
                ) : (
                  <span>Idle / Waiting</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Central Shared ATM Balance */}
        <div
          className={`p-5 rounded-2xl border text-center shadow-xs flex flex-col justify-between transition-all ${
            currentStep.isAnomaly
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-300'
              : mode === 'WITH_MUTEX' && currentStep.balance === 400
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-300'
              : 'bg-white border-purple-200/80'
          }`}
        >
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              Shared ATM Memory: <code className="text-purple-800">atmBalance</code>
            </span>
            <div className="my-2">
              <span className="text-4xl font-black font-mono text-slate-900">
                ${currentStep.balance}
              </span>
            </div>
            <div className="text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
              <span>Start: ${initialBalance}</span>
              <span>·</span>
              <span>Total Withdrawn: ${withdrawAmount * 2}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-purple-100 text-xs font-mono">
            {mode === 'WITHOUT_MUTEX' && currentStepIdx === currentTimeline.length - 1 ? (
              <span className="text-rose-700 font-bold">
                LOST UPDATE: Final balance is ${currentStep.balance} instead of $400!
              </span>
            ) : mode === 'WITH_MUTEX' && currentStepIdx === currentTimeline.length - 1 ? (
              <span className="text-emerald-700 font-bold">
                CORRECT BALANCE: Final balance is $400 ($1000 - $300 - $300).
              </span>
            ) : (
              <span className="text-slate-500">
                Step {currentStepIdx + 1} of {currentTimeline.length}
              </span>
            )}
          </div>
        </div>

        {/* Customer B Card */}
        <div className="p-5 rounded-2xl bg-white border border-purple-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Customer B</h3>
                  <span className="text-[10px] text-slate-500 font-mono">Thread 2</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Withdraw $300
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Local CPU Register B:</span>
                <span className="font-mono font-bold text-blue-800 text-sm">
                  {currentStep.localRegB}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                {currentStep.actor === 'CUSTOMER_B' ? (
                  <strong className="text-blue-700 font-mono">Active thread executing operation</strong>
                ) : (
                  <span>Idle / Blocked on Mutex</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Log Timeline */}
      <div className="bg-white border border-purple-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-700" />
            <h3 className="text-xs font-bold text-purple-950 uppercase tracking-wide font-mono">
              Thread Execution Timeline & Interleaving Log
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {mode === 'WITHOUT_MUTEX' ? 'UNSYNCHRONIZED INTERLEAVED EXECUTION' : 'MUTEX ATOMIC SERIALIZATION'}
          </span>
        </div>

        <div className="space-y-2">
          {currentTimeline.map((step, idx) => {
            const isCurrent = idx === currentStepIdx;
            const isPast = idx < currentStepIdx;

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  isCurrent
                    ? step.isAnomaly
                      ? 'border-rose-400 bg-rose-50 text-rose-950 font-medium ring-2 ring-rose-300'
                      : 'border-purple-400 bg-purple-50 text-purple-950 font-medium ring-2 ring-purple-300'
                    : isPast
                    ? 'border-slate-200 bg-slate-50/60 text-slate-600'
                    : 'border-slate-100 bg-slate-50/30 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 shrink-0">
                    Step {idx}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      step.actor === 'CUSTOMER_A'
                        ? 'bg-emerald-100 text-emerald-800'
                        : step.actor === 'CUSTOMER_B'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {step.actor}
                  </span>
                  <span className="font-sans leading-snug">
                    {step.description}
                  </span>
                </div>

                <div className="font-mono text-xs font-bold shrink-0 text-slate-800 ml-auto sm:ml-0">
                  Balance: ${step.balance}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
