
import React from 'react';
import { CommitLevel } from '../types';
import { LEVEL_COLORS } from '../constants';

interface ToolbarProps {
  currentLevel: CommitLevel;
  setCurrentLevel: (level: CommitLevel) => void;
  onClear: () => void;
  onRandomize: () => void;
  isRandomizing: boolean;
  randomizeCount: number;
  setRandomizeCount: (val: number) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  onApplyPreset: (years: number) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  currentLevel, 
  setCurrentLevel, 
  onClear, 
  onRandomize,
  isRandomizing,
  randomizeCount,
  setRandomizeCount,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onApplyPreset
}) => {
  const levels: CommitLevel[] = [0, 1, 2, 3, 4];

  return (
    <div className="bg-gray-50 dark:bg-[#161b22] p-6 rounded-2xl border border-gray-200 dark:border-[#30363d] shadow-xl transition-all">
      <div className="flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
        
        {/* Left Section: Paint Tool */}
        <div className="flex flex-col gap-3">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">
            Paint Intensity
          </label>
          <div className="flex items-center gap-2 bg-white dark:bg-[#0d1117] p-1.5 rounded-xl border border-gray-200 dark:border-[#30363d] w-fit shadow-sm">
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setCurrentLevel(lvl)}
                className={`w-9 h-9 rounded-lg ${LEVEL_COLORS[lvl]} border-2 transition-all relative group ${
                  currentLevel === lvl 
                    ? 'border-gray-900 dark:border-white scale-105 shadow-md' 
                    : 'border-transparent hover:scale-105'
                }`}
                title={`Level ${lvl}`}
              >
                {currentLevel === lvl && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-white dark:border-[#0d1117] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Center Section: Date Configuration */}
        <div className="flex flex-col gap-3 flex-1 lg:max-w-2xl">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">
            Date Range & Presets
          </label>
          <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-[#0d1117] p-2 rounded-xl border border-gray-200 dark:border-[#30363d] shadow-sm">
            <div className="flex items-center gap-2 px-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="bg-transparent text-sm font-medium focus:outline-none text-gray-900 dark:text-white cursor-pointer"
              />
              <span className="text-gray-400 dark:text-gray-600">→</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="bg-transparent text-sm font-medium focus:outline-none text-gray-900 dark:text-white cursor-pointer"
              />
            </div>
            
            <div className="h-6 w-px bg-gray-200 dark:bg-[#30363d] hidden sm:block" />
            
            <div className="flex gap-1.5 p-1 bg-gray-50 dark:bg-[#161b22] rounded-lg">
              {[1, 2, 3, 5].map(y => (
                <button
                  key={y}
                  onClick={() => onApplyPreset(y)}
                  className="px-3 py-1 text-[11px] font-bold rounded-md transition-all hover:bg-white dark:hover:bg-[#30363d] hover:shadow-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-gray-200 dark:hover:border-[#484f58]"
                >
                  {y}Y
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex flex-col gap-3">
          <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1 text-right lg:text-right">
            Actions
          </label>
          <div className="flex items-center gap-3 bg-white dark:bg-[#0d1117] p-1.5 rounded-xl border border-gray-200 dark:border-[#30363d] shadow-sm">
            <div className="flex flex-col gap-1 px-2 border-r border-gray-200 dark:border-[#30363d]">
              <label className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-black leading-none">Commits</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={randomizeCount}
                  onChange={(e) => setRandomizeCount(parseInt(e.target.value) || 0)}
                  className="bg-transparent text-sm font-bold text-gray-900 dark:text-white focus:outline-none w-10 text-center"
                />
                <div className="flex flex-col">
                  <button 
                    onClick={() => setRandomizeCount(prev => Math.min(prev + 10, 1000))}
                    className="p-0.5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    title="Increase by 10"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7"/></svg>
                  </button>
                  <button 
                    onClick={() => setRandomizeCount(prev => Math.max(prev - 10, 1))}
                    className="p-0.5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    title="Decrease by 10"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7"/></svg>
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={onRandomize}
              disabled={isRandomizing}
              className={`flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-[#0d1117] text-xs font-bold rounded-lg transition-all shadow-md
                ${isRandomizing ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:scale-105 active:scale-95'}`}
            >
              <svg className={`w-4 h-4 ${isRandomizing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isRandomizing ? 'Randomizing...' : 'Randomize'}
            </button>
            <button
              onClick={onClear}
              className="flex items-center justify-center w-9 h-9 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
              title="Clear Grid"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Toolbar;
