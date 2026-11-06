import { fetchStudySet, type StudySetDetail } from '@/entities/study-set';
import {
  AddModuleToSetDialog,
  DeleteStudySetButton,
  RemoveModuleFromSetButton,
  RenameStudySetDialog,
} from '@/features/manage-study-set';
import { useI18n } from '@/shared/i18n/useI18n';
import { apiErrorMessage } from '@/shared/lib/apiErrorMessage';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { PageHead } from '@/shared/ui/page-head';
import { Progress } from '@/shared/ui/progress';
import { ClipboardList, Layers } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type StudySetDetailViewProps = {
  setId: string;
};

function studyHref(moduleId: string, type: 'FLASHCARD' | 'QUIZ') {
  const id = encodeURIComponent(moduleId);
  return type === 'FLASHCARD'
    ? `/app/modules/${id}/flash-study`
    : `/app/modules/${id}/quiz-study`;
}

export function StudySetDetailView({ setId }: StudySetDetailViewProps) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<StudySetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setDetail(await fetchStudySet(setId));
    } catch (loadError) {
      setDetail(null);
      setError(apiErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [setId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !detail) {
    return (
      <p className="text-sm text-(--text-secondary)">{t('common.loading')}</p>
    );
  }

  if (!detail) {
    return (
      <div className="grid gap-4">
        <EmptyState
          title={t('studySets.notFound')}
          description={error ?? undefined}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => void navigate('/app')}
        >
          {t('common.backToDashboard')}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHead
        title={detail.title}
        subtitle={
          detail.moduleCount === 0
            ? t('studySets.progressEmpty')
            : t('studySets.progress', {
                studied: detail.studiedCount,
                total: detail.moduleCount,
                percent: detail.progress,
              })
        }
        action={
          <div className="flex flex-wrap gap-2">
            <RenameStudySetDialog
              setId={detail.id}
              title={detail.title}
              onRenamed={setDetail}
            />
            <DeleteStudySetButton
              setId={detail.id}
              title={detail.title}
              onDeleted={() => void navigate('/app')}
            />
          </div>
        }
      />
      <Progress
        value={detail.progress}
        className="mb-8"
        aria-label={t('studySets.progressLabel')}
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-(family-name:--font-syne) text-xl font-extrabold">
          {t('studySets.modulesHeading')}
        </h2>
        <AddModuleToSetDialog
          setId={detail.id}
          memberIds={detail.modules.map((module) => module.id)}
          onAdded={setDetail}
        />
      </div>
      {detail.modules.length === 0 ? (
        <EmptyState
          title={t('studySets.progressEmpty')}
          description={t('studySets.addModuleHint')}
        />
      ) : (
        <ul className="grid gap-3">
          {detail.modules.map((module) => {
            const isFlash = module.type === 'FLASHCARD';
            return (
              <li
                key={module.id}
                className="flex flex-col gap-3 rounded-[17px] border border-(--border-default) bg-(--surface-color) px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-(--text-primary)">
                    {module.title}
                  </p>
                  <p className="mt-1 text-sm text-(--text-secondary)">
                    {isFlash
                      ? t('modules.moduleTypeFlashcards')
                      : t('modules.moduleTypeQuiz')}
                    {' · '}
                    {module.studied
                      ? t('studySets.studied')
                      : t('studySets.notStudied')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={isFlash ? 'cta' : 'quiz'}
                    size="outlineCompact"
                    asChild
                  >
                    <Link to={studyHref(module.id, module.type)}>
                      {isFlash ? (
                        <Layers
                          className="size-4"
                          strokeWidth={2}
                          aria-hidden
                        />
                      ) : (
                        <ClipboardList
                          className="size-4"
                          strokeWidth={2}
                          aria-hidden
                        />
                      )}
                      {isFlash
                        ? t('modules.studyFlashcards')
                        : t('modules.startQuiz')}
                    </Link>
                  </Button>
                  <RemoveModuleFromSetButton
                    setId={detail.id}
                    moduleId={module.id}
                    onRemoved={setDetail}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <Button
        type="button"
        variant="ghost"
        className="mt-8"
        onClick={() => void navigate('/app')}
      >
        {t('common.backToDashboard')}
      </Button>
    </div>
  );
}
