import React, { useState, useEffect, useRef } from 'react';
import { Clock, Globe, ChevronDown, Check } from 'lucide-react';

export type TimezoneMode = 'dual' | 'local' | 'us_east' | 'utc2' | 'utc';

interface TimezoneOption {
  id: TimezoneMode;
  label: string;
  shortLabel: string;
  badge: string;
  offset: number;
}

const TZ_OPTIONS: TimezoneOption[] = [
  { id: 'dual', label: 'Dual Clocks (Dhaka BD Time | UTC Int\'l)', shortLabel: 'BD | UTC', badge: 'BD & UTC', offset: 6 },
  { id: 'local', label: 'Dhaka Local (BST / BD Time)', shortLabel: 'Dhaka', badge: 'UTC+6', offset: 6 },
  { id: 'utc', label: 'Universal Time Coordinated (UTC / GMT Int\'l)', shortLabel: 'UTC', badge: 'UTC+0', offset: 0 },
  { id: 'us_east', label: 'New York / US Eastern (EDT)', shortLabel: 'New York', badge: 'UTC-4', offset: -4 },
  { id: 'utc2', label: 'UTC+2 (Eastern Europe / Egypt / South Africa)', shortLabel: 'UTC+2', badge: 'UTC+2', offset: 2 },
];

function formatTime(date: Date, offsetHours: number, withSeconds = false): string {
  const target = new Date(date.getTime() + offsetHours * 3600000);
  const h = String(target.getUTCHours()).padStart(2, '0');
  const m = String(target.getUTCMinutes()).padStart(2, '0');
  if (withSeconds) {
    const s = String(target.getUTCSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }
  return `${h}:${m}`;
}

export const HeaderClock: React.FC = () => {
  const [mode, setMode] = useState<TimezoneMode>(() => {
    const saved = localStorage.getItem('tender_clock_tz_mode') as TimezoneMode | null;
    return saved && ['dual', 'local', 'us_east', 'utc2', 'utc'].includes(saved) ? saved : 'dual';
  });
  const [isOpen, setIsOpen] = useState(false);
  const [now, setNow] = useState<Date>(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectMode = (newMode: TimezoneMode) => {
    setMode(newMode);
    localStorage.setItem('tender_clock_tz_mode', newMode);
    setIsOpen(false);
  };

  const dhakaTime = formatTime(now, 6, mode === 'local');
  const usEastTime = formatTime(now, -4, mode === 'us_east');
  const utc2Time = formatTime(now, 2, mode === 'utc2');
  const utcTime = formatTime(now, 0, mode === 'utc');

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Clock Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100/90 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors shadow-2xs cursor-pointer select-none"
        title="Switch timezone view (Dhaka BD Time UTC+6, Universal Time UTC/GMT, US Eastern EDT)"
      >
        <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />

        {mode === 'dual' && (
          <div className="flex items-center gap-1.5 font-mono text-[11.5px] tracking-tight">
            <span className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-0.5">
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-sans font-bold mr-0.5">BD</span>
              {dhakaTime}
            </span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-0.5">
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-sans font-bold mr-0.5">UTC</span>
              {utcTime}
            </span>
          </div>
        )}

        {mode === 'local' && (
          <div className="flex items-center gap-1 font-mono text-[11.5px] tracking-tight">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans font-medium">Dhaka</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">{dhakaTime}</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-sans font-bold">
              UTC+6
            </span>
          </div>
        )}

        {mode === 'us_east' && (
          <div className="flex items-center gap-1 font-mono text-[11.5px] tracking-tight">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans font-medium">New York</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">{usEastTime}</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-sans font-bold">
              EDT
            </span>
          </div>
        )}

        {mode === 'utc2' && (
          <div className="flex items-center gap-1 font-mono text-[11.5px] tracking-tight">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans font-medium">UTC+2</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">{utc2Time}</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-sans font-bold">
              EET/CAT
            </span>
          </div>
        )}

        {mode === 'utc' && (
          <div className="flex items-center gap-1 font-mono text-[11.5px] tracking-tight">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans font-medium">UTC</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">{utcTime}</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-sans font-bold">
              GMT
            </span>
          </div>
        )}

        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-64 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700/60">
            <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              Global Procurement Clocks
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-400">
              Select your preferred command center header time display
            </p>
          </div>

          <div className="py-1">
            {TZ_OPTIONS.map((opt) => {
              const isSelected = mode === opt.id;
              const liveSample =
                opt.id === 'dual'
                  ? `${formatTime(now, 6)} · ${formatTime(now, 0)}`
                  : opt.id === 'local'
                  ? formatTime(now, 6, true)
                  : opt.id === 'us_east'
                  ? formatTime(now, -4, true)
                  : opt.id === 'utc2'
                  ? formatTime(now, 2, true)
                  : formatTime(now, 0, true);

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => selectMode(opt.id)}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium leading-snug">{opt.label}</span>
                    <span className="font-mono text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">
                      {liveSample}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-mono">
                      {opt.badge}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

