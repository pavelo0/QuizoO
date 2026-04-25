import { Button } from '@/components/ui/button';
import { Link, useSearchParams } from 'react-router-dom';

/**
 * Заглушка шага создания модуля после выбора типа в диалоге дашборда.
 */
const CreateModulePage = () => {
  const [params] = useSearchParams();
  const raw = params.get('type');
  const typeLabel =
    raw === 'QUIZ' ? 'Quiz' : raw === 'FLASHCARD' ? 'Flashcards' : 'Unknown';

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="font-(family-name:--font-syne) text-2xl font-bold tracking-[0.02em] text-(--text-primary)">
        Create module
      </h1>
      <p className="mt-2 text-sm text-(--text-secondary)">
        Selected format:{' '}
        <strong className="text-(--text-primary)">{typeLabel}</strong>
      </p>
      <p className="mt-4 text-sm text-(--text-secondary)">
        This step is not implemented yet. Use the back button to return to the
        dashboard.
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
};

export default CreateModulePage;
