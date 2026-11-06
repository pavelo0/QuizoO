import type { StudySetSummary } from '@/entities/study-set';
import { CreateStudySetDialog } from '@/features/manage-study-set';
import { useI18n } from '@/shared/i18n/useI18n';
import { EmptyState } from '@/shared/ui/empty-state';
import { PageHead } from '@/shared/ui/page-head';
import { StudySetCard } from './StudySetCard';

type StudySetListSectionProps = {
  sets: StudySetSummary[];
  loading: boolean;
  onCreated: (set: StudySetSummary) => void;
};

export function StudySetListSection({
  sets,
  loading,
  onCreated,
}: StudySetListSectionProps) {
  const { t } = useI18n();

  return (
    <section aria-labelledby="study-sets-heading" className="mb-12">
      <PageHead
        id="study-sets-heading"
        title={t('studySets.title')}
        subtitle={t('studySets.subtitle')}
        action={<CreateStudySetDialog onCreated={onCreated} />}
        className="mb-6"
      />
      {loading && sets.length === 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2].map((key) => (
            <div
              key={key}
              className="h-36 animate-pulse rounded-2xl bg-(--border-default)/50"
            />
          ))}
        </div>
      ) : sets.length === 0 ? (
        <EmptyState
          title={t('studySets.emptyTitle')}
          description={t('studySets.emptyDescription')}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {sets.map((set) => (
            <StudySetCard key={set.id} set={set} />
          ))}
        </div>
      )}
    </section>
  );
}
