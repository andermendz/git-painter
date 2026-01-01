
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Grid from './components/Grid';
import Toolbar from './components/Toolbar';
import { GridState, CommitLevel } from './types';
import { toDateKey } from './utils';

const App: React.FC = () => {
  const [gridState, setGridState] = useState<GridState>({});
  const [currentLevel, setCurrentLevel] = useState<CommitLevel>(3);
  const [randomizeCount, setRandomizeCount] = useState<number>(50);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  const [startDateStr, setStartDateStr] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return toDateKey(d);
  });
  const [endDateStr, setEndDateStr] = useState<string>(() => {
    return toDateKey(new Date());
  });

  const normalizedStartDate = useMemo(() => {
    if (!startDateStr) return new Date();
    const [y, m, d] = startDateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setHours(0, 0, 0, 0);
    return date;
  }, [startDateStr]);

  const normalizedEndDate = useMemo(() => {
    if (!endDateStr) return new Date();
    const [y, m, d] = endDateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setHours(23, 59, 59, 999);
    return date;
  }, [endDateStr]);

  // Determine the list of years to display based on the selected range
  const yearsToRender = useMemo(() => {
    if (isNaN(normalizedStartDate.getTime()) || isNaN(normalizedEndDate.getTime())) return [];
    
    const startYear = normalizedStartDate.getFullYear();
    const endYear = normalizedEndDate.getFullYear();
    const years = [];
    // Newer years on top (descending)
    for (let y = endYear; y >= startYear; y--) {
      years.push(y);
    }
    return years;
  }, [normalizedStartDate, normalizedEndDate]);

  const totalCommits = useMemo(() => {
    return Object.values(gridState).reduce((acc: number, curr: number) => acc + curr, 0);
  }, [gridState]);

  const updateCell = useCallback((dateKey: string, level: CommitLevel) => {
    setGridState(prev => {
      if (prev[dateKey] === level) return prev;
      return { ...prev, [dateKey]: level };
    });
  }, []);

  const handleCellClick = (dateKey: string) => {
    setGridState(prev => {
      const current = prev[dateKey] || 0;
      // Increment level, cycling back to 0 after 4
      const next = ((current + 1) % 5) as CommitLevel;
      return { ...prev, [dateKey]: next };
    });
  };

  const handleCellHover = (dateKey: string, isMouseDown: boolean) => {
    if (isMouseDown) {
      // When dragging, we apply the currently selected intensity level
      updateCell(dateKey, currentLevel);
    }
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all planned commits?")) {
      setGridState({});
    }
  };

  const handleRandomize = () => {
    if (isRandomizing) return;
    setIsRandomizing(true);
    
    // 1. Clear immediately and wait for the CSS transition (300ms) to complete
    // This ensures the previous pattern is fully gone before the new one starts "growing"
    setGridState({});
    
    const availableDates: string[] = [];
    let current = new Date(normalizedStartDate);
    while (current <= normalizedEndDate) {
      availableDates.push(toDateKey(current));
      current.setDate(current.getDate() + 1);
    }

    if (availableDates.length === 0) {
      setIsRandomizing(false);
      return;
    }

    const totalToApply = randomizeCount;
    const numBatches = 12;
    const growthDuration = 350; // ms for the "growing" part
    const clearDelay = 150; // ms for the initial fade out
    const batchSize = Math.ceil(totalToApply / numBatches);
    let batchesProcessed = 0;

    // Wait for the clear transition to finish (total duration will be ~500ms)
    setTimeout(() => {
      const interval = setInterval(() => {
        setGridState(prev => {
          const nextState = { ...prev };
          const startIdx = batchesProcessed * batchSize;
          const endIdx = Math.min(startIdx + batchSize, totalToApply);
          
          for (let i = startIdx; i < endIdx; i++) {
            const randomIndex = Math.floor(Math.random() * availableDates.length);
            const dateKey = availableDates[randomIndex];
            const currentLvl = nextState[dateKey] || 0;
            if (currentLvl < 4) {
              nextState[dateKey] = (currentLvl + 1) as CommitLevel;
            }
          }
          return nextState;
        });

        batchesProcessed++;
        if (batchesProcessed >= numBatches) {
          clearInterval(interval);
          setIsRandomizing(false);
        }
      }, growthDuration / numBatches);
    }, clearDelay);
  };

  const handleApplyPreset = (years: number) => {
    const end = new Date();
    const start = new Date();
    start.setFullYear(end.getFullYear() - years);
    setEndDateStr(toDateKey(end));
    setStartDateStr(toDateKey(start));
  };

  const [showPreview, setShowPreview] = useState(false);
  const [previewTab, setPreviewTab] = useState<'nodejs' | 'bash' | 'powershell'>('nodejs');

  const getCommitsData = useMemo(() => {
    return (Object.entries(gridState) as [string, CommitLevel][])
      .filter(([date, level]) => {
        const [y, m, d] = date.split('-').map(Number);
        const cellDate = new Date(y, m - 1, d);
        cellDate.setHours(0,0,0,0);
        const rangeStart = new Date(normalizedStartDate);
        rangeStart.setHours(0,0,0,0);
        const rangeEnd = new Date(normalizedEndDate);
        rangeEnd.setHours(23,59,59,999);
        return level > 0 && cellDate >= rangeStart && cellDate <= rangeEnd;
      })
      .map(([date, level]) => ({ date, count: level }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [gridState, normalizedStartDate, normalizedEndDate]);

  const generateNodeScript = () => {
    const commits = getCommitsData;
    return `/**
 * GitArt Contribution Script (Node.js)
 * Generated from GitArt Painter
 */
const moment = require("moment");
const simpleGit = require("simple-git");
const fs = require("fs");
const path = "./data.json";

const commits = ${JSON.stringify(commits, null, 2)};

async function run() {
  const git = simpleGit();
  console.log("🚀 Starting GitArt generation...");
  
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, JSON.stringify({}));
  }

  for (const commit of commits) {
    console.log(\`📅 Processing \${commit.date} (\${commit.count} commits)\`);
    for (let i = 0; i < commit.count; i++) {
      const date = moment(commit.date).add(i, 'minutes').format();
      const data = { date, salt: Math.random() };
      fs.writeFileSync(path, JSON.stringify(data));
      await git.add(path);
      await git.commit(date, { "--date": date });
    }
  }
  console.log("✨ GitArt completed! Remember to push your changes.");
}

run().catch(err => {
  console.error("❌ Error generating commits:", err);
});`;
  };

  const generateBashScript = () => {
    const commits = getCommitsData;
    let script = `#!/bin/bash
# GitArt Contribution Script (Bash)
# Generated from GitArt Painter

FILE="./data.json"
echo "🚀 Starting GitArt generation..."

if [ ! -f "$FILE" ]; then
    echo "{}" > "$FILE"
fi

`;
    commits.forEach(c => {
      script += `# Processing ${c.date} (${c.count} commits)\n`;
      for (let i = 0; i < c.count; i++) {
        const date = `${c.date} 12:${String(i).padStart(2, '0')}:00`;
        script += `echo '{"date": "${date}", "salt": "'$RANDOM'"}' > "$FILE"\n`;
        script += `git add "$FILE"\n`;
        script += `GIT_AUTHOR_DATE="${date}" GIT_COMMITTER_DATE="${date}" git commit -m "${date}" --date="${date}"\n`;
      }
      script += `\n`;
    });
    script += `echo "✨ GitArt completed! Remember to push your changes."\n`;
    return script;
  };

  const generatePowerShellScript = () => {
    const commits = getCommitsData;
    let script = `# GitArt Contribution Script (PowerShell)
# Generated from GitArt Painter

$file = "./data.json"
Write-Host "🚀 Starting GitArt generation..." -ForegroundColor Green

if (-not (Test-Path $file)) {
    "{}" | Out-File -FilePath $file -Encoding utf8
}

`;
    commits.forEach(c => {
      script += `# Processing ${c.date} (${c.count} commits)\n`;
      for (let i = 0; i < c.count; i++) {
        const date = `${c.date} 12:${String(i).padStart(2, '0')}:00`;
        script += `'{"date": "${date}", "salt": "' + (Get-Random) + '"}' | Out-File -FilePath $file -Encoding utf8\n`;
        script += `git add $file\n`;
        script += `$env:GIT_AUTHOR_DATE="${date}"; $env:GIT_COMMITTER_DATE="${date}"; git commit -m "${date}" --date="${date}"\n`;
      }
      script += `\n`;
    });
    script += `Write-Host "✨ GitArt completed! Remember to push your changes." -ForegroundColor Cyan\n`;
    return script;
  };

  const handleDownload = () => {
    let content = '';
    let filename = '';
    if (previewTab === 'nodejs') {
      content = generateNodeScript();
      filename = 'git-art-script.js';
    } else if (previewTab === 'bash') {
      content = generateBashScript();
      filename = 'git-art-script.sh';
    } else {
      content = generatePowerShellScript();
      filename = 'git-art-script.ps1';
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPreviewContent = () => {
    if (previewTab === 'nodejs') return generateNodeScript();
    if (previewTab === 'bash') return generateBashScript();
    return generatePowerShellScript();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getPreviewContent());
    alert("Script copied to clipboard!");
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col gap-8 max-w-7xl mx-auto transition-colors duration-300">
      {/* ... header and grids ... */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <svg className="w-10 h-10 text-[#39d353]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            GitArt Painter
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Design your contribution history with precision across multiple years.</p>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-[#30363d] border border-gray-200 dark:border-[#484f58] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#484f58] transition-all flex items-center gap-2 text-sm font-medium shadow-sm"
            title="Toggle Theme"
          >
            {theme === 'light' ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"/></svg>
                <span>Light Mode</span>
              </>
            )}
          </button>
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase font-black tracking-widest mb-1">Planned Commits</div>
            <div className="text-4xl font-mono text-[#39d353] font-bold drop-shadow-[0_0_8px_rgba(57,211,83,0.3)]">{totalCommits.toLocaleString()}</div>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {yearsToRender.map(year => (
          <Grid 
            key={year}
            year={year}
            gridState={gridState} 
            onCellClick={handleCellClick} 
            onCellHover={handleCellHover}
            globalStartDate={normalizedStartDate}
            globalEndDate={normalizedEndDate}
          />
        ))}
      </div>

      <Toolbar 
        currentLevel={currentLevel}
        setCurrentLevel={setCurrentLevel}
        onClear={handleClear}
        onRandomize={handleRandomize}
        isRandomizing={isRandomizing}
        randomizeCount={randomizeCount}
        setRandomizeCount={setRandomizeCount}
        startDate={startDateStr}
        endDate={endDateStr}
        onStartDateChange={setStartDateStr}
        onEndDateChange={setEndDateStr}
        onApplyPreset={handleApplyPreset}
      />

      <section className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-50 dark:bg-[#161b22] p-8 rounded-xl border border-gray-200 dark:border-[#30363d] shadow-sm">
          <h2 className="text-xl font-bold mb-5 text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-[#39d353]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Quick Guide
          </h2>
          <ul className="space-y-4 text-gray-600 dark:text-gray-400">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 dark:bg-[#30363d] text-gray-700 dark:text-white flex items-center justify-center text-xs font-bold">1</span>
              <div>
                <p className="text-gray-900 dark:text-white font-medium">Select Range</p>
                <p className="text-sm">Pick your start and end dates. Only these days will be painted.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 dark:bg-[#30363d] text-gray-700 dark:text-white flex items-center justify-center text-xs font-bold">2</span>
              <div>
                <p className="text-gray-900 dark:text-white font-medium">Draw Pattern</p>
                <p className="text-sm">Click or drag across the grids. Higher intensity = more commits per day.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 dark:bg-[#30363d] text-gray-700 dark:text-white flex items-center justify-center text-xs font-bold">3</span>
              <div>
                <p className="text-gray-900 dark:text-white font-medium">Preview & Run</p>
                <p className="text-sm">Preview the script for your platform (Node.js, Bash, or PowerShell) and run it.</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-gray-50 dark:bg-[#161b22] p-8 rounded-xl border border-gray-200 dark:border-[#30363d] flex flex-col justify-center items-center text-center shadow-sm">
          <div className="w-16 h-16 bg-[#238636]/10 dark:bg-[#238636]/20 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-[#39d353]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Export Your Design</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-8 max-w-sm leading-relaxed">
            Ready to transform your profile? Preview and download the automation script for your preferred platform.
          </p>
          <button
            onClick={() => setShowPreview(true)}
            disabled={totalCommits === 0}
            className="w-full flex items-center justify-center gap-3 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-[#0d1117] py-4 rounded-xl font-black text-lg transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            Preview Script
          </button>
        </div>
      </section>

      {/* Script Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161b22] w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 dark:border-[#30363d] flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-200 dark:border-[#30363d] flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-[#39d353]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                Script Preview
              </h3>
              <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div className="flex bg-gray-50 dark:bg-[#0d1117] p-1 gap-1 border-b border-gray-200 dark:border-[#30363d]">
              {(['nodejs', 'bash', 'powershell'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setPreviewTab(tab)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    previewTab === tab 
                      ? 'bg-white dark:bg-[#30363d] text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-[#484f58]' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  {tab === 'nodejs' ? 'Node.js' : tab === 'bash' ? 'Bash (Linux/Mac)' : 'PowerShell (Windows)'}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-[#0d1117] relative group">
              <pre className="text-xs font-mono text-gray-800 dark:text-gray-300 leading-relaxed whitespace-pre">
                {getPreviewContent()}
              </pre>
              <button 
                onClick={copyToClipboard}
                className="absolute top-4 right-4 p-2 bg-gray-200 dark:bg-[#30363d] rounded-lg text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-300 dark:hover:bg-[#484f58]"
                title="Copy to clipboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-1 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 13c-.77 1.333.192 3 1.732 3z"/></svg>
              </button>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-[#30363d] flex gap-4">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-[#0d1117] py-3 rounded-xl font-bold transition-all hover:opacity-90 active:scale-[0.98]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                Download .{previewTab === 'nodejs' ? 'js' : previewTab === 'bash' ? 'sh' : 'ps1'}
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="px-6 py-3 border border-gray-200 dark:border-[#30363d] rounded-xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#30363d] transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-auto py-12 text-center text-gray-500 dark:text-gray-600 text-xs border-t border-gray-200 dark:border-[#30363d] flex flex-col gap-2">
        <p>Built for developers. Inspired by the GitHub Contribution Graph.</p>
        <p className="opacity-50 italic">Note: Only intended for artistic use on private or dedicated repositories.</p>
      </footer>
    </div>
  );
};

export default App;
