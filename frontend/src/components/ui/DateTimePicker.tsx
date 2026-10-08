import React from 'react';
import { Calendar, Clock, Globe } from 'lucide-react';
import { STANDARD_TIMEZONES, STANDARD_HOURS, STANDARD_MINUTES } from '../../types/tender';

interface DateTimePickerProps {
  label: string;
  sublabel?: string;
  dateValue: string;
  hourValue: string;
  minuteValue: string;
  timezoneValue: string;
  onDateChange: (val: string) => void;
  onHourChange: (val: string) => void;
  onMinuteChange: (val: string) => void;
  onTimezoneChange: (val: string) => void;
  className?: string;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  label,
  sublabel,
  dateValue,
  hourValue,
  minuteValue,
  timezoneValue,
  onDateChange,
  onHourChange,
  onMinuteChange,
  onTimezoneChange,
  className = '',
}) => {
  const selectedTz = STANDARD_TIMEZONES.find((t) => t.code === (timezoneValue || 'BST')) || STANDARD_TIMEZONES[0];

  const hasTime = (hourValue !== '' && hourValue !== undefined) || (minuteValue !== '' && minuteValue !== undefined);
  const formattedTimeDisplay = hasTime
    ? `${hourValue ? String(hourValue).padStart(2, '0') : '00'}:${minuteValue ? String(minuteValue).padStart(2, '0') : '00'} ${selectedTz.code}`
    : '';

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[var(--text-primary)]">
          {label}
        </label>
        {dateValue && (
          <span className="text-[11px] font-mono text-[var(--accent)]">
            {dateValue} {formattedTimeDisplay && `@ ${formattedTimeDisplay}`}
          </span>
        )}
      </div>
      {sublabel && (
        <p className="text-[11px] text-[var(--text-secondary)]">{sublabel}</p>
      )}

      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
        {/* Date Selector - Shorter and Compact */}
        <div className="w-full sm:w-[145px] shrink-0 relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[var(--text-muted)]">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <input
            type="date"
            value={dateValue || ''}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full pl-8 pr-2 py-1.5 bg-[var(--bg-subtle)] border border-[var(--border-strong)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-colors"
          />
        </div>

        {/* Hour Selector */}
        <div className="w-[calc(50%-4px)] sm:w-[72px] shrink-0 relative">
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-[var(--text-muted)]">
            <Clock className="w-3 h-3" />
          </div>
          <select
            value={hourValue || ''}
            onChange={(e) => onHourChange(e.target.value)}
            className="w-full pl-6 pr-1.5 py-1.5 bg-[var(--bg-subtle)] border border-[var(--border-strong)] rounded-lg text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-colors cursor-pointer"
            title="Hour (00-23)"
          >
            <option value="">HH</option>
            {STANDARD_HOURS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>

        {/* Minute Selector */}
        <div className="w-[calc(50%-4px)] sm:w-[62px] shrink-0">
          <select
            value={minuteValue || ''}
            onChange={(e) => onMinuteChange(e.target.value)}
            className="w-full px-2 py-1.5 bg-[var(--bg-subtle)] border border-[var(--border-strong)] rounded-lg text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-colors cursor-pointer"
            title="Minute (00-59)"
          >
            <option value="">MM</option>
            {STANDARD_MINUTES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Timezone Selector - Maximally Wide */}
        <div className="w-full sm:flex-1 min-w-0 relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[var(--text-muted)]">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <select
            value={timezoneValue || 'BST'}
            onChange={(e) => onTimezoneChange(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 bg-[var(--bg-subtle)] border border-[var(--border-strong)] rounded-lg text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] transition-colors truncate cursor-pointer"
            title={`${selectedTz.label} (${selectedTz.offset})`}
          >
            {STANDARD_TIMEZONES.map((tz) => (
              <option key={tz.code} value={tz.code} title={tz.label}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

