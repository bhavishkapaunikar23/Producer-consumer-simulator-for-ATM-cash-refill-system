/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CashUnit {
  id: string;
  serialNumber: string;
  amount: number;
  insertedAt: number;
  slotIndex: number;
}

export type ActorState =
  | 'IDLE'
  | 'RUNNING'
  | 'PRODUCING'
  | 'CONSUMING'
  | 'WAITING'
  | 'ATM FULL'
  | 'ATM EMPTY';

export type LogType =
  | 'PRODUCE'
  | 'CONSUME'
  | 'WAIT'
  | 'MUTEX_LOCK'
  | 'MUTEX_UNLOCK'
  | 'RESET'
  | 'INFO';

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  unixTime: number;
  type: LogType;
  actor: 'PRODUCER' | 'CONSUMER' | 'SYSTEM';
  message: string;
  details?: string;
  bufferCount: number;
  semaphores: {
    empty: number;
    full: number;
    mutex: number;
  };
}

export interface AnalyticsSnapshot {
  id: string;
  timestamp: string;
  timeOffsetSec: number;
  bufferCount: number;
  capacity: number;
  emptySemaphore: number;
  fullSemaphore: number;
  utilizationRate: number;
}

export type ActiveTab =
  | 'dashboard'
  | 'simulator'
  | 'synchronization'
  | 'empty-full'
  | 'race-condition'
  | 'analytics'
  | 'learn-os';
