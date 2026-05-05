import {
  fetchModuleList,
  fetchModulesDashboardSummary,
  fetchRecentModuleActivity,
} from '@/lib/api/modules';
import { apiErrorMessage } from '@/lib/apiErrorMessage';
import type {
  ModuleListItem,
  ModuleSessionActivity,
  QuizSessionActivity,
} from '@/types/module';
import { useCallback, useEffect, useMemo, useState } from 'react';

const MAX_ACTIVITY_ITEMS = 120;
const DAY_MS = 24 * 60 * 60 * 1000;

export type SessionsRange = '7d' | '30d' | 'all';

function startOfDay(input: Date) {
  return new Date(input.getFullYear(), input.getMonth(), input.getDate());
}

function rangeCutoff(range: SessionsRange) {
  if (range === 'all') return null;
  const now = new Date();
  const days = range === '7d' ? 7 : 30;
  return new Date(now.getTime() - days * DAY_MS);
}

function toQuizSessions(items: ModuleSessionActivity[]): QuizSessionActivity[] {
  return items.filter((row): row is QuizSessionActivity => {
    return row.kind === 'QUIZ_SESSION';
  });
}

function computeStreak(items: ModuleSessionActivity[]) {
  if (items.length < 1) return 0;
  const uniqueDays = Array.from(
    new Set(items.map((row) => startOfDay(new Date(row.at)).getTime())),
  ).sort((a, b) => b - a);
  if (uniqueDays.length < 1) return 0;

  let streak = 0;
  let prev = startOfDay(new Date()).getTime();
  if (uniqueDays[0] !== prev && uniqueDays[0] !== prev - DAY_MS) return 0;

  for (const day of uniqueDays) {
    if (day === prev || day === prev - DAY_MS) {
      streak += 1;
      prev = day;
      continue;
    }
    break;
  }
  return streak;
}

export function useSessions() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('all');
  const [selectedRange, setSelectedRange] = useState<SessionsRange>('30d');
  const [sessions, setSessions] = useState<ModuleSessionActivity[]>([]);
  const [modules, setModules] = useState<ModuleListItem[]>([]);
  const [summary, setSummary] = useState<Awaited<
    ReturnType<typeof fetchModulesDashboardSummary>
  > | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [activity, stats, moduleList] = await Promise.all([
        fetchRecentModuleActivity(MAX_ACTIVITY_ITEMS),
        fetchModulesDashboardSummary(),
        fetchModuleList(),
      ]);
      setSessions(activity);
      setSummary(stats);
      setModules(moduleList);
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const filteredSessions = useMemo(() => {
    const cutoff = rangeCutoff(selectedRange);
    return sessions.filter((session) => {
      if (selectedModuleId !== 'all' && session.moduleId !== selectedModuleId) {
        return false;
      }
      if (cutoff && new Date(session.at) < cutoff) {
        return false;
      }
      return true;
    });
  }, [selectedModuleId, selectedRange, sessions]);

  const quizSessions = useMemo(
    () => toQuizSessions(filteredSessions),
    [filteredSessions],
  );

  const averageQuizScore = useMemo(() => {
    if (quizSessions.length < 1) return null;
    const avg =
      quizSessions.reduce((acc, row) => acc + row.scorePercent, 0) /
      quizSessions.length;
    return Math.round(avg * 10) / 10;
  }, [quizSessions]);

  const cardsStudied = useMemo(() => {
    if (selectedRange === 'all' && selectedModuleId === 'all') {
      return summary?.cardsStudied ?? 0;
    }
    return filteredSessions.reduce((acc, row) => {
      if (row.kind !== 'FLASHCARD_SESSION') return acc;
      return acc + row.totalCards;
    }, 0);
  }, [
    filteredSessions,
    selectedModuleId,
    selectedRange,
    summary?.cardsStudied,
  ]);

  const streakDays = useMemo(() => computeStreak(sessions), [sessions]);

  const quizSeries = useMemo(() => {
    const grouped = new Map<
      string,
      { total: number; count: number; timestamp: number }
    >();

    for (const row of quizSessions) {
      const d = new Date(row.at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const prev = grouped.get(key);
      const timestamp = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
      ).getTime();
      if (!prev) {
        grouped.set(key, { total: row.scorePercent, count: 1, timestamp });
      } else {
        grouped.set(key, {
          total: prev.total + row.scorePercent,
          count: prev.count + 1,
          timestamp,
        });
      }
    }

    return Array.from(grouped.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .map(([date, value]) => ({
        date,
        score: Math.round((value.total / value.count) * 10) / 10,
      }));
  }, [quizSessions]);

  const modulePerformance = useMemo(() => {
    const byModule = new Map<
      string,
      {
        moduleId: string;
        moduleTitle: string;
        sessions: number;
        bestScore: number | null;
        lastStudiedAt: string;
      }
    >();

    for (const row of filteredSessions) {
      const prev = byModule.get(row.moduleId);
      const score = row.kind === 'QUIZ_SESSION' ? row.scorePercent : null;
      if (!prev) {
        byModule.set(row.moduleId, {
          moduleId: row.moduleId,
          moduleTitle: row.moduleTitle,
          sessions: 1,
          bestScore: score,
          lastStudiedAt: row.at,
        });
      } else {
        byModule.set(row.moduleId, {
          ...prev,
          sessions: prev.sessions + 1,
          bestScore:
            score == null
              ? prev.bestScore
              : prev.bestScore == null
                ? score
                : Math.max(prev.bestScore, score),
          lastStudiedAt:
            new Date(row.at) > new Date(prev.lastStudiedAt)
              ? row.at
              : prev.lastStudiedAt,
        });
      }
    }

    return Array.from(byModule.values()).sort(
      (a, b) => b.sessions - a.sessions,
    );
  }, [filteredSessions]);

  const cardsToReview = useMemo(() => {
    const weakestByModule = new Map<string, QuizSessionActivity>();
    for (const row of quizSessions) {
      const prev = weakestByModule.get(row.moduleId);
      if (!prev || row.scorePercent < prev.scorePercent) {
        weakestByModule.set(row.moduleId, row);
      }
    }

    return [...weakestByModule.values()]
      .sort((a, b) => a.scorePercent - b.scorePercent)
      .slice(0, 4)
      .map((row) => {
        const mistakes = Math.max(0, row.totalQuestions - row.correctCount);
        return {
          id: `${row.moduleId}-${row.at}`,
          moduleTitle: row.moduleTitle,
          mistakes,
          moduleId: row.moduleId,
        };
      });
  }, [quizSessions]);

  return {
    loading,
    error,
    reload,
    modules,
    sessions,
    summary,
    selectedModuleId,
    setSelectedModuleId,
    selectedRange,
    setSelectedRange,
    filteredSessions,
    stats: {
      totalSessions: filteredSessions.length,
      cardsStudied,
      averageQuizScore,
      streakDays,
    },
    quizSeries,
    modulePerformance,
    cardsToReview,
  };
}
