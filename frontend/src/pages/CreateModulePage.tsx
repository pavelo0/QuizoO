import { Button } from '@/components/ui/button';
import { getOrCreateFlashcardDraftId } from '@/lib/flashcardModuleDraft';
import type { ModuleType } from '@/types/module';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

type Phase = 'working' | 'error';

/**
 * Старт сценария «новый модуль»: по типу создаёт черновик (флешкарточки) и ведёт на
 * страницу редактирования, либо показывает заглушку для квиза.
 */
const CreateModulePage = () => {
  const [params] = useSearchParams();
  const raw = (params.get('type') || '').toUpperCase();
  const type = (
    raw === 'QUIZ' || raw === 'FLASHCARD' ? raw : null
  ) as ModuleType | null;
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('working');

  const goFlash = useCallback(async () => {
    try {
      const id = await getOrCreateFlashcardDraftId();
      void navigate(`/app/modules/${id}/edit`, { replace: true });
    } catch {
      setPhase('error');
      toast.error('Could not create a module. Try again.');
    }
  }, [navigate]);

  useEffect(() => {
    if (type !== 'FLASHCARD') return;
    const t = window.setTimeout(() => {
      void goFlash();
    }, 0);
    return () => window.clearTimeout(t);
  }, [type, goFlash]);

  if (type === 'QUIZ') {
    return (
      <div className="mx-auto max-w-lg">
        <h1 className="font-(family-name:--font-syne) text-2xl font-bold tracking-[0.02em] text-(--text-primary)">
          Create quiz
        </h1>
        <p className="mt-2 text-sm text-(--text-secondary)">
          The quiz editor is not available yet. Please go back to the dashboard.
        </p>
        <Button
          asChild
          variant="outline"
          className="mt-6 rounded-xl"
          size="outlineCompact"
        >
          <Link to="/app">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  if (type === null) {
    return (
      <div className="mx-auto max-w-lg">
        <p className="text-sm text-(--text-secondary)">
          Missing or invalid module type.
        </p>
        <Button
          asChild
          variant="outline"
          className="mt-6 rounded-xl"
          size="outlineCompact"
        >
          <Link to="/app">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  if (phase === 'error' && type === 'FLASHCARD') {
    return (
      <div className="mx-auto max-w-lg text-center">
        <h1 className="font-(family-name:--font-syne) text-2xl font-bold text-(--text-primary)">
          Could not start
        </h1>
        <p className="mt-2 text-sm text-(--text-secondary)">
          Something went wrong while creating the module.
        </p>
        <Button
          type="button"
          variant="cta"
          className="mt-6 rounded-xl"
          size="outlineCompact"
          onClick={() => {
            setPhase('working');
            void goFlash();
          }}
        >
          Try again
        </Button>
        <div className="mt-3">
          <Button asChild variant="ghost" size="sm" className="rounded-xl">
            <Link to="/app">Back to dashboard</Link>
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
      <p className="text-sm">Creating your module…</p>
    </div>
  );
};

export default CreateModulePage;
