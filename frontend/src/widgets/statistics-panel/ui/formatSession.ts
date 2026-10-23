export function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatDay(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: '2-digit',
  }).format(new Date(value));
}

export function formatRelative(
  value: string,
  t: (
    key:
      | 'statistics.justNow'
      | 'statistics.hoursAgo'
      | 'statistics.yesterday'
      | 'statistics.daysAgo',
    vars?: Record<string, string | number>,
  ) => string,
) {
  const date = new Date(value);
  const ms = Date.now() - date.getTime();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  if (hours < 1) return t('statistics.justNow');
  if (hours < 24) return t('statistics.hoursAgo', { count: hours });
  const days = Math.floor(hours / 24);
  if (days === 1) return t('statistics.yesterday');
  return t('statistics.daysAgo', { count: days });
}
