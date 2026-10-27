/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActiveTab } from '../types/osSimulation';
import {
  LayoutDashboard,
  Cpu,
  ShieldCheck,
  AlertOctagon,
  GitFork,
  BarChart3,
  BookOpen,
  Lock,
  Unlock,
  Banknote,
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  count: number;
  capacity: number;
  mutex: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  count,
  capacity,
  mutex,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'simulator', label: 'Simulator', icon: <Cpu className="w-4 h-4" /> },
    { id: 'synchronization', label: 'Synchronization', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'empty-full', label: 'Empty & Full Conditions', icon: <AlertOctagon className="w-4 h-4" /> },
    { id: 'race-condition', label: 'Race Condition', icon: <GitFork className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'learn-os', label: 'Learn OS Concepts', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-purple-100 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-65px)]">
      <div>
        {/* Navigation Section Title */}
        <div className="mb-4 px-2">
          <span className="text-[10px] font-mono font-bold tracking-wider text-purple-700 uppercase">
            Navigation Menu
          </span>
          <h2 className="text-xs font-bold text-slate-800 mt-0.5">
            Operating Systems Lab
          </h2>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                  isActive
                    ? 'bg-purple-600 text-white font-semibold shadow-sm shadow-purple-600/20'
                    : 'text-slate-600 hover:text-purple-900 hover:bg-purple-50/70'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-purple-600'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom ATM Status Widget */}
      <div className="pt-4 border-t border-purple-100">
        <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5 text-purple-600" />
              <span>ATM Cash:</span>
            </span>
            <span className="font-mono font-bold text-purple-950">
              {count} / {capacity} units
            </span>
          </div>

          <div className="w-full bg-purple-200/60 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                count === capacity
                  ? 'bg-amber-500'
                  : count === 0
                  ? 'bg-rose-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${(count / capacity) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <span className="text-slate-500">Mutex Lock:</span>
            <span className="flex items-center gap-1 font-mono font-bold">
              {mutex === 1 ? (
                <>
                  <Unlock className="w-3 h-3 text-purple-600" />
                  <span className="text-purple-700">UNLOCKED (1)</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span className="text-amber-700">LOCKED (0)</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
