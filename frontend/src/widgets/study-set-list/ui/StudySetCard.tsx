import type { StudySetSummary } from '@/entities/study-set';
import { useI18n } from '@/shared/i18n/useI18n';
import { Card, CardContent } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
import { cn } from '@/shared/lib/utils';
import { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

type StudySetCardProps = {
  set: StudySetSummary;
};

function StudySetCardInner({ set }: StudySetCardProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const titleId = `study-set-title-${set.id}`;
  const href = `/app/sets/${encodeURIComponent(set.id)}`;

  const open = useCallback(() => {
    void navigate(href);
  }, [href, navigate]);

  return (
    <Card
      role="link"
      tabIndex={0}
      aria-labelledby={titleId}
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open();
        }
      }}
      className={cn(
        'gap-0 rounded-[17px] border border-(--border-default) bg-(--surface-color) py-0 shadow-none ring-0',
        'cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_color-mix(in_srgb,var(--text-primary)_8%,transparent)]',
        'focus-visible:border-(--primary-accent) focus-visible:ring-2 focus-visible:ring-(--primary-accent)/25 focus-visible:outline-none',
      )}
    >
      <CardContent className="flex flex-col gap-4 px-5 py-5">
        <h3
          id={titleId}
          className="font-(family-name:--font-dm-sans) text-lg font-bold text-(--text-primary)"
        >
          {set.title}
        </h3>
        <div className="grid gap-2">
          <Progress
            value={set.progress}
            aria-label={t('studySets.progressLabel')}
          />
          <p className="text-sm text-(--text-secondary)">
            {set.moduleCount === 0
              ? t('studySets.progressEmpty')
              : t('studySets.progress', {
                  studied: set.studiedCount,
                  total: set.moduleCount,
                  percent: set.progress,
                })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export const StudySetCard = memo(StudySetCardInner);
StudySetCard.displayName = 'StudySetCard';
