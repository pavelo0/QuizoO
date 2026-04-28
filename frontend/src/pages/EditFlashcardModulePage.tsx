import {
  createCard,
  deleteModule,
  deleteCard,
  fetchModuleById,
  updateCard,
  updateModule,
} from '@/lib/api/modules';
import { clearFlashcardDraftInflight } from '@/lib/flashcardModuleDraft';
import { apiErrorMessage } from '@/lib/apiErrorMessage';
import {
  MAX_FLASHCARDS_PER_MODULE,
  MAX_MODULE_TITLE_LENGTH,
} from '@/lib/moduleConstants';
import { cn } from '@/lib/utils';
import type { ModuleCard, ModuleId } from '@/types/module';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  BookOpen,
  Clock,
  IdCard,
  Layers,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useBlocker, Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const cardTextareaClass = cn(
  'min-h-28 w-full rounded-2xl border border-(--border-default) bg-(--input-bg) px-4 py-3 text-sm text-(--text-primary) shadow-none',
  'placeholder:text-(--text-secondary) md:text-sm',
  'focus-visible:border-(--primary-accent) focus-visible:ring-2 focus-visible:ring-(--primary-accent)/25',
  'dark:border-white/10',
);

const cardLabelClass = cn(
  'mb-2 block font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)',
);

const SHUFFLE_KEY = (id: string) => `quizo:flash-shuffle:${id}`;

function readShuffle(id: string) {
  try {
    const s = localStorage.getItem(SHUFFLE_KEY(id));
    if (s === null) return true;
    return s === '1';
  } catch {
    return true;
  }
}

function writeShuffle(id: string, v: boolean) {
  try {
    localStorage.setItem(SHUFFLE_KEY(id), v ? '1' : '0');
  } catch {
    /* ignore */
  }
}

/**
 * Вложенная панель: techDesign — крупная карточка 24px, бордер, токены.
 */
function Panel({ className, ...p }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-(--border-default) bg-(--input-bg)/45',
        'shadow-sm transition-[border-color,box-shadow] duration-300 ease-in-out',
        className,
      )}
      {...p}
    />
  );
}

type FlashcardCardDialogProps = {
  open: boolean;
  editingCard: ModuleCard | null;
  cardsCount: number;
  onOpenChange: (open: boolean) => void;
  onCreateCard: (question: string, answer: string) => Promise<void>;
  onUpdateCard: (
    cardId: string,
    question: string,
    answer: string,
  ) => Promise<void>;
};

