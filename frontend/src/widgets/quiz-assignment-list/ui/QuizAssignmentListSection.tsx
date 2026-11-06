import type { ModuleListItem } from '@/entities/module';
import type { QuizAssignmentSummary } from '@/entities/quiz-assignment';
import {
  CreateQuizAssignmentDialog,
  JoinQuizAssignmentDialog,
} from '@/features/manage-quiz-assignment';
import { useI18n } from '@/shared/i18n/useI18n';
import { EmptyState } from '@/shared/ui/empty-state';
import { PageHead } from '@/shared/ui/page-head';
import { QuizAssignmentCard } from './QuizAssignmentCard';

type QuizAssignmentListSectionProps = {
  assignments: QuizAssignmentSummary[];
  modules: ModuleListItem[];
  loading: boolean;
};

export function QuizAssignmentListSection({
  assignments,
  modules,
  loading,
}: QuizAssignmentListSectionProps) {
  const { t } = useI18n();

  return (
    <section aria-labelledby="quiz-assignments-heading" className="mb-12">
      <PageHead
        id="quiz-assignments-heading"
        title={t('assignments.title')}
        subtitle={t('assignments.subtitle')}
        action={
          <div className="flex flex-wrap gap-2">
            <JoinQuizAssignmentDialog />
            <CreateQuizAssignmentDialog modules={modules} />
          </div>
        }
        className="mb-6"
      />
      {loading && assignments.length === 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2].map((key) => (
            <div
              key={key}
              className="h-32 animate-pulse rounded-2xl bg-(--border-default)/50"
            />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState
          title={t('assignments.emptyTitle')}
          description={t('assignments.emptyDescription')}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {assignments.map((assignment) => (
            <QuizAssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      )}
    </section>
  );
}
