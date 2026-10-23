import { Button } from '@/shared/ui/button';
import { Link } from 'react-router-dom';
import { useQuizStudy } from '../model/useQuizStudy';
import { QuizPlayView } from './QuizPlayView';
import { QuizResultView } from './QuizResultView';

export function QuizPlayer() {
  const study = useQuizStudy();
  const { t, loadState, moduleId, totalQuestions, session, currentQuestion } =
    study;

  if (loadState === 'loading') {
    return (
      <div
        className="flex min-h-[50vh] items-center justify-center text-sm text-(--text-secondary)"
        role="status"
        aria-live="polite"
        aria-busy
      >
        {t('quizStudy.loading')}
      </div>
    );
  }

  if (loadState === 'notfound' || loadState === 'wrongType') {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-(--text-secondary)">
          {loadState === 'wrongType'
            ? t('edit.common.wrongTypeQuiz')
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

  if (totalQuestions === 0) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-(--text-secondary)">
          {t('quizStudy.noQuestionsToStart')}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            asChild
            variant="outline"
            size="outlineCompact"
            className="rounded-xl"
          >
            <Link to={`/app/modules/${encodeURIComponent(moduleId)}/quiz-edit`}>
              {t('common.backToModule')}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (session) {
    return <QuizResultView study={study} />;
  }

  if (!currentQuestion) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-(--text-secondary)">
        {t('quizStudy.noQuestionsLoaded')}
      </div>
    );
  }

  return <QuizPlayView study={study} />;
}
