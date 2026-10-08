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
  { id: 'dual', label: "Dhaka and UTC side by side", shortLabel: 'BD | UTC', badge: 'BD & UTC', offset: 6 },
  { id: 'local', label: 'Dhaka local time (BST)', shortLabel: 'Dhaka', badge: 'UTC+6', offset: 6 },
  { id: 'utc', label: 'Coordinated Universal Time (UTC / GMT)', shortLabel: 'UTC', badge: 'UTC+0', offset: 0 },
  { id: 'us_east', label: 'New York, US Eastern (EDT)', shortLabel: 'New York', badge: 'UTC-4', offset: -4 },
  { id: 'utc2', label: 'UTC+2 — Eastern Europe, Egypt, South Africa', shortLabel: 'UTC+2', badge: 'UTC+2', offset: 2 },
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
    try {
      const saved = localStorage.getItem('tender_clock_tz_mode') as TimezoneMode | null;
      return saved && ['dual', 'local', 'us_east', 'utc2', 'utc'].includes(saved) ? saved : 'dual';
    } catch {
      return 'dual';
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [now, setNow] = useState<Date>(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectMode = (newMode: TimezoneMode) => {
    setMode(newMode);
    try {
      localStorage.setItem('tender_clock_tz_mode', newMode);
    } catch {
      /* storage unavailable — the choice just won't persist */
    }
    setIsOpen(false);
  };

  const times: Record<TimezoneMode, string> = {
    dual: '',
    local: formatTime(now, 6, true),
    us_east: formatTime(now, -4, true),
    utc2: formatTime(now, 2, true),
    utc: formatTime(now, 0, true),
  };
  const active = TZ_OPTIONS.find((o) => o.id === mode) || TZ_OPTIONS[0];

  /** Zone initials are set in the label face; the time itself is mono and tabular. */
  const zone = (label: string, time: string) => (
    <span className="flex items-baseline gap-1">
      <span className="text-[10px] font-semibold tt-text-3">{label}</span>
      <span className="font-mono text-[11.5px] font-medium tt-text tt-num">{time}</span>
    </span>
  );

  return (
    <div className="relative hidden md:block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="tt-btn tt-focus gap-2 select-none"
        title="Change which clocks the header shows"
      >
        <Clock className="w-3.5 h-3.5 shrink-0 tt-text-3" />

        {mode === 'dual' ? (
          <span className="flex items-center gap-2">
            {zone('BD', formatTime(now, 6))}
            <span className="tt-text-3">·</span>
            {zone('UTC', formatTime(now, 0))}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            {zone(active.shortLabel, times[mode])}
            <span className="tt-tag">{active.badge}</span>
          </span>
        )}

        <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 tt-menu z-50 overflow-hidden" role="menu">
          <div className="tt-menu-head">
            <p className="text-xs font-medium tt-text flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Procurement clocks
            </p>
            <p className="text-[11px] tt-text-3 mt-0.5">
              Portal cutoffs are published in local time, so pick the pair you work against.
            </p>
          </div>

          <div className="py-1">
            {TZ_OPTIONS.map((opt) => {
              const isSelected = mode === opt.id;
              const sample =
                opt.id === 'dual'
                  ? `${formatTime(now, 6)} · ${formatTime(now, 0)}`
                  : formatTime(now, opt.offset, true);

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => selectMode(opt.id)}
                  role="menuitemradio"
                  aria-checked={isSelected}
                  className={`tt-menu-item justify-between ${isSelected ? 'is-selected' : ''}`}
                >
                  <span className="flex flex-col min-w-0">
                    <span className="text-[11.5px] leading-snug tt-truncate">{opt.label}</span>
                    <span className="font-mono text-[10px] tt-text-3 tt-num mt-0.5">{sample}</span>
                  </span>
                  <span className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="tt-tag">{opt.badge}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
