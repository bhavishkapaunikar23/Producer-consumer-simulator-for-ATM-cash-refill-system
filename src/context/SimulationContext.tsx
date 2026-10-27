/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  CashUnit,
  ActorState,
  ActivityLogItem,
  AnalyticsSnapshot,
  ActiveTab,
} from '../types/osSimulation';

interface SimulationContextType {
  // State
  buffer: (CashUnit | null)[];
  capacity: number;
  inPtr: number;
  outPtr: number;
  count: number;
  emptySemaphore: number;
  fullSemaphore: number;
  mutex: number; // 1 = available, 0 = locked
  producerState: ActorState;
  consumerState: ActorState;
  isRunning: boolean;
  simSpeed: number;
  activeLiveAction: string;
  activeSlotIndex: number | null;
  activeActionType: 'PRODUCING' | 'CONSUMING' | null;
  totalProduced: number;
  totalConsumed: number;
  producerWaitCount: number;
  consumerWaitCount: number;
  logs: ActivityLogItem[];
  history: AnalyticsSnapshot[];
  activeTab: ActiveTab;

  // Actions
  setActiveTab: (tab: ActiveTab) => void;
  setSimSpeed: (speed: number) => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
  stepSimulation: () => void;
  resetSimulation: () => void;
  addCash: () => boolean;
  withdrawCash: () => boolean;
  forceFill: () => void;
  forceDrain: () => void;
  clearLogs: () => void;
  resetAnalytics: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

const BUFFER_CAPACITY = 10;

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const capacity = BUFFER_CAPACITY;

  const [buffer, setBuffer] = useState<(CashUnit | null)[]>(() => {
    const initialArr = new Array(BUFFER_CAPACITY).fill(null);
    initialArr[0] = { id: 'cash-1', serialNumber: 'ATM-101', amount: 100, insertedAt: Date.now() - 3000, slotIndex: 0 };
    initialArr[1] = { id: 'cash-2', serialNumber: 'ATM-102', amount: 100, insertedAt: Date.now() - 2000, slotIndex: 1 };
    initialArr[2] = { id: 'cash-3', serialNumber: 'ATM-103', amount: 100, insertedAt: Date.now() - 1000, slotIndex: 2 };
    return initialArr;
  });

  const [inPtr, setInPtr] = useState<number>(3);
  const [outPtr, setOutPtr] = useState<number>(0);
  const [count, setCount] = useState<number>(3);

  // Semaphores: Empty = capacity - count; Full = count; Mutex = 1 or 0
  const emptySemaphore = capacity - count;
  const fullSemaphore = count;
  const [mutex, setMutex] = useState<number>(1);

