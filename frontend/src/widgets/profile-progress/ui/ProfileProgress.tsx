import {
  fetchExperienceProfile,
  type AchievementId,
  type ExperienceProfile,
} from '@/entities/experience';
import { useI18n } from '@/shared/i18n/useI18n';
import { apiErrorMessage } from '@/shared/lib/apiErrorMessage';
import { cn } from '@/shared/lib/utils';
import { useEffect, useState } from 'react';
import { AchievementMark } from './AchievementMark';

const ACHIEVEMENT_ORDER: AchievementId[] = [
  'first-flashcard',
  'first-quiz',
  'first-retry',
  'first-assignment',
  'first-set',
  'five-studies',
  'perfect-quiz',
  'set-complete',
];

export function ProfileProgress() {
  const { t } = useI18n();
  const [profile, setProfile] = useState<ExperienceProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchExperienceProfile()
      .then((next) => {
        if (!cancelled) setProfile(next);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(apiErrorMessage(loadError));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <p className="text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (!profile) {
    return (
      <p className="text-sm text-(--text-secondary)" role="status">
        {t('common.loading')}
      </p>
    );
  }

  const byId = new Map(profile.achievements.map((item) => [item.id, item]));
  const width =
    profile.xpForLevel > 0
      ? Math.round((profile.xpIntoLevel / profile.xpForLevel) * 100)
      : 0;

  return (
    <section
      aria-labelledby="profile-progress-title"
      className="rounded-3xl border border-(--border-default) bg-(--surface-color) p-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-(--text-secondary)">
            {t('progress.levelLabel')}
          </p>
          <h2
            id="profile-progress-title"
            className="font-(family-name:--font-syne) text-4xl font-extrabold tracking-[-0.04em]"
          >
            {profile.level}
          </h2>
        </div>
        <p className="text-sm text-(--text-secondary)">
          {t('progress.xpTotal', { xp: profile.xp })}
        </p>
      </div>
      <div
        className="mt-4 h-2 overflow-hidden rounded-full bg-(--border-default)"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={profile.xpForLevel}
        aria-valuenow={profile.xpIntoLevel}
        aria-label={t('progress.levelBar')}
      >
        <div
          className="h-full rounded-full bg-(--primary-accent)"
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-(--text-secondary)">
        {t('progress.levelHint', {
          into: profile.xpIntoLevel,
          span: profile.xpForLevel,
        })}
      </p>
      <h3 className="mt-6 font-(family-name:--font-syne) text-lg font-bold">
        {t('progress.achievements')}
      </h3>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {ACHIEVEMENT_ORDER.map((id) => {
          const item = byId.get(id);
          const earned = item?.earned ?? false;
          return (
            <li
              key={id}
              className={cn(
                'flex gap-3 rounded-2xl border border-(--border-default) bg-(--bg-color) p-3',
                !earned && 'opacity-80',
              )}
            >
              <AchievementMark id={id} earned={earned} />
              <div className="min-w-0">
                <p className="font-semibold text-(--text-primary)">
                  {t(`progress.achievements.${id}.title`)}
                </p>
                <p className="text-sm text-(--text-secondary)">
                  {t(`progress.achievements.${id}.hint`)}
                </p>
                <p className="mt-1 text-xs text-(--text-secondary)">
                  {earned
                    ? t('progress.earned')
                    : t('progress.progressCount', {
                        current: item?.current ?? 0,
                        target: item?.target ?? 1,
                      })}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
