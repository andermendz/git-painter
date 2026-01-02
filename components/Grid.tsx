
import React, { useState, useEffect, useMemo } from 'react';
import { CommitLevel, GridState } from '../types';
import { LEVEL_COLORS, LEVEL_HOVER_COLORS, MONTHS, GRID_DAYS } from '../constants';
import { toDateKey } from '../utils';

interface GridProps {
  gridState: GridState;
  onCellClick: (date: string) => void;
  onCellHover: (date: string, isMouseDown: boolean) => void;
  year: number;
  globalStartDate: Date;
  globalEndDate: Date;
}

const Grid: React.FC<GridProps> = ({ gridState, onCellClick, onCellHover, year, globalStartDate, globalEndDate }) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  
  // Always show the full year grid
  const gridStart = new Date(year, 0, 1);
  const startDay = gridStart.getDay();
  gridStart.setDate(gridStart.getDate() - startDay);

  const numWeeks = 53;
  const weeks = Array.from({ length: numWeeks }, (_, i) => i);

  useEffect(() => {
    const handleMouseUp = () => setIsMouseDown(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const hasAnyVisibleCells = useMemo(() => {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);
    return start <= globalEndDate && end >= globalStartDate;
  }, [year, globalStartDate, globalEndDate]);

  const getMonthLabel = (weekIndex: number) => {
    const weekStart = new Date(gridStart);
    weekStart.setDate(weekStart.getDate() + (weekIndex * 7));
    
    const nextWeekStart = new Date(weekStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);

    // If it's the very first week, and it contains Jan 1st, show Jan
    if (weekIndex === 0) {
      const jan1 = new Date(year, 0, 1);
      if (jan1 >= weekStart && jan1 < nextWeekStart) {
        return MONTHS[0];
      }
      // If the week starts in Dec of previous year but contains Jan 1st, we still show Jan
      return MONTHS[0];
    }

    for (let m = 0; m < 12; m++) {
      const monthStart = new Date(year, m, 1);
      if (monthStart >= weekStart && monthStart < nextWeekStart) {
        return MONTHS[m];
      }
    }
    return null;
  };

  const renderCells = () => {
    return weeks.map(w => {
      const weekDate = new Date(gridStart);
      weekDate.setDate(weekDate.getDate() + (w * 7));
      
      const days = [];
      for (let d = 0; d < GRID_DAYS; d++) {
        const dateObj = new Date(weekDate);
        dateObj.setDate(dateObj.getDate() + d);
        
        const dateKey = toDateKey(dateObj);
        const level = gridState[dateKey] || 0;

        const isWithinGlobalRange = dateObj >= globalStartDate && dateObj <= globalEndDate;
        const isWithinYear = dateObj.getFullYear() === year;
        
        // Accurate with date range: only highlight/allow painting on dates within the range
        // But show the rest of the year as dimmed/non-interactive placeholders
        const isActive = isWithinGlobalRange && isWithinYear;
        const isVisibleInYear = isWithinYear;

        days.push(
          <div
            key={dateKey}
            onMouseDown={() => {
              if (!isActive) return;
              setIsMouseDown(true);
              onCellClick(dateKey);
            }}
            onMouseEnter={() => {
              if (!isActive) return;
              onCellHover(dateKey, isMouseDown);
            }}
            className={`w-[10px] h-[10px] rounded-[2px] transition-all duration-150 ease-out box-border
              ${isActive 
                ? `${LEVEL_COLORS[level]} cursor-pointer hover:ring-1 hover:ring-blue-500 hover:ring-offset-1 dark:hover:ring-offset-[#0d1117] z-10 ${level === 0 ? 'outline outline-1 outline-[#1b1f230f] dark:outline-[#ffffff0d]' : ''}` 
                : isVisibleInYear
                  ? `bg-gray-100 dark:bg-[#161b22] opacity-20 cursor-not-allowed`
                  : 'bg-transparent border-none pointer-events-none opacity-0'
              }
            `}
            title={isActive ? `${dateKey}: ${level} commits` : isVisibleInYear ? `${dateKey} (Outside Range)` : ''}
          />
        );
      }

      return (
        <div key={w} className="flex flex-col gap-[2px] w-[10px]">
          {days}
        </div>
      );
    });
  };

  if (!hasAnyVisibleCells) return null;

  return (
    <div className="flex flex-col gap-1.5 w-full select-none">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[11px] font-black uppercase text-gray-400 tracking-wider">{year}</h3>
      </div>
      
      <div className="bg-white dark:bg-[#0d1117] p-4 rounded-lg border border-gray-200 dark:border-[#30363d] w-fit mx-auto max-w-full">
        <div className="flex gap-2">
          {/* Day Labels */}
          <div className="flex flex-col gap-[2px] pt-[18px] text-[9px] text-gray-400 dark:text-gray-500 font-medium">
            <div className="h-[10px] flex items-center"></div>
            <div className="h-[10px] flex items-center">Mon</div>
            <div className="h-[10px] flex items-center"></div>
            <div className="h-[10px] flex items-center">Wed</div>
            <div className="h-[10px] flex items-center"></div>
            <div className="h-[10px] flex items-center">Fri</div>
            <div className="h-[10px] flex items-center"></div>
          </div>

          {/* Scrollable Grid Area */}
          <div className="overflow-x-auto custom-scrollbar pb-3">
            <div className="min-w-max">
               {/* Month Labels Row */}
               <div className="flex mb-1.5 gap-[2px] h-3">
                  {weeks.map(w => (
                    <div key={w} className="w-[10px] text-[9px] text-gray-400 dark:text-gray-500 font-bold relative h-full">
                       {(() => {
                         const label = getMonthLabel(w);
                         return label ? <span className="absolute left-0 bottom-0 whitespace-nowrap uppercase tracking-tighter">{label.substring(0, 3)}</span> : null;
                       })()}
                    </div>
                  ))}
               </div>

               {/* Cells Grid */}
               <div className="flex gap-[2px]">
                  {renderCells()}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Grid;
