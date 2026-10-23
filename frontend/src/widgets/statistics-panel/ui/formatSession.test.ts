import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatDate, formatRelative } from './formatSession';
import { tStub } from '@/shared/test/tStub';

describe('formatSession', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('показывает относительное время', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T12:00:00.000Z'));

    expect(formatRelative('2026-06-01T11:40:00.000Z', tStub)).toBe(
      'statistics.justNow',
    );
    expect(formatRelative('2026-06-01T09:00:00.000Z', tStub)).toContain(
      'statistics.hoursAgo',
    );
    expect(formatRelative('2026-05-31T10:00:00.000Z', tStub)).toBe(
      'statistics.yesterday',
    );
    expect(formatRelative('2026-05-28T12:00:00.000Z', tStub)).toContain(
      'statistics.daysAgo',
    );
  });

  it('форматирует дату в локали', () => {
    expect(formatDate('2026-06-01T12:30:00.000Z', 'en-US')).toEqual(
      expect.any(String),
    );
  });
});