  // States
  const [producerState, setProducerState] = useState<ActorState>('IDLE');
  const [consumerState, setConsumerState] = useState<ActorState>('IDLE');
  // Auto-start live simulation by default so it's visibly alive immediately!
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1600); // 1.6s
  const [activeLiveAction, setActiveLiveAction] = useState<string>('Live Simulation Active: Alternating Producer and Consumer');
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [activeActionType, setActiveActionType] = useState<'PRODUCING' | 'CONSUMING' | null>(null);

  // Analytics counters
  const [totalProduced, setTotalProduced] = useState<number>(3);
  const [totalConsumed, setTotalConsumed] = useState<number>(0);
  const [producerWaitCount, setProducerWaitCount] = useState<number>(0);
  const [consumerWaitCount, setConsumerWaitCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const startTimeRef = useRef<number>(Date.now());
  const serialCounterRef = useRef<number>(104);
  const isOperatingRef = useRef<boolean>(false);
  const stepTurnRef = useRef<'PRODUCE' | 'CONSUME'>('PRODUCE');

  // Logs
  const [logs, setLogs] = useState<ActivityLogItem[]>([
    {
      id: 'log-init',
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      unixTime: Date.now(),
      type: 'INFO',
      actor: 'SYSTEM',
      message: 'ATM Buffer Initialized (10 slots, 3 units pre-loaded).',
      details: 'empty = 7, full = 3, mutex = 1 (Available). Live simulation is running.',
      bufferCount: 3,
      semaphores: { empty: 7, full: 3, mutex: 1 },
    },
  ]);

  // History for charts
  const [history, setHistory] = useState<AnalyticsSnapshot[]>([
    {
      id: 'hist-0',
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      timeOffsetSec: 0,
      bufferCount: 3,
      capacity: BUFFER_CAPACITY,
      emptySemaphore: 7,
      fullSemaphore: 3,
      utilizationRate: 30,
    },
  ]);

  const addLog = useCallback(
    (
      type: ActivityLogItem['type'],
      actor: ActivityLogItem['actor'],
      message: string,
      details: string | undefined,
      curCount: number,
      emptyVal: number,
      fullVal: number,
      mutexVal: number
    ) => {
      const now = new Date();
      const newItem: ActivityLogItem = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: now.toLocaleTimeString([], { hour12: false }),
        unixTime: now.getTime(),
        type,
        actor,
        message,
        details,
        bufferCount: curCount,
        semaphores: { empty: emptyVal, full: fullVal, mutex: mutexVal },
      };
      setLogs((prev) => [newItem, ...prev.slice(0, 99)]);
    },
    []
  );

  const recordSnapshot = useCallback((curCount: number) => {
    const offset = Math.round((Date.now() - startTimeRef.current) / 1000);
    const snap: AnalyticsSnapshot = {
      id: `snap-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      timeOffsetSec: offset,
      bufferCount: curCount,
      capacity: BUFFER_CAPACITY,
      emptySemaphore: BUFFER_CAPACITY - curCount,
      fullSemaphore: curCount,
      utilizationRate: Math.round((curCount / BUFFER_CAPACITY) * 100),
    };
    setHistory((prev) => [...prev.slice(-30), snap]);
  }, []);

  // Add Cash (Producer)
  const addCash = useCallback((): boolean => {
    if (isOperatingRef.current) return false;

    // Check boundary: Buffer Full
    if (count >= BUFFER_CAPACITY) {
      setProducerState('ATM FULL');
      setProducerWaitCount((c) => c + 1);
      setActiveLiveAction('PRODUCER BLOCKED: Buffer is FULL (10/10). Waiting for customer withdrawal.');
      addLog(
        'WAIT',
        'PRODUCER',
        'ATM FULL — Producer Waiting (Buffer Full: 10/10)',
        'sem_wait(&empty) suspended because empty = 0. Cash refill team cannot add cash.',
        count,
        0,
        BUFFER_CAPACITY,
        1
      );
      return false;
    }

    isOperatingRef.current = true;
    setProducerState('RUNNING');
    setMutex(0); // Lock mutex

    const serialNum = `ATM-${serialCounterRef.current++}`;
    const targetSlot = inPtr;
    setActiveSlotIndex(targetSlot);
    setActiveActionType('PRODUCING');
    setActiveLiveAction(`Bank Refill Team: Loading $100 [${serialNum}] into Slot #${targetSlot}... (Mutex Locked)`);

    const newUnit: CashUnit = {
      id: `cash-${Date.now()}`,
      serialNumber: serialNum,
      amount: 100,
      insertedAt: Date.now(),
      slotIndex: targetSlot,
    };

    setTimeout(() => {
      setBuffer((prev) => {
        const next = [...prev];
        next[targetSlot] = newUnit;
        return next;
      });

      const nextIn = (targetSlot + 1) % BUFFER_CAPACITY;
      const nextCount = count + 1;

      setInPtr(nextIn);
      setCount(nextCount);
      setTotalProduced((tp) => tp + 1);
      setMutex(1); // Release mutex
      setProducerState('IDLE');
      setActiveSlotIndex(null);
      setActiveActionType(null);
      setActiveLiveAction(`Refill Complete: Slot #${targetSlot} loaded. (Mutex Released, Full Semaphore incremented)`);
      isOperatingRef.current = false;

      // If consumer was blocked because empty, it can now proceed
      if (consumerState === 'ATM EMPTY') {
        setConsumerState('IDLE');
      }

      addLog(
        'PRODUCE',
        'PRODUCER',
        `Bank Refill Team added $100 [${serialNum}] into Slot #${targetSlot}`,
        `wait(empty) OK · wait(mutex) OK · Slot #${targetSlot} loaded · signal(mutex) OK · signal(full) OK`,
        nextCount,
        BUFFER_CAPACITY - nextCount,
        nextCount,
        1
      );

      recordSnapshot(nextCount);
    }, 600); // 600ms visible animated duration

    return true;
  }, [count, inPtr, consumerState, addLog, recordSnapshot]);

  // Withdraw Cash (Consumer)
  const withdrawCash = useCallback((): boolean => {
    if (isOperatingRef.current) return false;

    // Check boundary: Buffer Empty
    if (count <= 0) {
      setConsumerState('ATM EMPTY');
      setConsumerWaitCount((c) => c + 1);
      setActiveLiveAction('CONSUMER BLOCKED: Buffer is EMPTY (0/10). Waiting for bank refill.');
      addLog(
        'WAIT',
        'CONSUMER',
        'ATM EMPTY — Consumer Waiting (Buffer Empty: 0/10)',
        'sem_wait(&full) suspended because full = 0. Customer cannot withdraw cash.',
        0,
        BUFFER_CAPACITY,
        0,
        1
      );
      return false;
    }

    isOperatingRef.current = true;
    setConsumerState('RUNNING');
    setMutex(0); // Lock mutex

    const targetSlot = outPtr;
    const item = buffer[targetSlot];
    const serial = item ? item.serialNumber : `Unit-${targetSlot}`;
    setActiveSlotIndex(targetSlot);
    setActiveActionType('CONSUMING');
    setActiveLiveAction(`ATM Customer: Withdrawing $100 [${serial}] from Slot #${targetSlot}... (Mutex Locked)`);

    setTimeout(() => {
      setBuffer((prev) => {
        const next = [...prev];
        next[targetSlot] = null;
        return next;
      });

      const nextOut = (targetSlot + 1) % BUFFER_CAPACITY;
      const nextCount = count - 1;

      setOutPtr(nextOut);
      setCount(nextCount);
      setTotalConsumed((tc) => tc + 1);
      setMutex(1); // Release mutex
      setConsumerState('IDLE');
      setActiveSlotIndex(null);
      setActiveActionType(null);
      setActiveLiveAction(`Withdrawal Complete: Slot #${targetSlot} dispensed. (Mutex Released, Empty Semaphore incremented)`);
      isOperatingRef.current = false;

      // If producer was blocked because full, it can now proceed
      if (producerState === 'ATM FULL') {
        setProducerState('IDLE');
      }

      addLog(
        'CONSUME',
        'CONSUMER',
        `Customer withdrew $100 [${serial}] from Slot #${targetSlot}`,
        `wait(full) OK · wait(mutex) OK · Slot #${targetSlot} emptied · signal(mutex) OK · signal(empty) OK`,
        nextCount,
        BUFFER_CAPACITY - nextCount,
        nextCount,
        1
      );

      recordSnapshot(nextCount);
    }, 600); // 600ms visible animated duration

    return true;
  }, [count, outPtr, buffer, producerState, addLog, recordSnapshot]);

  // Step Simulation: executes one single operation
  const stepSimulation = useCallback(() => {
    if (count >= BUFFER_CAPACITY) {
      withdrawCash();
      stepTurnRef.current = 'PRODUCE';
    } else if (count <= 0) {
      addCash();
      stepTurnRef.current = 'CONSUME';
    } else {
      if (stepTurnRef.current === 'PRODUCE') {
        addCash();
        stepTurnRef.current = 'CONSUME';
      } else {
        withdrawCash();
        stepTurnRef.current = 'PRODUCE';
      }
    }
  }, [count, addCash, withdrawCash]);

  // Automation loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      stepSimulation();
    }, simSpeed);

    return () => clearInterval(interval);
  }, [isRunning, simSpeed, stepSimulation]);

  const startSimulation = () => {
    setIsRunning(true);
    setActiveLiveAction('Live Simulation Running: Processes actively coordinating access.');
    addLog('INFO', 'SYSTEM', 'Simulation started in automatic execution mode.', undefined, count, emptySemaphore, fullSemaphore, 1);
  };

  const pauseSimulation = () => {
    setIsRunning(false);
    setProducerState('IDLE');
    setConsumerState('IDLE');
    setActiveLiveAction('Simulation Paused: Threads held at current state.');
    addLog('INFO', 'SYSTEM', 'Simulation paused.', undefined, count, emptySemaphore, fullSemaphore, 1);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    const initialArr = new Array(BUFFER_CAPACITY).fill(null);
    initialArr[0] = { id: 'cash-1', serialNumber: 'ATM-101', amount: 100, insertedAt: Date.now(), slotIndex: 0 };
    initialArr[1] = { id: 'cash-2', serialNumber: 'ATM-102', amount: 100, insertedAt: Date.now(), slotIndex: 1 };
    initialArr[2] = { id: 'cash-3', serialNumber: 'ATM-103', amount: 100, insertedAt: Date.now(), slotIndex: 2 };

    setBuffer(initialArr);
    setInPtr(3);
    setOutPtr(0);
    setCount(3);
    setMutex(1);
    setProducerState('IDLE');
    setConsumerState('IDLE');
    setActiveSlotIndex(null);
    setActiveActionType(null);
    setActiveLiveAction('Simulation reset to default initial state (3 units loaded).');
    startTimeRef.current = Date.now();

    addLog('RESET', 'SYSTEM', 'ATM Cash Refill Simulator reset to default state (3 units loaded, 7 empty slots).', undefined, 3, 7, 3, 1);
    recordSnapshot(3);
  };

  const forceFill = () => {
    const fullBuf = new Array(BUFFER_CAPACITY).fill(null);
    for (let i = 0; i < BUFFER_CAPACITY; i++) {
      fullBuf[i] = {
        id: `fill-${i}`,
        serialNumber: `ATM-F${i + 1}`,
        amount: 100,
        insertedAt: Date.now(),
        slotIndex: i,
      };
    }
    setBuffer(fullBuf);
    setInPtr(0);
    setOutPtr(0);
    setCount(BUFFER_CAPACITY);
    setProducerState('ATM FULL');
    setActiveLiveAction('ATM FULL: Buffer saturated (10/10). Producer is blocked.');
    addLog(
      'INFO',
      'SYSTEM',
      'ATM Buffer Force Filled to 10/10 slots. ATM FULL condition active.',
      'empty = 0, full = 10. Producer cannot add cash.',
      BUFFER_CAPACITY,
      0,
      BUFFER_CAPACITY,
      1
    );
    recordSnapshot(BUFFER_CAPACITY);
  };

  const forceDrain = () => {
    setBuffer(new Array(BUFFER_CAPACITY).fill(null));
    setInPtr(0);
    setOutPtr(0);
    setCount(0);
    setConsumerState('ATM EMPTY');
    setActiveLiveAction('ATM EMPTY: Buffer drained to 0. Consumer is blocked.');
    addLog(
      'INFO',
      'SYSTEM',
      'ATM Buffer Force Drained to 0/10 slots. ATM EMPTY condition active.',
      'empty = 10, full = 0. Consumer cannot withdraw cash.',
      0,
      BUFFER_CAPACITY,
      0,
      1
    );
    recordSnapshot(0);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const resetAnalytics = () => {
    setTotalProduced(count);
    setTotalConsumed(0);
    setProducerWaitCount(0);
    setConsumerWaitCount(0);
    startTimeRef.current = Date.now();
    setHistory([
      {
        id: `snap-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour12: false }),
        timeOffsetSec: 0,
        bufferCount: count,
        capacity: BUFFER_CAPACITY,
        emptySemaphore: BUFFER_CAPACITY - count,
        fullSemaphore: count,
        utilizationRate: Math.round((count / BUFFER_CAPACITY) * 100),
      },
    ]);
    addLog('INFO', 'SYSTEM', 'Analytics counters and chart history reset.', undefined, count, emptySemaphore, fullSemaphore, mutex);
  };

  return (
    <SimulationContext.Provider
      value={{
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
        isRunning,
        simSpeed,
        activeLiveAction,
        activeSlotIndex,
        activeActionType,
        totalProduced,
        totalConsumed,
        producerWaitCount,
        consumerWaitCount,
        logs,
        history,
        activeTab,
        setActiveTab,
        setSimSpeed,
        startSimulation,
        pauseSimulation,
        stepSimulation,
        resetSimulation,
        addCash,
        withdrawCash,
        forceFill,
        forceDrain,
        clearLogs,
        resetAnalytics,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
