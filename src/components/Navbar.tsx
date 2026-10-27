/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActiveTab } from '../types/osSimulation';
import { Play, Pause, RotateCcw, Cpu } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isRunning: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isRunning,
  onTogglePlay,
  onReset,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#080d1a]/95 backdrop-blur border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-8">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
          <Cpu className="w-4 h-4" />
        </div>
        <button
          onClick={() => setActiveTab('dashboard')}
          className="text-base sm:text-lg font-bold tracking-tight text-slate-100 hover:text-teal-300 transition-colors whitespace-nowrap shrink-0 text-left"
        >
          ATM Bounded Buffer OS
        </button>
      </div>

      {/* Zone 2: Concise single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'dashboard' ? 'text-teal-400 font-semibold' : ''
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'simulator' ? 'text-teal-400 font-semibold' : ''
          }`}
        >
          Simulator
        </button>
        <button
          onClick={() => setActiveTab('synchronization')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'synchronization' ? 'text-teal-400 font-semibold' : ''
          }`}
        >
          Synchronization
        </button>
        <button
          onClick={() => setActiveTab('empty-full')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'empty-full' ? 'text-teal-400 font-semibold' : ''
          }`}
        >
          Empty & Full
        </button>
        <button
          onClick={() => setActiveTab('race-condition')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'race-condition' ? 'text-teal-400 font-semibold' : ''
          }`}
        >
          Race Lab
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'analytics' ? 'text-teal-400 font-semibold' : ''
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('learn-os')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'learn-os' ? 'text-teal-400 font-semibold' : ''
          }`}
        >
          Learn OS
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onReset}
          title="Reset Simulation"
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onTogglePlay}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-md whitespace-nowrap shrink-0 ${
            isRunning
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30'
              : 'bg-teal-600 text-slate-950 font-bold hover:bg-teal-500 shadow-teal-500/20'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause Sim</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Sim</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