const FlashcardCardDialog = memo(function FlashcardCardDialog({
  open,
  editingCard,
  cardsCount,
  onOpenChange,
  onCreateCard,
  onUpdateCard,
}: FlashcardCardDialogProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{
    question?: string;
    answer?: string;
    form?: string;
  }>({});

  useEffect(() => {
    if (!open) return;
    setQuestion(editingCard?.question ?? '');
    setAnswer(editingCard?.answer ?? '');
    setErrors({});
    setSaving(false);
  }, [open, editingCard]);

  const onSubmit = useCallback(async () => {
    const q = question.trim();
    const a = answer.trim();
    const next: { question?: string; answer?: string; form?: string } = {};

    if (!q) next.question = 'Enter a question.';
    if (!a) next.answer = 'Enter an answer.';
    if (!editingCard && cardsCount >= MAX_FLASHCARDS_PER_MODULE) {
      next.form = `You can add up to ${MAX_FLASHCARDS_PER_MODULE} cards.`;
    }
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setSaving(true);
    setErrors({});
    try {
      if (editingCard) {
        await onUpdateCard(editingCard.id, q, a);
      } else {
        await onCreateCard(q, a);
      }
      onOpenChange(false);
    } catch (err) {
      setErrors({ form: apiErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  }, [
    answer,
    cardsCount,
    editingCard,
    onCreateCard,
    onOpenChange,
    onUpdateCard,
    question,
  ]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) setErrors({});
      }}
    >
      <DialogContent
        className="w-[min(32rem,calc(100%-2rem))] max-w-2xl gap-0 p-0 sm:max-w-2xl"
        showCloseButton
      >
        <div className="p-6 sm:p-8">
          <DialogHeader className="mb-0 gap-0 space-y-0 text-left sm:text-left">
            <DialogTitle className="font-(family-name:--font-syne) text-lg font-bold tracking-[0.02em] text-(--text-primary) sm:text-xl">
              {editingCard ? 'Edit card' : 'New card'}
            </DialogTitle>
          </DialogHeader>
          {errors.form ? (
            <p
              className="mt-3 font-(family-name:--font-dm-sans) text-xs text-destructive"
              role="alert"
            >
              {errors.form}
            </p>
          ) : null}
          <div
            className={cn('grid gap-6 sm:gap-8', errors.form ? 'mt-5' : 'mt-6')}
          >
            <div>
              <label className={cardLabelClass} htmlFor="new-card-question">
                Question
              </label>
              <Textarea
                id="new-card-question"
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    question: undefined,
                    form: undefined,
                  }));
                }}
                placeholder="e.g. How do you ask for directions?"
                aria-invalid={!!errors.question}
                rows={4}
                className={cn(
                  cardTextareaClass,
                  'resize-y',
                  errors.question && 'border-destructive',
                )}
              />
              {errors.question ? (
                <p
                  className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
                  role="alert"
                >
                  {errors.question}
                </p>
              ) : null}
            </div>
            <div>
              <label className={cardLabelClass} htmlFor="new-card-answer">
                Answer
              </label>
              <Textarea
                id="new-card-answer"
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    answer: undefined,
                    form: undefined,
                  }));
                }}
                placeholder="e.g. Excuse me, how do I get to…?"
                aria-invalid={!!errors.answer}
                rows={4}
                className={cn(
                  cardTextareaClass,
                  'resize-y',
                  errors.answer && 'border-destructive',
                )}
              />
              {errors.answer ? (
                <p
                  className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
                  role="alert"
                >
                  {errors.answer}
                </p>
              ) : null}
            </div>
          </div>
        </div>
        <DialogFooter className="mt-0 gap-3 border-t border-(--border-default) p-6 sm:gap-3 sm:px-8 sm:py-5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-12 rounded-2xl px-6"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="cta"
            onClick={() => void onSubmit()}
            className="h-12 rounded-2xl px-6"
            disabled={saving}
          >
            {saving ? 'Saving…' : editingCard ? 'Save' : 'Add card'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
FlashcardCardDialog.displayName = 'FlashcardCardDialog';

type DeleteModuleDialogProps = {
  open: boolean;
  pending: boolean;
  moduleTitle: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
};

const DeleteModuleDialog = memo(function DeleteModuleDialog({
  open,
  pending,
  moduleTitle,
  onOpenChange,
  onConfirm,
}: DeleteModuleDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm border-(--border-default) bg-(--bg-color) text-(--text-primary)">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-(family-name:--font-syne) text-base">
            Delete module?
          </AlertDialogTitle>
          <AlertDialogDescription className="font-(family-name:--font-dm-sans) text-(--text-secondary)">
            This will permanently remove <strong>{moduleTitle}</strong> and all
            its cards. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:flex-col sm:gap-2">
          <AlertDialogCancel
            className="w-full border-(--border-default) sm:w-full"
            disabled={pending}
          >
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            className="w-full sm:w-full"
            onClick={() => void onConfirm()}
            disabled={pending}
          >
            {pending ? 'Deleting…' : 'Delete module'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});
DeleteModuleDialog.displayName = 'DeleteModuleDialog';

export default function EditFlashcardModulePage() {
  const { moduleId: rawId } = useParams();
  const moduleId = (rawId ?? '') as ModuleId;
  const navigate = useNavigate();

  const [loadState, setLoadState] = useState<
    'loading' | 'ok' | 'notfound' | 'wrongType'
  >('loading');
  const [title, setTitle] = useState('New module');
  const [savedTitle, setSavedTitle] = useState('New module');
  const [cards, setCards] = useState<ModuleCard[]>([]);
  const [search, setSearch] = useState('');
  const [shuffle, setShuffle] = useState(true);

  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<ModuleCard | null>(null);
  const [deleteModuleOpen, setDeleteModuleOpen] = useState(false);
  const [deleteModulePending, setDeleteModulePending] = useState(false);
  const [allowNavigation, setAllowNavigation] = useState(false);

  const isDirty = title.trim() !== savedTitle;

  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) => {
        if (allowNavigation) return false;
        if (!isDirty) return false;
        return currentLocation.pathname !== nextLocation.pathname;
      },
      [allowNavigation, isDirty],
    ),
  );

  const leaveOpen = blocker.state === 'blocked';

  const load = useCallback(async () => {
    if (!moduleId) {
      setLoadState('notfound');
      return;
    }
    try {
      const m = await fetchModuleById(moduleId);
      if (m.type !== 'FLASHCARD') {
        setLoadState('wrongType');
        return;
      }
      setTitle(m.title);
      setSavedTitle(m.title);
      setCards(m.cards);
      setShuffle(readShuffle(m.id));
      setLoadState('ok');
    } catch {
      setLoadState('notfound');
    }
  }, [moduleId]);

  useEffect(() => {
    void clearFlashcardDraftInflight();
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(t);
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter(
      (c) =>
        c.question.toLowerCase().includes(q) ||
        c.answer.toLowerCase().includes(q),
    );
  }, [cards, search]);

  const openAddCard = useCallback(() => {
    if (cards.length >= MAX_FLASHCARDS_PER_MODULE) {
      toast.error(`You can add up to ${MAX_FLASHCARDS_PER_MODULE} cards.`);
      return;
    }
    setEditingCard(null);
    setCardDialogOpen(true);
  }, [cards.length]);

  const openEditCard = useCallback((c: ModuleCard) => {
    setEditingCard(c);
    setCardDialogOpen(true);
  }, []);

  const onCreateCard = useCallback(
    async (question: string, answer: string) => {
      const created = await createCard(moduleId, {
        question,
        answer,
        orderIndex: cards.length,
      });
      setCards((prev) =>
        [...prev, created].sort((x, y) => x.orderIndex - y.orderIndex),
      );
      toast.success('Card added');
    },
    [cards.length, moduleId],
  );

  const onUpdateCard = useCallback(
    async (cardId: string, question: string, answer: string) => {
      const updated = await updateCard(moduleId, cardId, {
        question,
        answer,
      });
      setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      toast.success('Card updated');
    },
    [moduleId],
  );

  const onDeleteCard = useCallback(
    async (c: ModuleCard) => {
      try {
        await deleteCard(moduleId, c.id);
        setCards((prev) => prev.filter((x) => x.id !== c.id));
        toast.success('Card removed');
      } catch {
        toast.error('Could not delete the card.');
      }
    },
    [moduleId],
  );

  const onShuffle = useCallback(
    (v: boolean) => {
      setShuffle(v);
      writeShuffle(moduleId, v);
    },
    [moduleId],
  );

  const onDeleteModule = useCallback(async () => {
    setDeleteModulePending(true);
    try {
      await deleteModule(moduleId);
      toast.success('Module deleted');
      setAllowNavigation(true);
      void navigate('/app', { replace: true });
    } catch {
      toast.error('Could not delete module.');
    } finally {
      setDeleteModulePending(false);
    }
  }, [moduleId, navigate]);

  const openStudy = useCallback(() => {
    void navigate(`/app/modules/${encodeURIComponent(moduleId)}/flash-study`);
  }, [moduleId, navigate]);

  const finishLeaveSave = useCallback(async () => {
    const t = title.trim();
    if (!t) {
      toast.error('Title cannot be empty.');
      return;
    }
    try {
      await updateModule(moduleId, { title: t });
      setSavedTitle(t);
      if (blocker.state === 'blocked') blocker.proceed();
    } catch {
      toast.error('Could not save the module title.');
    }
  }, [blocker, moduleId, title]);

  const finishLeaveNoSave = useCallback(() => {
    if (blocker.state === 'blocked') blocker.proceed();
  }, [blocker]);

  const onLeaveDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        if (blocker.state === 'blocked') {
          blocker.reset();
        }
      }
    },
    [blocker],
  );

  if (loadState === 'loading') {
    return (
      <div
        className="flex min-h-[50vh] items-center justify-center text-sm text-(--text-secondary)"
        role="status"
        aria-live="polite"
        aria-busy
      >
        Loading…
      </div>
    );
  }

  if (loadState === 'notfound' || loadState === 'wrongType') {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-(--text-secondary)">
          {loadState === 'wrongType'
            ? 'This module is not a flashcard set.'
            : 'Module not found or you do not have access.'}
        </p>
        <Button
          asChild
          className="mt-6 rounded-xl"
          variant="outline"
          size="outlineCompact"
        >
          <Link to="/app">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  const titleTrimmed = title.trim() || 'New module';

  return (
    <article
      className={cn(
        'mx-auto flex min-h-0 w-full max-w-[1200px] flex-1 flex-col gap-5 pb-4 sm:gap-6',
        'text-(--text-primary)',
      )}
    >
      <h1 className="sr-only">Edit flashcard module: {titleTrimmed}</h1>
      <nav className="text-xs text-(--text-secondary)" aria-label="Breadcrumb">
        <ol className="flex min-w-0 list-none flex-wrap items-center gap-x-1.5 gap-y-1 p-0">
          <li className="shrink-0">
            <Link
              to="/app"
              className="font-(family-name:--font-dm-sans) font-medium text-(--text-secondary) underline-offset-2 transition-opacity hover:opacity-100 hover:underline"
            >
              My modules
            </Link>
          </li>
          <li className="shrink-0 text-(--text-secondary)/50" aria-hidden>
            <span className="px-0.5">&gt;</span>
          </li>
          <li
            className="min-w-0 font-(family-name:--font-dm-sans) font-medium text-(--text-primary)"
            title={titleTrimmed}
            aria-current="page"
          >
            <span className="line-clamp-2 wrap-break-word">{titleTrimmed}</span>
          </li>
        </ol>
      </nav>

      <header className="grid gap-0">
        <Panel
          className="p-5 sm:px-7 sm:py-6 lg:px-8"
          role="region"
          aria-label="Module summary and study actions"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
            <div className="min-w-0 flex-1">
              <label className="sr-only" htmlFor="module-title-input">
                Module title
              </label>
              <input
                key={moduleId}
                id="module-title-input"
                name="quizoModuleTitle"
                value={title}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                maxLength={MAX_MODULE_TITLE_LENGTH}
                onChange={(e) =>
                  setTitle(e.target.value.slice(0, MAX_MODULE_TITLE_LENGTH))
                }
                className="w-full min-w-0 border-0 bg-transparent font-(family-name:--font-syne) text-2xl font-bold leading-tight tracking-[0.02em] wrap-break-word text-(--text-primary) outline-none placeholder:text-(--text-secondary) sm:text-3xl md:text-4xl"
              />
              <ul
                className="mt-4 flex list-none flex-col gap-3 p-0 text-sm text-(--text-secondary)"
                aria-label="Module statistics"
              >
                <li className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-(--module-badge-mint-bg) text-(--module-badge-mint-fg)">
                    <IdCard className="size-4" strokeWidth={2} aria-hidden />
                  </span>
                  <span className="font-(family-name:--font-dm-sans) text-(--text-primary)">
                    {cards.length} {cards.length === 1 ? 'card' : 'cards'}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-(--module-badge-violet-bg) text-(--module-badge-violet-fg)">
                    <BookOpen className="size-4" strokeWidth={2} aria-hidden />
                  </span>
                  <span>0 sessions completed</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                    <Clock className="size-4" strokeWidth={2} aria-hidden />
                  </span>
                  <span>Last studied: Not studied yet</span>
                </li>
              </ul>
            </div>
            <div className="shrink-0 self-stretch">
              <div className="mb-3 flex justify-end">
                <Button
                  type="button"
                  variant="outlineSoft"
                  size="icon-header"
                  className="rounded-[12px] text-(--text-secondary) hover:text-(--text-primary)"
                  title="Delete module"
                  aria-label="Delete module"
                  onClick={() => setDeleteModuleOpen(true)}
                >
                  <Trash2 className="size-4" strokeWidth={2} aria-hidden />
                </Button>
              </div>
              <Button
                type="button"
                disabled={cards.length === 0}
                className="h-12 w-full min-w-56 gap-2 rounded-[12px] border-0 bg-(--secondary-accent) font-(family-name:--font-syne) text-base font-bold text-white shadow-[0_4px_15px_rgba(0,212,170,0.2)] transition-all duration-300 ease-in-out hover:bg-(--secondary-accent)/90 sm:w-auto"
                onClick={openStudy}
              >
                <Layers className="size-4" strokeWidth={2} aria-hidden />
                Study with flashcards
              </Button>
            </div>
          </div>
        </Panel>
      </header>

      <section
        className="rounded-2xl border border-(--border-default) bg-(--input-bg)/25 px-4 py-3 sm:flex sm:items-center sm:justify-between sm:px-5"
        aria-labelledby="flashcard-settings-heading"
      >
        <h2
          id="flashcard-settings-heading"
          className="font-(family-name:--font-syne) text-[0.6875rem] font-extrabold tracking-[0.2em] text-(--text-secondary) uppercase"
        >
          Flashcard settings
        </h2>
        <div className="mt-3 flex items-center justify-between gap-3 sm:mt-0 sm:ml-6">
          <span
            className="font-(family-name:--font-dm-sans) text-sm text-(--text-primary)"
            id="switch-shuffle-label"
          >
            Shuffle
          </span>
          <Switch
            checked={shuffle}
            onCheckedChange={onShuffle}
            className="data-[state=checked]:border-transparent data-[state=checked]:bg-(--secondary-accent) dark:data-[state=checked]:bg-(--secondary-accent) dark:data-[state=unchecked]:bg-white/20"
            aria-labelledby="switch-shuffle-label"
          />
        </div>
      </section>

      <section
        className="min-h-0 flex-1"
        aria-labelledby="cards-section-heading"
      >
        <div className="mb-3 flex flex-col gap-3 lg:mb-4 lg:flex-row lg:items-center lg:justify-between">
          <h2
            id="cards-section-heading"
            className="min-w-0 font-(family-name:--font-syne) text-xl font-bold tracking-[-0.04em] text-(--text-primary) sm:text-2xl"
          >
            Cards ({cards.length})
          </h2>
          <div className="relative w-full min-w-0 sm:max-w-full lg:w-80">
            <label htmlFor="card-search" className="sr-only">
              Search cards
            </label>
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-(--text-secondary)"
              strokeWidth={2}
              aria-hidden
            />
            <Input
              id="card-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cards…"
              className="h-[52px] w-full rounded-[10px] border border-(--border-default) bg-(--input-bg) pl-10 text-base text-(--text-primary) shadow-none focus-visible:border-(--primary-accent) focus-visible:ring-2 focus-visible:ring-(--primary-accent)/20"
            />
          </div>
        </div>

        <Panel className="flex max-h-[min(52vh,520px)] min-h-[220px] flex-col overflow-hidden">
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-y-contain p-3 sm:space-y-2.5 sm:p-4">
            {filtered.length === 0 ? (
              <p className="py-10 text-center text-sm text-(--text-secondary) sm:py-12">
                {cards.length === 0
                  ? 'No cards yet. Add your first card below.'
                  : 'No cards match your search.'}
              </p>
            ) : (
              <ul
                className="list-none space-y-2.5 p-0 sm:space-y-3"
                role="list"
              >
                {filtered.map((c) => {
                  const n = String(
                    1 + cards.findIndex((x) => x.id === c.id),
                  ).padStart(2, '0');
                  return (
                    <li
                      key={c.id}
                      className="flex items-stretch gap-3 rounded-2xl border border-(--border-default) bg-(--input-bg)/35 px-3 py-3 transition-colors duration-300 sm:px-4"
                    >
                      <span
                        className="w-7 shrink-0 select-none pt-0.5 font-(family-name:--font-jetbrains-mono) text-xs text-(--text-secondary)"
                        aria-label={`Order ${n}`}
                      >
                        {n}
                      </span>
                      <div className="min-w-0 flex-1 text-left">
                        <h3 className="text-sm font-semibold text-(--text-primary) sm:text-base">
                          {c.question}
                        </h3>
                        <p className="mt-1 text-sm text-(--text-secondary) sm:text-sm">
                          <span className="text-(--text-secondary)/80">
                            &ldquo;
                          </span>
                          {c.answer}
                          <span className="text-(--text-secondary)/80">
                            &rdquo;
                          </span>
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-(--text-secondary) hover:text-(--text-primary)"
                          onClick={() => openEditCard(c)}
                          aria-label="Edit card"
                        >
                          <Pencil className="size-4" strokeWidth={2} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-(--text-secondary) hover:text-(--danger-color)"
                          onClick={() => void onDeleteCard(c)}
                          aria-label="Delete card"
                        >
                          <Trash2 className="size-4" strokeWidth={2} />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Panel>

        <div className="mt-5 flex justify-center sm:mt-6">
          <Button
            type="button"
            variant="cta"
            className="h-12 gap-2 rounded-[12px] px-8 font-(family-name:--font-syne) text-base font-bold shadow-[0_4px_15px_var(--purple-glow)] transition-all duration-300 ease-in-out"
            onClick={openAddCard}
            disabled={cards.length >= MAX_FLASHCARDS_PER_MODULE}
          >
            <Plus className="size-4" strokeWidth={2.5} />
            Add new card
          </Button>
        </div>
      </section>

      <FlashcardCardDialog
        open={cardDialogOpen}
        editingCard={editingCard}
        cardsCount={cards.length}
        onOpenChange={(nextOpen) => {
          setCardDialogOpen(nextOpen);
          if (!nextOpen) setEditingCard(null);
        }}
        onCreateCard={onCreateCard}
        onUpdateCard={onUpdateCard}
      />

      <DeleteModuleDialog
        open={deleteModuleOpen}
        pending={deleteModulePending}
        moduleTitle={titleTrimmed}
        onOpenChange={setDeleteModuleOpen}
        onConfirm={onDeleteModule}
      />

      <AlertDialog open={leaveOpen} onOpenChange={onLeaveDialogOpenChange}>
        <AlertDialogContent className="max-w-sm" size="default">
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes to the title. Do you want to save before
              you leave? If you do not save, the title you typed will be lost.
              Your cards are already kept on the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:flex-col sm:gap-2">
            <Button
              type="button"
              variant="cta"
              className="w-full sm:w-full"
              onClick={() => void finishLeaveSave()}
            >
              Save and leave
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-full"
              onClick={finishLeaveNoSave}
            >
              Leave without saving
            </Button>
            <AlertDialogCancel className="w-full sm:w-full">
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
