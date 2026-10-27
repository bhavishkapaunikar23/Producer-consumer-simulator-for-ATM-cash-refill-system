/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProcessId = 'P1' | 'P2' | 'P3' | 'C1' | 'C2' | 'C3';

export type ProcessType = 'PRODUCER' | 'CONSUMER';

export type ProcessState = 'READY' | 'RUNNING' | 'WAITING' | 'BLOCKED' | 'COMPLETED';

export interface ProcessItem {
  id: ProcessId;
  name: string;
  type: ProcessType;
  state: ProcessState;
  color: 'green' | 'blue';
  itemsHandled: number;
  lastAction?: string;
}

export interface BufferSlot {
  index: number;
  isFilled: boolean;
  item: {
    id: number;
    label: string;
    producedBy: ProcessId;
    timestamp: string;
  } | null;
}

export interface WaitingProcess {
  id: ProcessId;
  name: string;
  type: ProcessType;
  reason: 'BUFFER_FULL' | 'BUFFER_EMPTY' | 'MUTEX_HELD';
  enqueuedAt: string;
}

export type ScenarioType =
  | 'balanced'
  | 'buffer_full'
  | 'buffer_empty'
  | 'producer_heavy'
  | 'consumer_heavy';

export interface LogEntry {
  id: string;
  timestamp: string;
  actor: ProcessId | 'SYSTEM';
  actorType: 'PRODUCER' | 'CONSUMER' | 'SYSTEM';
  action: 'PRODUCE' | 'CONSUME' | 'WAIT' | 'MUTEX_LOCK' | 'MUTEX_UNLOCK' | 'RESET' | 'SCENARIO';
  message: string;
  semaphores: {
    empty: number;
    full: number;
    mutex: number;
  };
}
