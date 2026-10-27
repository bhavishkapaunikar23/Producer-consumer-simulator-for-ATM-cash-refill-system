/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ProcessId,
  ProcessItem,
  BufferSlot,
  WaitingProcess,
  ScenarioType,
  LogEntry,
} from '../types/semaphore';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  PlusCircle,
  MinusCircle,
  Lock,
  Unlock,
  Layers,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Terminal,
  Trash2,
  Code2,
  Info,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const SemaphoreSimulator: React.FC = () => {
  // Constants
  const BUFFER_CAPACITY = 5;

  // Semaphores
  const [mutex, setMutex] = useState<number>(1); // 1 = available, 0 = locked
  const [emptySemaphore, setEmptySemaphore] = useState<number>(3); // 5 - initial count
  const [fullSemaphore, setFullSemaphore] = useState<number>(2); // initial count

  // Circular buffer pointers
  const [inPtr, setInPtr] = useState<number>(2);
  const [outPtr, setOutPtr] = useState<number>(0);

  // Buffer state: 5 fixed slots
  const [buffer, setBuffer] = useState<BufferSlot[]>([
    {
      index: 0,
      isFilled: true,
      item: { id: 1, label: 'Data #1', producedBy: 'P1', timestamp: '10:00:01' },
    },
    {
      index: 1,
      isFilled: true,
      item: { id: 2, label: 'Data #2', producedBy: 'P2', timestamp: '10:00:02' },
    },
    { index: 2, isFilled: false, item: null },
    { index: 3, isFilled: false, item: null },
    { index: 4, isFilled: false, item: null },
  ]);

  // Producers: P1, P2, P3 (Green)
  const [producers, setProducers] = useState<ProcessItem[]>([
    { id: 'P1', name: 'Producer 1', type: 'PRODUCER', state: 'READY', color: 'green', itemsHandled: 1 },
    { id: 'P2', name: 'Producer 2', type: 'PRODUCER', state: 'READY', color: 'green', itemsHandled: 1 },
    { id: 'P3', name: 'Producer 3', type: 'PRODUCER', state: 'READY', color: 'green', itemsHandled: 0 },
  ]);

  // Consumers: C1, C2, C3 (Blue)
  const [consumers, setConsumers] = useState<ProcessItem[]>([
    { id: 'C1', name: 'Consumer 1', type: 'CONSUMER', state: 'READY', color: 'blue', itemsHandled: 0 },
    { id: 'C2', name: 'Consumer 2', type: 'CONSUMER', state: 'READY', color: 'blue', itemsHandled: 0 },
    { id: 'C3', name: 'Consumer 3', type: 'CONSUMER', state: 'READY', color: 'blue', itemsHandled: 0 },
  ]);

  // Waiting Queue for blocked processes
  const [waitingQueue, setWaitingQueue] = useState<WaitingProcess[]>([]);

  // Controls & Run State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [scenario, setScenario] = useState<ScenarioType>('balanced');
  const [activeActionMsg, setActiveActionMsg] = useState<string | null>(null);
  const [currentCriticalProcess, setCurrentCriticalProcess] = useState<ProcessId | null>(null);

  // Item ID counter & process cycle indices
  const itemIdCounterRef = useRef<number>(3);
  const nextProducerIndexRef = useRef<number>(0); // 0 = P1, 1 = P2, 2 = P3
  const nextConsumerIndexRef = useRef<number>(0); // 0 = C1, 1 = C2, 2 = C3
  const stepTurnRef = useRef<'PRODUCE' | 'CONSUME'>('PRODUCE');

  // Activity Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-init',
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      actor: 'SYSTEM',
      actorType: 'SYSTEM',
      action: 'RESET',
      message: 'Simulator initialized with 5 buffer slots (2 filled, 3 empty). Mutex = 1.',
      semaphores: { empty: 3, full: 2, mutex: 1 },
    },
  ]);

  const [logFilter, setLogFilter] = useState<'ALL' | 'PRODUCERS' | 'CONSUMERS' | 'WAITING'>('ALL');

  // Helper to append log
  const addLog = useCallback(
    (
      actor: ProcessId | 'SYSTEM',
      actorType: 'PRODUCER' | 'CONSUMER' | 'SYSTEM',
      action: LogEntry['action'],
      message: string,
      emptyVal: number,
      fullVal: number,
      mutexVal: number
    ) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour12: false });
      const newEntry: LogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: timeStr,
        actor,
        actorType,
        action,
        message,
        semaphores: { empty: emptyVal, full: fullVal, mutex: mutexVal },
      };
      setLogs((prev) => [newEntry, ...prev.slice(0, 79)]);
    },
    []
  );

  // Execute Produce Operation
  const produceItem = useCallback(
    (forcedProducerId?: ProcessId): boolean => {
      // Pick producer in round-robin: P1 -> P2 -> P3
      const producerList: ProcessId[] = ['P1', 'P2', 'P3'];
      const pId = forcedProducerId || producerList[nextProducerIndexRef.current % 3];
      if (!forcedProducerId) {
        nextProducerIndexRef.current = (nextProducerIndexRef.current + 1) % 3;
      }

      // Check Empty Semaphore: If empty == 0, buffer is full -> PRODUCER WAITS
      if (emptySemaphore <= 0) {
        setProducers((prev) =>
          prev.map((p) => (p.id === pId ? { ...p, state: 'BLOCKED' } : p))
        );

        // Add to waiting queue if not already there
        setWaitingQueue((prev) => {
          if (prev.some((w) => w.id === pId)) return prev;
          return [
            ...prev,
            {
              id: pId,
              name: pId === 'P1' ? 'Producer 1' : pId === 'P2' ? 'Producer 2' : 'Producer 3',
              type: 'PRODUCER',
              reason: 'BUFFER_FULL',
              enqueuedAt: new Date().toLocaleTimeString([], { hour12: false }),
            },
          ];
        });

        setActiveActionMsg(`${pId} BLOCKED: Buffer is FULL (empty = 0). Process placed in waiting queue.`);
        addLog(
          pId,
          'PRODUCER',
          'WAIT',
          `${pId} is WAITING because the buffer is full (empty = 0). wait(empty) suspended.`,
          0,
          BUFFER_CAPACITY,
          mutex
        );
        return false;
      }

      // Step 1: Decrement empty semaphore (wait(empty))
      const newEmpty = emptySemaphore - 1;
      setEmptySemaphore(newEmpty);

      // Step 2: Acquire Mutex (wait(mutex))
      setMutex(0);
      setCurrentCriticalProcess(pId);
      setProducers((prev) =>
        prev.map((p) => (p.id === pId ? { ...p, state: 'RUNNING' } : p))
      );

      // Step 3: Insert item into buffer[inPtr]
      const itemId = itemIdCounterRef.current++;
      const newItem = {
        id: itemId,
        label: `Item #${itemId}`,
        producedBy: pId,
        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      };

      const targetSlot = inPtr;
      const nextIn = (inPtr + 1) % BUFFER_CAPACITY;
      const newFull = fullSemaphore + 1;

      // Update buffer
      setBuffer((prev) => {
        const next = [...prev];
        next[targetSlot] = {
          index: targetSlot,
          isFilled: true,
          item: newItem,
        };
        return next;
      });

      setInPtr(nextIn);
      setFullSemaphore(newFull);

      // Step 4 & 5: Release Mutex (signal(mutex)) and Signal Full (signal(full))
      setMutex(1);
      setCurrentCriticalProcess(null);

      setProducers((prev) =>
        prev.map((p) =>
          p.id === pId
            ? { ...p, state: 'READY', itemsHandled: p.itemsHandled + 1, lastAction: `Produced ${newItem.label}` }
            : p
        )
      );

      // Check if any Consumer was waiting in queue and wake them up!
      setWaitingQueue((prev) => {
        const waitingConsumer = prev.find((w) => w.type === 'CONSUMER');
        if (waitingConsumer) {
          // Unblock consumer state
          setConsumers((cList) =>
            cList.map((c) => (c.id === waitingConsumer.id ? { ...c, state: 'READY' } : c))
          );
          return prev.filter((w) => w.id !== waitingConsumer.id);
        }
        return prev;
      });

      setActiveActionMsg(`${pId} produced ${newItem.label} into Slot ${targetSlot}. Mutex released.`);
      addLog(
        pId,
        'PRODUCER',
        'PRODUCE',
        `${pId} produced ${newItem.label} into Slot ${targetSlot}. signal(full) awakened consumers.`,
        newEmpty,
        newFull,
        1
      );

      return true;
    },
    [emptySemaphore, fullSemaphore, inPtr, mutex, addLog]
  );

  // Execute Consume Operation
  const consumeItem = useCallback(
    (forcedConsumerId?: ProcessId): boolean => {
      // Pick consumer in round-robin: C1 -> C2 -> C3
      const consumerList: ProcessId[] = ['C1', 'C2', 'C3'];
      const cId = forcedConsumerId || consumerList[nextConsumerIndexRef.current % 3];
      if (!forcedConsumerId) {
        nextConsumerIndexRef.current = (nextConsumerIndexRef.current + 1) % 3;
      }

      // Check Full Semaphore: If full == 0, buffer is empty -> CONSUMER WAITS
      if (fullSemaphore <= 0) {
        setConsumers((prev) =>
          prev.map((c) => (c.id === cId ? { ...c, state: 'BLOCKED' } : c))
        );

        // Add to waiting queue if not already there
        setWaitingQueue((prev) => {
          if (prev.some((w) => w.id === cId)) return prev;
          return [
            ...prev,
            {
              id: cId,
              name: cId === 'C1' ? 'Consumer 1' : cId === 'C2' ? 'Consumer 2' : 'Consumer 3',
              type: 'CONSUMER',
              reason: 'BUFFER_EMPTY',
              enqueuedAt: new Date().toLocaleTimeString([], { hour12: false }),
            },
          ];
        });

        setActiveActionMsg(`${cId} BLOCKED: Buffer is EMPTY (full = 0). Process placed in waiting queue.`);
        addLog(
          cId,
          'CONSUMER',
          'WAIT',
          `${cId} is WAITING because the buffer is empty (full = 0). wait(full) suspended.`,
          BUFFER_CAPACITY,
          0,
          mutex
        );
        return false;
      }

      // Step 1: Decrement full semaphore (wait(full))
      const newFull = fullSemaphore - 1;
      setFullSemaphore(newFull);

      // Step 2: Acquire Mutex (wait(mutex))
      setMutex(0);
      setCurrentCriticalProcess(cId);
      setConsumers((prev) =>
        prev.map((c) => (c.id === cId ? { ...c, state: 'RUNNING' } : c))
      );

      // Step 3: Remove item from buffer[outPtr]
      const targetSlot = outPtr;
      const consumedSlot = buffer[targetSlot];
      const itemLabel = consumedSlot.item ? consumedSlot.item.label : `Item at Slot ${targetSlot}`;

      const nextOut = (outPtr + 1) % BUFFER_CAPACITY;
      const newEmpty = emptySemaphore + 1;

      // Update buffer
      setBuffer((prev) => {
        const next = [...prev];
        next[targetSlot] = {
          index: targetSlot,
          isFilled: false,
          item: null,
        };
        return next;
      });

      setOutPtr(nextOut);
      setEmptySemaphore(newEmpty);

      // Step 4 & 5: Release Mutex (signal(mutex)) and Signal Empty (signal(empty))
      setMutex(1);
      setCurrentCriticalProcess(null);

      setConsumers((prev) =>
        prev.map((c) =>
          c.id === cId
            ? { ...c, state: 'READY', itemsHandled: c.itemsHandled + 1, lastAction: `Consumed ${itemLabel}` }
            : c
        )
      );

      // Check if any Producer was waiting in queue and wake them up!
      setWaitingQueue((prev) => {
        const waitingProducer = prev.find((w) => w.type === 'PRODUCER');
        if (waitingProducer) {
          setProducers((pList) =>
            pList.map((p) => (p.id === waitingProducer.id ? { ...p, state: 'READY' } : p))
          );
          return prev.filter((w) => w.id !== waitingProducer.id);
        }
        return prev;
      });

      setActiveActionMsg(`${cId} consumed ${itemLabel} from Slot ${targetSlot}. Mutex released.`);
      addLog(
        cId,
        'CONSUMER',
        'CONSUME',
        `${cId} consumed ${itemLabel} from Slot ${targetSlot}. signal(empty) awakened producers.`,
        newEmpty,
        newFull,
        1
      );

      return true;
    },
    [buffer, emptySemaphore, fullSemaphore, mutex, outPtr, addLog]
  );

  // Single Step execution
  const executeStep = useCallback(() => {
    // If processes are waiting in queue, prioritize servicing blocked queue
    if (waitingQueue.length > 0) {
      const firstWaiting = waitingQueue[0];
      if (firstWaiting.type === 'PRODUCER' && emptySemaphore > 0) {
        produceItem(firstWaiting.id);
        return;
      }
      if (firstWaiting.type === 'CONSUMER' && fullSemaphore > 0) {
        consumeItem(firstWaiting.id);
        return;
      }
    }

    // Default step: alternate produce and consume
    if (stepTurnRef.current === 'PRODUCE') {
      const ok = produceItem();
      stepTurnRef.current = 'CONSUME';
      if (!ok && emptySemaphore === 0) {
        // Next step try consume to free up
        stepTurnRef.current = 'CONSUME';
      }
    } else {
      const ok = consumeItem();
      stepTurnRef.current = 'PRODUCE';
      if (!ok && fullSemaphore === 0) {
        // Next step try produce to fill up
        stepTurnRef.current = 'PRODUCE';
      }
    }
  }, [waitingQueue, emptySemaphore, fullSemaphore, produceItem, consumeItem]);

  // Automatic running timer
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      executeStep();
    }, 1500);

    return () => clearInterval(timer);
  }, [isRunning, executeStep]);

  // Scenario Loader
  const handleScenarioChange = (newScenario: ScenarioType) => {
    setScenario(newScenario);
    setIsRunning(false);

    if (newScenario === 'balanced') {
      // 2 filled, 3 empty
      const newBuf: BufferSlot[] = [
        { index: 0, isFilled: true, item: { id: 1, label: 'Data #1', producedBy: 'P1', timestamp: '10:00:01' } },
        { index: 1, isFilled: true, item: { id: 2, label: 'Data #2', producedBy: 'P2', timestamp: '10:00:02' } },
        { index: 2, isFilled: false, item: null },
        { index: 3, isFilled: false, item: null },
        { index: 4, isFilled: false, item: null },
      ];
      setBuffer(newBuf);
      setInPtr(2);
      setOutPtr(0);
      setEmptySemaphore(3);
      setFullSemaphore(2);
      setMutex(1);
      setWaitingQueue([]);
      resetProcessStates();
      addLog('SYSTEM', 'SYSTEM', 'SCENARIO', 'Loaded Standard Balanced Scenario (2 items in buffer).', 3, 2, 1);
    } else if (newScenario === 'buffer_full') {
      // 5 filled (Buffer Full!)
      const newBuf: BufferSlot[] = [
        { index: 0, isFilled: true, item: { id: 101, label: 'Pkg #1', producedBy: 'P1', timestamp: '10:00:01' } },
        { index: 1, isFilled: true, item: { id: 102, label: 'Pkg #2', producedBy: 'P2', timestamp: '10:00:02' } },
        { index: 2, isFilled: true, item: { id: 103, label: 'Pkg #3', producedBy: 'P3', timestamp: '10:00:03' } },
        { index: 3, isFilled: true, item: { id: 104, label: 'Pkg #4', producedBy: 'P1', timestamp: '10:00:04' } },
        { index: 4, isFilled: true, item: { id: 105, label: 'Pkg #5', producedBy: 'P2', timestamp: '10:00:05' } },
      ];
      setBuffer(newBuf);
      setInPtr(0);
      setOutPtr(0);
      setEmptySemaphore(0);
      setFullSemaphore(5);
      setMutex(1);
      setWaitingQueue([
        { id: 'P3', name: 'Producer 3', type: 'PRODUCER', reason: 'BUFFER_FULL', enqueuedAt: '10:00:06' },
      ]);
      setProducers((prev) => prev.map((p) => (p.id === 'P3' ? { ...p, state: 'BLOCKED' } : { ...p, state: 'READY' })));
      setConsumers((prev) => prev.map((c) => ({ ...c, state: 'READY' })));
      addLog('SYSTEM', 'SYSTEM', 'SCENARIO', 'Loaded Buffer Full Scenario (5/5 slots filled). Producer P3 blocked on wait(empty).', 0, 5, 1);
    } else if (newScenario === 'buffer_empty') {
      // 0 filled (Buffer Empty!)
      const newBuf: BufferSlot[] = Array.from({ length: 5 }, (_, idx) => ({
        index: idx,
        isFilled: false,
        item: null,
      }));
      setBuffer(newBuf);
      setInPtr(0);
      setOutPtr(0);
      setEmptySemaphore(5);
      setFullSemaphore(0);
      setMutex(1);
      setWaitingQueue([
        { id: 'C1', name: 'Consumer 1', type: 'CONSUMER', reason: 'BUFFER_EMPTY', enqueuedAt: '10:00:01' },
      ]);
      setConsumers((prev) => prev.map((c) => (c.id === 'C1' ? { ...c, state: 'BLOCKED' } : { ...c, state: 'READY' })));
      setProducers((prev) => prev.map((p) => ({ ...p, state: 'READY' })));
      addLog('SYSTEM', 'SYSTEM', 'SCENARIO', 'Loaded Buffer Empty Scenario (0/5 slots filled). Consumer C1 blocked on wait(full).', 5, 0, 1);
    } else if (newScenario === 'producer_heavy') {
      // 4 filled, Producers ready to contend
      const newBuf: BufferSlot[] = [
        { index: 0, isFilled: true, item: { id: 201, label: 'Data A', producedBy: 'P1', timestamp: '10:00:01' } },
        { index: 1, isFilled: true, item: { id: 202, label: 'Data B', producedBy: 'P2', timestamp: '10:00:02' } },
        { index: 2, isFilled: true, item: { id: 203, label: 'Data C', producedBy: 'P3', timestamp: '10:00:03' } },
        { index: 3, isFilled: true, item: { id: 204, label: 'Data D', producedBy: 'P1', timestamp: '10:00:04' } },
        { index: 4, isFilled: false, item: null },
      ];
      setBuffer(newBuf);
      setInPtr(4);
      setOutPtr(0);
      setEmptySemaphore(1);
      setFullSemaphore(4);
      setMutex(1);
      setWaitingQueue([]);
      resetProcessStates();
      addLog('SYSTEM', 'SYSTEM', 'SCENARIO', 'Loaded Producer-Heavy Scenario (4/5 filled, 1 slot left).', 1, 4, 1);
    } else if (newScenario === 'consumer_heavy') {
      // 1 filled, Consumers waiting to consume
      const newBuf: BufferSlot[] = [
        { index: 0, isFilled: true, item: { id: 301, label: 'Data Unit', producedBy: 'P1', timestamp: '10:00:01' } },
        { index: 1, isFilled: false, item: null },
        { index: 2, isFilled: false, item: null },
        { index: 3, isFilled: false, item: null },
        { index: 4, isFilled: false, item: null },
      ];
      setBuffer(newBuf);
      setInPtr(1);
      setOutPtr(0);
      setEmptySemaphore(4);
      setFullSemaphore(1);
      setMutex(1);
      setWaitingQueue([]);
      resetProcessStates();
      addLog('SYSTEM', 'SYSTEM', 'SCENARIO', 'Loaded Consumer-Heavy Scenario (Only 1 item present).', 4, 1, 1);
    }
  };

  const resetProcessStates = () => {
    setProducers((prev) => prev.map((p) => ({ ...p, state: 'READY' })));
    setConsumers((prev) => prev.map((c) => ({ ...c, state: 'READY' })));
    setCurrentCriticalProcess(null);
  };

  // Reset Button
  const handleReset = () => {
    setIsRunning(false);
    handleScenarioChange('balanced');
    setActiveActionMsg('Simulator reset to initial state.');
  };

  // Clear Logs
  const handleClearLogs = () => {
    setLogs([]);
  };

  // Filtered Logs
  const filteredLogs = logs.filter((l) => {
    if (logFilter === 'ALL') return true;
    if (logFilter === 'PRODUCERS') return l.actorType === 'PRODUCER';
    if (logFilter === 'CONSUMERS') return l.actorType === 'CONSUMER';
    if (logFilter === 'WAITING') return l.action === 'WAIT';
    return true;
  });

  const filledCount = buffer.filter((s) => s.isFilled).length;
  const isBufferFull = filledCount === BUFFER_CAPACITY;
  const isBufferEmpty = filledCount === 0;

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="bg-white border border-purple-200/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Scenario dropdown */}
        <div className="flex items-center gap-3">
          <label htmlFor="scenario-select" className="text-xs font-semibold text-purple-900 whitespace-nowrap">
            Scenario:
          </label>
          <select
            id="scenario-select"
            value={scenario}
            onChange={(e) => handleScenarioChange(e.target.value as ScenarioType)}
            className="w-full sm:w-auto px-3.5 py-2 text-xs font-medium rounded-xl border border-purple-200 bg-purple-50/50 text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all cursor-pointer"
          >
            <option value="balanced">Standard Bounded Buffer (Balanced)</option>
            <option value="buffer_full">Buffer Full Demonstration (5/5 filled)</option>
            <option value="buffer_empty">Buffer Empty Demonstration (0/5 filled)</option>
            <option value="producer_heavy">Producer Heavy (4/5 filled, contention)</option>
            <option value="consumer_heavy">Consumer Heavy (1/5 filled, rapid drain)</option>
          </select>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Start / Pause */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm ${
              isRunning
                ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-98 shadow-purple-600/20'
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
                <span>Start</span>
              </>
            )}
          </button>

          {/* Step Button */}
          <button
            onClick={executeStep}
            disabled={isRunning}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 hover:border-purple-300 disabled:opacity-40 transition-colors flex items-center gap-1.5"
            title="Execute one step of the simulation"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Step</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
            title="Reset to default initial state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          {/* Produce Item Manual Button */}
          <button
            onClick={() => produceItem()}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-98 transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Produce Item</span>
          </button>

          {/* Consume Item Manual Button */}
          <button
            onClick={() => consumeItem()}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:scale-98 transition-all flex items-center gap-1.5 shadow-sm shadow-blue-600/20"
          >
            <MinusCircle className="w-3.5 h-3.5" />
            <span>Consume Item</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =========================================================================
            LEFT COLUMN (7 or 8 cols): MAIN SIMULATION AREA
           ========================================================================= */}
        <div className="lg:col-span-8 space-y-5">
          {/* Active Status Banner */}
          {activeActionMsg && (
            <div className="p-3 rounded-xl border border-purple-200 bg-purple-50 text-xs font-medium text-purple-900 flex items-center gap-2 shadow-xs transition-all">
              <Info className="w-4 h-4 text-purple-600 shrink-0" />
              <span>{activeActionMsg}</span>
            </div>
          )}

          {/* 1. Semaphore Section */}
          <div className="bg-white border border-purple-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide font-mono">
                  Semaphore Section
                </h3>
              </div>
              <span className="text-xs font-mono text-purple-600 font-semibold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                Invariant: Empty ({emptySemaphore}) + Full ({fullSemaphore}) = 5
              </span>
            </div>

            {/* Semaphore Value Cards */}
            <div className="grid grid-cols-3 gap-3">
              {/* Mutex Binary Semaphore */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  mutex === 0
                    ? 'border-amber-400 bg-amber-50/70 shadow-xs'
                    : 'border-purple-200 bg-purple-50/30'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                  <span>Mutex</span>
                  {mutex === 0 ? (
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 text-purple-600" />
                  )}
                </div>
                <div className="my-1.5 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold font-mono text-purple-900">
                    {mutex}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                      mutex === 0 ? 'bg-amber-200 text-amber-900' : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {mutex === 0 ? 'Locked' : 'Available'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Binary lock (0 or 1). Guarantees mutual exclusion in critical section.
                </p>
              </div>

              {/* Empty Semaphore */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30">
                <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold">
                  <span>Empty Semaphore</span>
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="my-1.5 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold font-mono text-emerald-800">
                    {emptySemaphore}
                  </span>
                  <span className="text-xs text-emerald-600 font-mono">/ 5 slots</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Tracks free slots. Decrements on <code className="font-mono text-emerald-700">wait(empty)</code>.
                </p>
              </div>

              {/* Full Semaphore */}
              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/30">
                <div className="flex items-center justify-between text-xs text-blue-800 font-semibold">
                  <span>Full Semaphore</span>
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="my-1.5 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold font-mono text-blue-800">
                    {fullSemaphore}
                  </span>
                  <span className="text-xs text-blue-600 font-mono">/ 5 items</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Tracks filled slots. Increments on <code className="font-mono text-blue-700">signal(full)</code>.
                </p>
              </div>
            </div>

            {/* Processes Grid: 3 Producers (Green) & 3 Consumers (Blue) */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-purple-100">
              {/* Producer Processes (P1, P2, P3) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-800 uppercase tracking-wide font-mono">
                    Producers (Green)
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">Refill Threads</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {producers.map((proc) => {
                    const isRunningProc = currentCriticalProcess === proc.id;
                    return (
                      <div
                        key={proc.id}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          proc.state === 'BLOCKED'
                            ? 'border-rose-300 bg-rose-50 text-rose-800'
                            : isRunningProc
                            ? 'border-emerald-500 bg-emerald-100 shadow-md ring-2 ring-emerald-400'
                            : 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold font-mono text-emerald-800">
                            {proc.id}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold uppercase ${
                              proc.state === 'BLOCKED'
                                ? 'bg-rose-200 text-rose-800'
                                : isRunningProc
                                ? 'bg-emerald-600 text-white'
                                : 'bg-emerald-200 text-emerald-800'
                            }`}
                          >
                            {isRunningProc ? 'CRITICAL' : proc.state}
                          </span>
                        </div>
                        <div className="mt-2 text-[10px] text-slate-500">
                          Produced: <strong className="font-mono text-emerald-700">{proc.itemsHandled}</strong>
                        </div>
                        <button
                          onClick={() => produceItem(proc.id)}
                          disabled={isRunning}
                          className="mt-2 w-full py-1 text-[10px] font-semibold rounded-lg bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors"
                        >
                          Run {proc.id}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Consumer Processes (C1, C2, C3) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-800 uppercase tracking-wide font-mono">
                    Consumers (Blue)
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">Customer Threads</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {consumers.map((proc) => {
                    const isRunningProc = currentCriticalProcess === proc.id;
                    return (
                      <div
                        key={proc.id}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          proc.state === 'BLOCKED'
                            ? 'border-rose-300 bg-rose-50 text-rose-800'
                            : isRunningProc
                            ? 'border-blue-500 bg-blue-100 shadow-md ring-2 ring-blue-400'
                            : 'border-blue-200 bg-blue-50/50 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold font-mono text-blue-800">
                            {proc.id}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold uppercase ${
                              proc.state === 'BLOCKED'
                                ? 'bg-rose-200 text-rose-800'
                                : isRunningProc
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-200 text-blue-800'
                            }`}
                          >
                            {isRunningProc ? 'CRITICAL' : proc.state}
                          </span>
                        </div>
                        <div className="mt-2 text-[10px] text-slate-500">
                          Consumed: <strong className="font-mono text-blue-700">{proc.itemsHandled}</strong>
                        </div>
                        <button
                          onClick={() => consumeItem(proc.id)}
                          disabled={isRunning}
                          className="mt-2 w-full py-1 text-[10px] font-semibold rounded-lg bg-white border border-blue-300 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          Run {proc.id}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Shared Buffer Section */}
          <div className="bg-white border border-purple-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-purple-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide font-mono">
                    Shared Buffer (5 Slots)
                  </h3>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    {filledCount} / {BUFFER_CAPACITY} Filled ({BUFFER_CAPACITY - filledCount} Available)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Circular bounded buffer protected by Mutex. Producers deposit, Consumers withdraw.
                </p>
              </div>

              {/* In / Out Pointers info */}
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  in = Slot #{inPtr}
                </span>
                <span className="text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  out = Slot #{outPtr}
                </span>
              </div>
            </div>

            {/* Buffer Empty / Full Visual Alerts */}
            {isBufferFull && (
              <div className="p-3 mb-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>BUFFER FULL (5/5 Slots Occupied):</strong> Empty semaphore = 0. Any attempting Producer will be blocked on <code className="font-mono">wait(empty)</code> until a slot is freed.
                </span>
              </div>
            )}

            {isBufferEmpty && (
              <div className="p-3 mb-4 rounded-xl bg-blue-50 border border-blue-300 text-blue-900 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>BUFFER EMPTY (0/5 Slots Occupied):</strong> Full semaphore = 0. Any attempting Consumer will be blocked on <code className="font-mono">wait(full)</code> until an item is added.
                </span>
              </div>
            )}

            {/* 5 Slots Grid */}
            <div className="grid grid-cols-5 gap-3">
              {buffer.map((slot) => {
                const isInTarget = slot.index === inPtr;
                const isOutTarget = slot.index === outPtr;

                return (
                  <div
                    key={slot.index}
                    className={`relative p-3 rounded-xl border flex flex-col justify-between min-h-[125px] transition-all duration-300 ${
                      slot.isFilled
                        ? 'border-purple-300 bg-gradient-to-b from-purple-50 to-white shadow-sm'
                        : 'border-slate-200 bg-slate-50/60 border-dashed'
                    }`}
                  >
                    {/* Header with Slot Index & In/Out Badges */}
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold font-mono text-slate-500">
                        #{slot.index}
                      </span>
                      <div className="flex items-center gap-1">
                        {isInTarget && (
                          <span
                            title="Producer insertion point"
                            className="px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"
                          >
                            IN
                          </span>
                        )}
                        {isOutTarget && (
                          <span
                            title="Consumer withdrawal point"
                            className="px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-300"
                          >
                            OUT
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Slot Content */}
                    <div className="my-2 flex flex-col items-center justify-center text-center">
                      {slot.isFilled && slot.item ? (
                        <div className="animate-in fade-in zoom-in-95 duration-200">
                          <div className="w-9 h-7 mx-auto rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                            PKG
                          </div>
                          <span className="text-xs font-bold text-purple-950 mt-1 block">
                            {slot.item.label}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-700 block">
                            By {slot.item.producedBy}
                          </span>
                        </div>
                      ) : (
                        <div className="py-2">
                          <div className="w-8 h-6 mx-auto rounded border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-[10px] font-mono">
                            FREE
                          </div>
                          <span className="text-[11px] text-slate-400 mt-1 block">
                            Empty
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Status Tag */}
                    <div className="pt-1 border-t border-slate-100 text-center">
                      <span
                        className={`text-[10px] font-mono font-semibold ${
                          slot.isFilled ? 'text-purple-700' : 'text-slate-400'
                        }`}
                      >
                        {slot.isFilled ? 'FILLED' : 'EMPTY'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Waiting Queue Section */}
          <div className="bg-white border border-purple-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide font-mono">
                  Waiting Queue (Blocked Processes)
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {waitingQueue.length} process{waitingQueue.length !== 1 ? 'es' : ''} waiting
              </span>
            </div>

            {waitingQueue.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-center text-xs text-slate-500">
                Waiting queue is empty. All processes are either RUNNING or READY.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {waitingQueue.map((item) => {
                  const isProducer = item.type === 'PRODUCER';
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded ${
                            isProducer ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.id}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-rose-700 uppercase">
                          BLOCKED
                        </span>
                      </div>
                      <div className="my-1.5">
                        <span className="text-xs font-semibold text-slate-800 block">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-rose-600 block leading-tight mt-0.5">
                          {item.reason === 'BUFFER_FULL'
                            ? 'Blocked on wait(empty): Buffer full'
                            : item.reason === 'BUFFER_EMPTY'
                            ? 'Blocked on wait(full): Buffer empty'
                            : 'Waiting for Mutex'}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 border-t border-rose-100 pt-1">
                        Queued at: {item.enqueuedAt}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN (4 or 5 cols): OS CONCEPT EXPLANATION PANEL
           ========================================================================= */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-purple-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-purple-100">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <Code2 className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-purple-950 uppercase tracking-wide font-mono">
                About Semaphores
              </h2>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600">
              {/* Concept 1: What is a Semaphore? */}
              <div className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/30">
                <h4 className="font-bold text-purple-900 mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                  What is a Semaphore?
                </h4>
                <p className="leading-relaxed">
                  A <strong>semaphore</strong> is an integer variable accessed only via two atomic, indivisible operations: <strong>wait(P)</strong> and <strong>signal(V)</strong>. Invented by Edsger Dijkstra to coordinate concurrent processes.
                </p>
              </div>

              {/* Concept 2: Binary Semaphore */}
              <div className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/30">
                <h4 className="font-bold text-purple-900 mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                  What is a Binary Semaphore?
                </h4>
                <p className="leading-relaxed">
                  Can only take values <strong>0 or 1</strong>. Also known as a <strong>Mutex</strong>. Used to guarantee Mutual Exclusion so only one process alters shared buffer memory at any instant.
                </p>
              </div>

              {/* Concept 3: Counting Semaphore */}
              <div className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/30">
                <h4 className="font-bold text-purple-900 mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                  What is a Counting Semaphore?
                </h4>
                <p className="leading-relaxed">
                  Can range over an unrestricted domain ($\ge 0$). In this simulator:
                </p>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-700 font-mono text-[11px]">
                  <li><strong>empty</strong>: counts available empty slots (0 to 5)</li>
                  <li><strong>full</strong>: counts items ready to consume (0 to 5)</li>
                </ul>
              </div>

              {/* Concept 4: How Wait (P) and Signal (V) Work */}
              <div className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/30">
                <h4 className="font-bold text-purple-900 mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                  How Wait (P) and Signal (V) Work
                </h4>
                <div className="space-y-1.5 font-mono text-[11px] mt-1 bg-white p-2.5 rounded-lg border border-purple-100">
                  <div className="text-purple-800">
                    <strong>wait(S):</strong>
                    <div className="pl-2 text-slate-600">while S &le; 0: block(); S = S - 1;</div>
                  </div>
                  <div className="text-purple-800 pt-1 border-t border-purple-50">
                    <strong>signal(S):</strong>
                    <div className="pl-2 text-slate-600">S = S + 1; wakeup(blocked_process);</div>
                  </div>
                </div>
              </div>

              {/* Concept 5: Producer-Consumer Algorithm */}
              <div className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/30">
                <h4 className="font-bold text-purple-900 mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                  Producer–Consumer Synchronization
                </h4>
                <p className="leading-relaxed mb-2">
                  Three semaphores coordinate execution order:
                </p>
                <div className="font-mono text-[10.5px] space-y-2 bg-slate-900 text-slate-200 p-2.5 rounded-lg">
                  <div>
                    <span className="text-emerald-400 font-bold">// Producer Logic:</span>
                    <div className="text-slate-300">wait(empty);   <span className="text-slate-500">// wait for slot</span></div>
                    <div className="text-slate-300">wait(mutex);   <span className="text-slate-500">// lock buffer</span></div>
                    <div className="text-emerald-300">add_to_buffer();</div>
                    <div className="text-slate-300">signal(mutex); <span className="text-slate-500">// unlock buffer</span></div>
                    <div className="text-slate-300">signal(full);  <span className="text-slate-500">// signal consumer</span></div>
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-blue-400 font-bold">// Consumer Logic:</span>
                    <div className="text-slate-300">wait(full);    <span className="text-slate-500">// wait for item</span></div>
                    <div className="text-slate-300">wait(mutex);   <span className="text-slate-500">// lock buffer</span></div>
                    <div className="text-blue-300">remove_from_buffer();</div>
                    <div className="text-slate-300">signal(mutex); <span className="text-slate-500">// unlock buffer</span></div>
                    <div className="text-slate-300">signal(empty); <span className="text-slate-500">// signal producer</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM SECTION: ACTIVITY LOG
         ========================================================================= */}
      <div className="bg-white border border-purple-200/80 rounded-2xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="px-5 py-3.5 bg-purple-50/50 border-b border-purple-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-700" />
            <h3 className="text-xs font-bold text-purple-950 tracking-wider uppercase font-mono">
              Activity Log & Synchronization Events
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              ({logs.length} operations)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center gap-1 p-0.5 bg-white rounded-lg border border-purple-200 text-[11px] font-medium">
              <button
                onClick={() => setLogFilter('ALL')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  logFilter === 'ALL' ? 'bg-purple-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setLogFilter('PRODUCERS')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  logFilter === 'PRODUCERS' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Producers
              </button>
              <button
                onClick={() => setLogFilter('CONSUMERS')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  logFilter === 'CONSUMERS' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Consumers
              </button>
              <button
                onClick={() => setLogFilter('WAITING')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  logFilter === 'WAITING' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Waiting/Blocked
              </button>
            </div>

            <button
              onClick={handleClearLogs}
              title="Clear logs"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Log Entries List */}
        <div className="p-4 max-h-[260px] overflow-y-auto space-y-2 font-mono text-xs">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              No activity records match the selected filter.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isWait = log.action === 'WAIT';
              const isProduce = log.action === 'PRODUCE';
              const isConsume = log.action === 'CONSUME';

              return (
                <div
                  key={log.id}
                  className={`p-2.5 rounded-xl border text-xs transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    isWait
                      ? 'border-amber-200 bg-amber-50/60 text-amber-900'
                      : isProduce
                      ? 'border-emerald-200 bg-emerald-50/40 text-emerald-950'
                      : isConsume
                      ? 'border-blue-200 bg-blue-50/40 text-blue-950'
                      : 'border-slate-200 bg-slate-50/50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-slate-400 font-mono text-[11px] shrink-0">
                      {log.timestamp}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        log.actorType === 'PRODUCER'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : log.actorType === 'CONSUMER'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {log.actor}
                    </span>
                    <span className="font-sans text-xs text-slate-700">
                      {log.message}
                    </span>
                  </div>

                  {/* Semaphore states at time of action */}
                  <div className="flex items-center gap-2 text-[10.5px] font-mono text-slate-500 bg-white/80 px-2 py-0.5 rounded-lg border border-slate-200 shrink-0">
                    <span>empty: <strong className="text-emerald-700">{log.semaphores.empty}</strong></span>
                    <span>·</span>
                    <span>full: <strong className="text-blue-700">{log.semaphores.full}</strong></span>
                    <span>·</span>
                    <span>mutex: <strong className="text-purple-700">{log.semaphores.mutex}</strong></span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
