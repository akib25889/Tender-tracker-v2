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

export interface DualDeadlineInfo {
  intlDisplay: string;         // e.g. "28 Sept 2026 (23:59 GMT)" or "28 Sept 2026 (17:59 UTC)"
  bdDisplay: string;           // e.g. "29 Sept 2026 (05:59 BST)" or "28 Sept 2026 (23:59 BST)"
  isPrimaryBd: boolean;        // true if the tender deadline was entered with BST (+06:00)
  tzCode: string;              // e.g. "GMT", "UTC", "BST", "EDT", etc.
  formattedCombined: string;   // e.g. "28 Sept 2026 (23:59 GMT) · 🇧🇩 BD: 29 Sept 2026 (05:59 BST)"
}

/**
 * Decomposes any deadline ISO string and computes BOTH:
 * 1. International / RFP Cutoff Time (in its native timezone, or UTC if primary is BST)
 * 2. Bangladesh Standard Time (BST / UTC+6)
 */
export function getDualDeadlineInfo(deadlineStr?: string): DualDeadlineInfo | null {
  if (!deadlineStr || !deadlineStr.trim()) return null;
  const trimmed = deadlineStr.trim();
  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return null;

  const parts = parseDateTimeParts(trimmed);
  const hasTime = Boolean(parts.hour);

  if (!hasTime) {
    const rawDateStr = parts.date ? new Date(parts.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    return {
      intlDisplay: rawDateStr || trimmed,
      bdDisplay: rawDateStr || trimmed,
      isPrimaryBd: true,
      tzCode: parts.timezone || 'BST',
      formattedCombined: rawDateStr || trimmed,
    };
  }

  // Bangladesh Time (BST / UTC+6) using standard Intl API
  const bdFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const bdParts = bdFormatter.formatToParts(d);
  const bdDay = bdParts.find((p) => p.type === 'day')?.value || '';
  const bdMonth = bdParts.find((p) => p.type === 'month')?.value || '';
  const bdYear = bdParts.find((p) => p.type === 'year')?.value || '';
  const bdHour = bdParts.find((p) => p.type === 'hour')?.value || '';
  const bdMinute = bdParts.find((p) => p.type === 'minute')?.value || '';
  const bdFormatted = `${bdDay} ${bdMonth} ${bdYear} (${bdHour}:${bdMinute} BST)`;

  const isPrimaryBd = parts.timezone === 'BST';

  if (isPrimaryBd) {
    // Primary is Bangladesh Time: Calculate UTC / International equivalent
    const utcFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'UTC',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const utcParts = utcFormatter.formatToParts(d);
    const uDay = utcParts.find((p) => p.type === 'day')?.value || '';
    const uMonth = utcParts.find((p) => p.type === 'month')?.value || '';
    const uYear = utcParts.find((p) => p.type === 'year')?.value || '';
    const uHour = utcParts.find((p) => p.type === 'hour')?.value || '';
    const uMinute = utcParts.find((p) => p.type === 'minute')?.value || '';
    const intlFormatted = `${uDay} ${uMonth} ${uYear} (${uHour}:${uMinute} UTC)`;

    return {
      intlDisplay: intlFormatted,
      bdDisplay: bdFormatted,
      isPrimaryBd: true,
      tzCode: 'BST',
      formattedCombined: `${bdFormatted}  ·  🌐 Int'l: ${intlFormatted}`,
    };
  } else {
    // Primary is International Timezone (e.g. GMT, UTC, WAT, EDT, etc.)
    const intlDateStr = parts.date ? new Date(parts.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const intlFormatted = `${intlDateStr} (${parts.hour}:${parts.minute || '00'} ${parts.timezone})`;

    return {
      intlDisplay: intlFormatted,
      bdDisplay: bdFormatted,
      isPrimaryBd: false,
      tzCode: parts.timezone,
      formattedCombined: `${intlFormatted}  ·  🇧🇩 BD Time: ${bdFormatted}`,
    };
  }
}


