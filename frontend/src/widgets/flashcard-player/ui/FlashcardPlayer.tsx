import { Button } from '@/shared/ui/button';
import { Link } from 'react-router-dom';
import { useFlashcardStudy } from '../model/useFlashcardStudy';
import { FlashcardResultView } from './FlashcardResultView';
import { FlashcardStudyView } from './FlashcardStudyView';

export function FlashcardPlayer() {
  const study = useFlashcardStudy();
  const { t, loadState, moduleId, cards, allAnswered, currentCard } = study;

  if (loadState === 'loading') {
    return (
      <div
        className="flex min-h-[50vh] items-center justify-center text-sm text-(--text-secondary)"
        role="status"
        aria-live="polite"
        aria-busy
      >
        {t('flashStudy.loading')}
      </div>
    );
  }

  if (loadState === 'notfound' || loadState === 'wrongType') {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-(--text-secondary)">
          {loadState === 'wrongType'
            ? t('edit.common.wrongTypeFlash')
            : t('edit.common.moduleNotFound')}
        </p>
        <Button
          asChild
          className="mt-6 rounded-xl"
          variant="outline"
          size="outlineCompact"
        >
          <Link to="/app">{t('common.backToDashboard')}</Link>
        </Button>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-(--text-secondary)">
          {t('flashStudy.noCardsToStart')}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            asChild
            variant="outline"
            size="outlineCompact"
            className="rounded-xl"
          >
            <Link to={`/app/modules/${encodeURIComponent(moduleId)}/edit`}>
              {t('common.backToModule')}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (allAnswered) {
    return <FlashcardResultView study={study} />;
  }

  if (!currentCard) return null;

  return <FlashcardStudyView study={study} />;
}
