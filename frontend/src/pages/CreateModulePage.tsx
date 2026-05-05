import { Button } from '@/components/ui/button';
import { getOrCreateQuizDraftId } from '@/lib/quizModuleDraft';
import { getOrCreateFlashcardDraftId } from '@/lib/flashcardModuleDraft';
import { useI18n } from '@/i18n/useI18n';
import type { ModuleType } from '@/types/module';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

type Phase = 'working' | 'error';

/**
 * Старт сценария «новый модуль»: по типу создаёт черновик и ведёт
 * на соответствующую страницу редактирования.
 */
const CreateModulePage = () => {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const raw = (params.get('type') || '').toUpperCase();
  const type = (
    raw === 'QUIZ' || raw === 'FLASHCARD' ? raw : null
  ) as ModuleType | null;
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('working');

  const goCreate = useCallback(async () => {
    if (!type) return;
    try {
      const id =
        type === 'FLASHCARD'
          ? await getOrCreateFlashcardDraftId()
          : await getOrCreateQuizDraftId();
      const target =
        type === 'FLASHCARD'
          ? `/app/modules/${id}/edit`
          : `/app/modules/${id}/quiz-edit`;
      void navigate(target, { replace: true });
    } catch {
      setPhase('error');
      toast.error(t('createModule.toastCreateFailed'));
    }
  }, [navigate, t, type]);

  useEffect(() => {
    if (!type) return;
    const t = window.setTimeout(() => {
      void goCreate();
    }, 0);
    return () => window.clearTimeout(t);
  }, [type, goCreate]);

  if (type === null) {
    return (
      <div className="mx-auto max-w-lg">
        <p className="text-sm text-(--text-secondary)">
          {t('createModule.invalidType')}
        </p>
        <Button
          asChild
          variant="outline"
          className="mt-6 rounded-xl"
          size="outlineCompact"
        >
          <Link to="/app">{t('common.backToDashboard')}</Link>
        </Button>
      </div>
    );
  }

  if (phase === 'error' && type) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <h1 className="font-(family-name:--font-syne) text-2xl font-bold text-(--text-primary)">
          {t('createModule.couldNotStart')}
        </h1>
        <p className="mt-2 text-sm text-(--text-secondary)">
          {t('createModule.couldNotCreate')}
        </p>
        <Button
          type="button"
          variant="cta"
          className="mt-6 rounded-xl"
          size="outlineCompact"
          onClick={() => {
            setPhase('working');
            void goCreate();
          }}
        >
          {t('createModule.tryAgain')}
        </Button>
        <div className="mt-3">
          <Button asChild variant="ghost" size="sm" className="rounded-xl">
            <Link to="/app">{t('common.backToDashboard')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-(--text-secondary)"
      role="status"
      aria-live="polite"
    >
      <div
        className="size-9 animate-spin rounded-full border-2 border-(--border-default) border-t-(--primary-accent)"
        aria-hidden
      />
      <p className="text-sm">
        {t('createModule.creating', {
          kind:
            type === 'QUIZ'
              ? t('createModule.kindQuiz')
              : t('createModule.kindFlashcard'),
        })}
      </p>
    </div>
  );
};

export default CreateModulePage;
