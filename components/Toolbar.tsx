
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
    <div className="bg-white dark:bg-[#0d1117] p-3 rounded-xl border border-gray-200 dark:border-[#30363d] shadow-sm transition-all">
      <div className="flex flex-col md:flex-row gap-5 md:items-center">
        
        {/* Paint Tool */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Intensity</span>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium">Less</span>
            <div className="flex items-center gap-1.5 p-1 bg-gray-50 dark:bg-[#161b22] rounded-lg border border-gray-200 dark:border-[#30363d]">
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setCurrentLevel(lvl)}
                  className={`w-[10px] h-[10px] rounded-[2px] transition-all ${LEVEL_COLORS[lvl]} ${
                    currentLevel === lvl 
                      ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-[#0d1117] scale-110' 
                      : 'hover:ring-1 hover:ring-gray-300 dark:hover:ring-gray-600'
                  } ${lvl === 0 ? 'outline outline-1 outline-[#1b1f230f] dark:outline-[#ffffff0d]' : ''}`}
                  title={`Level ${lvl}`}
                />
              ))}
            </div>
            <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium">More</span>
          </div>
        </div>

        <div className="hidden md:block h-10 w-px bg-gray-200 dark:bg-[#30363d]" />

        {/* Date Range */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Date Range</span>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-50 dark:bg-[#161b22] px-2 py-1 rounded-lg border border-gray-200 dark:border-[#30363d] h-9">
              <input
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="bg-transparent text-[11px] font-semibold focus:outline-none text-gray-700 dark:text-gray-200 cursor-pointer h-full flex items-center"
              />
              <div className="flex items-center justify-center h-full px-1">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="bg-transparent text-[11px] font-semibold focus:outline-none text-gray-700 dark:text-gray-200 cursor-pointer h-full flex items-center"
              />
            </div>
            
            <div className="flex gap-1 bg-gray-50 dark:bg-[#161b22] p-1 rounded-lg border border-gray-200 dark:border-[#30363d]">
              {[1, 2, 3, 5].map(y => (
                <button
                  key={y}
                  onClick={() => onApplyPreset(y)}
                  className="px-2 py-0.5 text-[10px] font-black rounded transition-all hover:bg-white dark:hover:bg-[#30363d] text-gray-500 hover:text-gray-900 dark:hover:text-white"
                >
                  {y}Y
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden md:block h-10 w-px bg-gray-200 dark:bg-[#30363d]" />

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Bulk Add</span>
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-9 flex items-center bg-gray-50 dark:bg-[#161b22] rounded-lg border border-gray-200 dark:border-[#30363d] overflow-hidden">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={randomizeCount}
                  onChange={(e) => setRandomizeCount(parseInt(e.target.value) || 0)}
                  className="w-full bg-transparent text-xs font-bold text-gray-700 dark:text-gray-200 focus:outline-none text-center"
                />
                <div className="flex flex-col border-l border-gray-200 dark:border-[#30363d] h-full">
                  <button onClick={() => setRandomizeCount(prev => Math.min(prev + 10, 1000))} className="flex-1 px-1 hover:bg-gray-200 dark:hover:bg-[#30363d] flex items-center justify-center"><svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg></button>
                  <button onClick={() => setRandomizeCount(prev => Math.max(prev - 10, 1))} className="flex-1 px-1 hover:bg-gray-200 dark:hover:bg-[#30363d] border-t border-gray-200 dark:border-[#30363d] flex items-center justify-center"><svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
                </div>
              </div>
              <button
                onClick={onRandomize}
                disabled={isRandomizing}
                className="h-9 px-3 flex items-center justify-center bg-gray-900 dark:bg-white text-white dark:text-[#0d1117] text-[10px] font-black uppercase tracking-wider rounded-lg transition-all disabled:opacity-50 min-w-[80px]"
              >
                {isRandomizing ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Randomize'
                )}
              </button>
            </div>
          </div>

          <button
            onClick={onClear}
            className="mt-6 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
            title="Clear Grid"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
