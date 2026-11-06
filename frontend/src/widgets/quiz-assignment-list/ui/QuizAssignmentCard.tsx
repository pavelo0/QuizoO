import type { QuizAssignmentSummary } from '@/entities/quiz-assignment';
import { useI18n } from '@/shared/i18n/useI18n';
import { Card, CardContent } from '@/shared/ui/card';
import { cn } from '@/shared/lib/utils';
import { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

type QuizAssignmentCardProps = {
  assignment: QuizAssignmentSummary;
};

function QuizAssignmentCardInner({ assignment }: QuizAssignmentCardProps) {
  const { locale, t } = useI18n();
  const navigate = useNavigate();
  const titleId = `assignment-title-${assignment.id}`;
  const href = `/app/assignments/${encodeURIComponent(assignment.id)}`;
  const deadline = new Date(assignment.deadline).toLocaleString(locale);

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
      <CardContent className="flex flex-col gap-3 px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <h3
            id={titleId}
            className="font-(family-name:--font-dm-sans) text-lg font-bold text-(--text-primary)"
          >
            {assignment.moduleTitle}
          </h3>
          <span className="font-(family-name:--font-syne) text-lg tracking-[0.18em] text-(--text-primary)">
            {assignment.code}
          </span>
        </div>
        <p className="text-sm text-(--text-secondary)">
          {assignment.closed
            ? t('assignments.closed')
            : t('assignments.deadlineUntil', { deadline })}
        </p>
        <p className="text-sm text-(--text-secondary)">
          {t('assignments.attemptCount', { count: assignment.attemptCount })}
        </p>
      </CardContent>
    </Card>
  );
}

export const QuizAssignmentCard = memo(QuizAssignmentCardInner);
QuizAssignmentCard.displayName = 'QuizAssignmentCard';
