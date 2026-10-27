/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { SimulatorView } from './components/views/SimulatorView';
import { SynchronizationView } from './components/views/SynchronizationView';
import { EmptyFullConditionsView } from './components/views/EmptyFullConditionsView';
import { RaceConditionLabView } from './components/views/RaceConditionLabView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { LearnOSConceptsView } from './components/views/LearnOSConceptsView';
import {
  Banknote,
  LayoutDashboard,
  Cpu,
  ShieldCheck,
  AlertOctagon,
  GitFork,
  BarChart3,
  BookOpen,
} from 'lucide-react';
import { ActiveTab } from './types/osSimulation';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    count,
    capacity,
    mutex,
  } = useSimulation();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'simulator':
        return <SimulatorView />;
      case 'synchronization':
        return <SynchronizationView />;
      case 'empty-full':
        return <EmptyFullConditionsView />;
      case 'race-condition':
        return <RaceConditionLabView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'learn-os':
        return <LearnOSConceptsView />;
      default:
        return <DashboardView />;
    }
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'simulator', label: 'Simulator', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'synchronization', label: 'Synchronization', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'empty-full', label: 'Empty & Full', icon: <AlertOctagon className="w-3.5 h-3.5" /> },
    { id: 'race-condition', label: 'Race Condition', icon: <GitFork className="w-3.5 h-3.5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'learn-os', label: 'Learn OS', icon: <BookOpen className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-purple-200 selection:text-purple-900">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-purple-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Top Project Title (ATM Cash Refill Simulator) */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                ATM Cash Refill Simulator
              </h1>
              <p className="text-[11px] text-slate-500 font-medium leading-tight">
                Operating Systems Producer–Consumer Problem Practical
              </p>
            </div>
          </div>

          {/* Quick Status Pill */}
          <div className="hidden sm:flex items-center gap-3 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-semibold border border-purple-200">
              ATM Storage: {count} / {capacity} units
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-semibold border border-purple-200">
              Mutex: {mutex === 1 ? '1 (Unlocked)' : '0 (Locked)'}
            </span>
          </div>
        </div>
      </header>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center overflow-x-auto bg-white border-b border-purple-100 px-3 py-2 text-xs font-medium gap-1.5 shadow-xs">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-purple-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-purple-900 hover:bg-purple-50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Workspace with Left Sidebar & Content Stage */}
      <div className="flex-1 flex w-full">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          count={count}
          capacity={capacity}
          mutex={mutex}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>

      {/* Clean Academic Footer */}
      <footer className="bg-white border-t border-purple-100 py-3.5 px-6 text-xs text-slate-500 text-center font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ATM Cash Refill Simulator · Operating Systems Process Synchronization</span>
          <div className="flex items-center gap-3 text-[11px] text-purple-700 font-semibold">
            <span>Producer–Consumer</span>
            <span>·</span>
            <span>Counting Semaphores</span>
            <span>·</span>
            <span>Mutex Lock</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <SimulationProvider>
      <AppContent />
    </SimulationProvider>
  );
}
