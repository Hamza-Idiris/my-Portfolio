const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatDate = (value) => (value ? dateFormatter.format(new Date(value)) : '');

export const formatDateTime = (value) => (value ? dateTimeFormatter.format(new Date(value)) : '');

export const formatNumber = (value) => new Intl.NumberFormat('en-GB').format(value ?? 0);

const RELATIVE_UNITS = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function formatRelativeTime(value) {
  if (!value) return '';
  const seconds = (new Date(value).getTime() - Date.now()) / 1000;
  const absolute = Math.abs(seconds);

  if (absolute < 60) return 'just now';

  for (const [unit, unitSeconds] of RELATIVE_UNITS) {
    if (absolute >= unitSeconds) {
      return relativeFormatter.format(Math.round(seconds / unitSeconds), unit);
    }
  }
  return relativeFormatter.format(Math.round(seconds / 60), 'minute');
}
