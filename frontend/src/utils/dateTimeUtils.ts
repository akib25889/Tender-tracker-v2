import { STANDARD_TIMEZONES } from '../types/tender';

/**
 * Combines date string with optional hour, minute, and timezone code into
 * an ISO-8601 compliant string with timezone offset (e.g. 2026-10-25T14:30:00+06:00).
 * If hour and minute are not specified, returns the clean date string (YYYY-MM-DD).
 */
export function combineDateTimeWithOffset(
  dateStr?: string,
  hourStr?: string,
  minuteStr?: string,
  timezoneCode: string = 'BST'
): string {
  if (!dateStr || !dateStr.trim()) return '';
  const cleanDate = dateStr.trim().split('T')[0].trim();
  if (!cleanDate) return '';

  const hasHour = hourStr !== undefined && hourStr !== null && hourStr !== '';
  const hasMinute = minuteStr !== undefined && minuteStr !== null && minuteStr !== '';

  if (!hasHour && !hasMinute) {
    return cleanDate;
  }

  const hh = hasHour ? String(hourStr).padStart(2, '0') : '00';
  const mm = hasMinute ? String(minuteStr).padStart(2, '0') : '00';

  const tz = STANDARD_TIMEZONES.find((t) => t.code === timezoneCode) || STANDARD_TIMEZONES[0];
  const offset = tz.offset; // e.g. "+06:00"

  return `${cleanDate}T${hh}:${mm}:00${offset}`;
}

/**
 * Parses any ISO datetime string or split date/time into its constituent parts:
 * date (YYYY-MM-DD), hour (00-23), minute (00-59), and timezone code (e.g. BST, UTC, EST).
 */
export function parseDateTimeParts(
  dateTimeStr?: string,
  fallbackTz: string = 'BST'
): { date: string; hour: string; minute: string; timezone: string } {
  if (!dateTimeStr || !dateTimeStr.trim()) {
    return { date: '', hour: '', minute: '', timezone: fallbackTz };
  }

  const trimmed = dateTimeStr.trim();

  // Match ISO standard: YYYY-MM-DDTHH:mm(:ss)?(Z|[+-]\d{2}(?::?\d{2})?)?
  const isoMatch = trimmed.match(
    /^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(?:([+-]\d{2}:?\d{2})|(Z))?)?/i
  );

  if (isoMatch) {
    const date = isoMatch[1] || '';
    const hour = isoMatch[2] !== undefined ? isoMatch[2] : '';
    const minute = isoMatch[3] !== undefined ? isoMatch[3] : '';
    const rawOffset = isoMatch[5] || (isoMatch[6] ? '+00:00' : '');

    let detectedTz = fallbackTz;
    if (rawOffset) {
      const normalizedOffset = rawOffset.includes(':')
        ? rawOffset
        : `${rawOffset.slice(0, 3)}:${rawOffset.slice(3)}`;
      const found = STANDARD_TIMEZONES.find((t) => t.offset === normalizedOffset);
      if (found) detectedTz = found.code;
    }

    return { date, hour, minute, timezone: detectedTz };
  }

  // Fallback: split by space or T
  const parts = trimmed.split(/[T ]+/);
  const date = parts[0] || '';
  let hour = '';
  let minute = '';
  if (parts[1]) {
    const timeParts = parts[1].split(':');
    if (timeParts[0]) hour = timeParts[0].padStart(2, '0');
    if (timeParts[1]) minute = timeParts[1].padStart(2, '0');
  }

  return { date, hour, minute, timezone: fallbackTz };
}

/**
 * Formats a clean human-readable time string: e.g. "14:30 BST"
 */
export function formatTimeDisplay(
  hourStr?: string,
  minuteStr?: string,
  timezoneCode?: string
): string {
  if (!hourStr && !minuteStr) return '';
  const hh = hourStr ? String(hourStr).padStart(2, '0') : '00';
  const mm = minuteStr ? String(minuteStr).padStart(2, '0') : '00';
  const tz = timezoneCode || 'BST';
  return `${hh}:${mm} ${tz}`;
}

