import { SortableQuestionRow } from './SortableQuestionRow';
import { QuizQuestionDialog } from './QuizQuestionDialog';
import {
  MAX_QUESTIONS_PER_MODULE,
  QUIZ_IMPORT_FORMAT_VERSION,
  parseQuizImportJson,
  quizJsonExample,
  sanitizeFilenamePart,
  toExportQuestion,
} from '../model/quizQuestionDraft';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { Button } from '@/shared/ui/button';
import { FocusBar } from '@/shared/ui/focus-bar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import { useI18n } from '@/shared/i18n/useI18n';
import {
  createQuestion,
  deleteModule,
  deleteQuestion,
  deleteQuestionImage,
  fetchModuleById,
  updateModule,
  updateQuestion,
  uploadQuestionImage,
} from '@/entities/module';
import { MAX_MODULE_TITLE_LENGTH } from '@/shared/config/module';
import { clearQuizDraftInflight } from '@/features/create-module';
import {
  SESSION_TIMER_DURATION_OPTIONS_SEC,
  readQuizTimerDurationSec,
  readQuizTimerEnabled,
  writeQuizTimerDurationSec,
  writeQuizTimerEnabled,
  type SessionTimerDurationSec,
} from '@/shared/lib/sessionTimerPrefs';
import { cn } from '@/shared/lib/utils';
import type { ModuleId, ModuleQuestion, QuestionType } from '@/entities/module';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import axios from 'axios';
import {
  BookOpen,
  CircleHelp,
  Clock,
  Download,
  IdCard,
  ListChecks,
  Plus,
  Search,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
} from 'react';
import { toast } from 'react-hot-toast';
import {
  Link,
  useBlocker,
  useNavigate,
  useParams,
  type Location,
} from 'react-router-dom';

const SHUFFLE_KEY = (id: string) => `quizo:quiz-shuffle:${id}`;

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

function Panel({ className, ...p }: ComponentProps<'div'>) {
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

function reorderQuestions(questions: ModuleQuestion[]) {
  return questions.map((question, index) => ({
    ...question,
    orderIndex: index,
  }));
}

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
  const { t } = useI18n();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm border-(--border-default) bg-(--bg-color) text-(--text-primary)">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-(family-name:--font-syne) text-base">
            {t('edit.common.deleteTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription className="font-(family-name:--font-dm-sans) text-(--text-secondary)">
            {t('edit.common.deleteDescriptionQuiz', { title: moduleTitle })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:flex-col sm:gap-2">
          <AlertDialogCancel
            className="w-full border-(--border-default) sm:w-full"
            disabled={pending}
          >
            {t('common.cancel')}
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            className="w-full sm:w-full"
            onClick={() => void onConfirm()}
            disabled={pending}
          >
            {pending ? t('common.deleting') : t('edit.common.deleteAction')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});
DeleteModuleDialog.displayName = 'DeleteModuleDialog';

function useWideQuizLayout() {
  const [wide, setWide] = useState(
    () => window.matchMedia('(min-width: 1024px)').matches,
  );
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const apply = () => setWide(media.matches);
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);
  return wide;
}

export function QuizEditor() {
  const { t } = useI18n();
  const wideLayout = useWideQuizLayout();
  const { moduleId: rawId } = useParams();
  const moduleId = (rawId ?? '') as ModuleId;
  const navigate = useNavigate();

  const [loadState, setLoadState] = useState<
    'loading' | 'ok' | 'notfound' | 'wrongType'
  >('loading');
  const [title, setTitle] = useState(t('edit.common.newQuizModule'));
  const [savedTitle, setSavedTitle] = useState(t('edit.common.newQuizModule'));
  const [titleError, setTitleError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ModuleQuestion[]>([]);
  const [search, setSearch] = useState('');
  const [shuffle, setShuffle] = useState(true);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerDurationSec, setTimerDurationSec] =
    useState<SessionTimerDurationSec>(600);

  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ModuleQuestion | null>(
    null,
  );
  const [isReordering, setIsReordering] = useState(false);
  const [deleteModuleOpen, setDeleteModuleOpen] = useState(false);
  const [deleteModulePending, setDeleteModulePending] = useState(false);
  const [titleSaving, setTitleSaving] = useState(false);
  const [allowNavigation, setAllowNavigation] = useState(false);
  const [importHelpOpen, setImportHelpOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const isDirty = title.trim() !== savedTitle;

  const blocker = useBlocker(
    useCallback(
      ({
        currentLocation,
        nextLocation,
      }: {
        currentLocation: Location;
        nextLocation: Location;
      }) => {
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
      if (m.type !== 'QUIZ') {
        setLoadState('wrongType');
        return;
      }
      setTitle(m.title);
      setSavedTitle(m.title);
      setTitleError(null);
      setQuestions(m.questions);
      setShuffle(readShuffle(m.id));
      setTimerEnabled(readQuizTimerEnabled(m.id));
      setTimerDurationSec(readQuizTimerDurationSec(m.id));
      setLoadState('ok');
    } catch {
      setLoadState('notfound');
    }
  }, [moduleId]);

  useEffect(() => {
    void clearQuizDraftInflight();
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(t);
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return questions;
    return questions.filter((item) => {
      if (item.questionText.toLowerCase().includes(q)) return true;
      if (item.type === 'CHOICE') {
        return item.questionOptions.some((opt) =>
          opt.text.toLowerCase().includes(q),
        );
      }
      if (item.type === 'MATCHING') {
        return item.matchingPairs.some(
          (pair) =>
            pair.leftItem.toLowerCase().includes(q) ||
            pair.rightItem.toLowerCase().includes(q),
        );
      }
      return false;
    });
  }, [questions, search]);

  const canDragReorder = search.trim().length === 0;
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const persistQuestionOrder = useCallback(
    async (nextQuestions: ModuleQuestion[]) => {
      const normalized = reorderQuestions(nextQuestions);
      const previous = questions;
      setQuestions(normalized);
      setIsReordering(true);
      try {
        await Promise.all(
          normalized.map((question) =>
            updateQuestion(moduleId, question.id, {
              orderIndex: question.orderIndex,
            }),
          ),
        );
      } catch {
        setQuestions(previous);
        toast.error(t('editQuiz.reorderFailed'));
      } finally {
        setIsReordering(false);
      }
    },
    [moduleId, questions, t],
  );

  const onMoveQuestion = useCallback(
    (questionId: string, delta: -1 | 1) => {
      if (isReordering) return;
      const currentIndex = questions.findIndex(
        (question) => question.id === questionId,
      );
      if (currentIndex < 0) return;
      const nextIndex = currentIndex + delta;
      if (nextIndex < 0 || nextIndex >= questions.length) return;
      void persistQuestionOrder(arrayMove(questions, currentIndex, nextIndex));
    },
    [isReordering, persistQuestionOrder, questions],
  );

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (!canDragReorder || isReordering) return;
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = questions.findIndex(
        (question) => question.id === active.id,
      );
      const newIndex = questions.findIndex(
        (question) => question.id === over.id,
      );
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;
      void persistQuestionOrder(arrayMove(questions, oldIndex, newIndex));
    },
    [canDragReorder, isReordering, persistQuestionOrder, questions],
  );

  const openAddQuestion = useCallback(() => {
    if (questions.length >= MAX_QUESTIONS_PER_MODULE) {
      toast.error(
        t('editQuiz.validationMaxQuestions', {
          count: MAX_QUESTIONS_PER_MODULE,
        }),
      );
      return;
    }
    setEditingQuestion(null);
    setQuestionDialogOpen(true);
  }, [questions.length, t]);

  const openEditQuestion = useCallback((q: ModuleQuestion) => {
    setEditingQuestion(q);
    setQuestionDialogOpen(true);
  }, []);

  const onCreateQuestion = useCallback(
    async (
      payload: {
        questionText: string;
        type: QuestionType;
        allowMultipleAnswers?: boolean;
        options?: Array<{ text: string; isCorrect: boolean }>;
        matchingPairs?: Array<{ leftItem: string; rightItem: string }>;
        orderingItems?: Array<{ text: string; correctOrder: number }>;
        fillBlanks?: Array<{ answer: string; acceptedVariants?: string[] }>;
        acceptedVariants?: string[];
      },
      imageFile: File | null,
    ) => {
      let created = await createQuestion(moduleId, {
        ...payload,
        orderIndex: questions.length,
      });
      if (imageFile) {
        created = await uploadQuestionImage(moduleId, created.id, imageFile);
      }
      setQuestions((prev) =>
        [...prev, created].sort((x, y) => x.orderIndex - y.orderIndex),
      );
      setEditingQuestion(created);
      setQuestionDialogOpen(true);
      toast.success(t('editQuiz.questionAdded'));
    },
    [moduleId, questions.length, t],
  );

  const onUpdateQuestion = useCallback(
    async (
      questionId: string,
      payload: {
        questionText: string;
        type: QuestionType;
        allowMultipleAnswers?: boolean;
        options?: Array<{ text: string; isCorrect: boolean }>;
        matchingPairs?: Array<{ leftItem: string; rightItem: string }>;
        orderingItems?: Array<{ text: string; correctOrder: number }>;
        fillBlanks?: Array<{ answer: string; acceptedVariants?: string[] }>;
        acceptedVariants?: string[];
      },
      imageUpdate: {
        file: File | null;
        removeExisting: boolean;
        hasExisting: boolean;
      },
    ) => {
      let updated = await updateQuestion(moduleId, questionId, payload);
      if (imageUpdate.removeExisting && imageUpdate.hasExisting) {
        await deleteQuestionImage(moduleId, questionId);
        updated = { ...updated, questionImageMime: null };
      }
      if (imageUpdate.file) {
        updated = await uploadQuestionImage(
          moduleId,
          questionId,
          imageUpdate.file,
        );
      }
      setQuestions((prev) =>
        prev.map((q) => (q.id === updated.id ? updated : q)),
      );
      setEditingQuestion((current) =>
        current?.id === updated.id ? updated : current,
      );
      toast.success(t('editQuiz.questionUpdated'));
    },
    [moduleId, t],
  );

  const onDeleteQuestion = useCallback(
    async (q: ModuleQuestion) => {
      try {
        await deleteQuestion(moduleId, q.id);
        setQuestions((prev) => prev.filter((x) => x.id !== q.id));
        if (editingQuestion?.id === q.id) {
          setEditingQuestion(null);
          setQuestionDialogOpen(false);
        }
        toast.success(t('editQuiz.questionRemoved'));
      } catch {
        toast.error(t('editQuiz.questionDeleteFailed'));
      }
    },
    [editingQuestion?.id, moduleId, t],
  );

  const onShuffle = useCallback(
    (v: boolean) => {
      setShuffle(v);
      writeShuffle(moduleId, v);
    },
    [moduleId],
  );

  const onTimerEnabled = useCallback(
    (v: boolean) => {
      setTimerEnabled(v);
      writeQuizTimerEnabled(moduleId, v);
    },
    [moduleId],
  );

  const onTimerDuration = useCallback(
    (sec: SessionTimerDurationSec) => {
      setTimerDurationSec(sec);
      writeQuizTimerDurationSec(moduleId, sec);
    },
    [moduleId],
  );

  const onDeleteModule = useCallback(async () => {
    setDeleteModulePending(true);
    try {
      await deleteModule(moduleId);
      toast.success(t('modules.moduleDeleted'));
      setAllowNavigation(true);
      void navigate('/app', { replace: true });
    } catch {
      toast.error(t('modules.moduleDeleteFailed'));
    } finally {
      setDeleteModulePending(false);
    }
  }, [moduleId, navigate, t]);

  const openStudy = useCallback(() => {
    void navigate(`/app/modules/${encodeURIComponent(moduleId)}/quiz-study`);
  }, [moduleId, navigate]);

  const onClickImport = useCallback(() => {
    importInputRef.current?.click();
  }, []);

  const runQuizImport = useCallback(
    async (file: File) => {
      setImporting(true);
      try {
        const rawText = await file.text();
        const parsed = JSON.parse(rawText) as unknown;
        const importedQuestions = parseQuizImportJson(parsed, t);

        await Promise.all(questions.map((q) => deleteQuestion(moduleId, q.id)));

        const createdQuestions: ModuleQuestion[] = [];
        for (const [index, payload] of importedQuestions.entries()) {
          const created = await createQuestion(moduleId, {
            ...payload,
            orderIndex: index,
          });
          createdQuestions.push(created);
        }

        setQuestions(
          createdQuestions.sort(
            (left, right) => left.orderIndex - right.orderIndex,
          ),
        );
        toast.success(
          t('editQuiz.importSuccess', { count: createdQuestions.length }),
        );
      } catch (error) {
        if (error instanceof SyntaxError) {
          toast.error(t('editQuiz.importInvalidJson'));
          return;
        }
        toast.error(
          error instanceof Error ? error.message : t('editQuiz.importFailed'),
        );
      } finally {
        setImporting(false);
      }
    },
    [moduleId, questions, t],
  );

  const onImportFile = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;

      if (questions.length > 0) {
        setPendingImportFile(file);
        return;
      }

      await runQuizImport(file);
    },
    [questions.length, runQuizImport],
  );

  const confirmImportReplace = useCallback(() => {
    const next = pendingImportFile;
    setPendingImportFile(null);
    if (next) void runQuizImport(next);
  }, [pendingImportFile, runQuizImport]);

  const onExportJson = useCallback(() => {
    const exportData = {
      formatVersion: QUIZ_IMPORT_FORMAT_VERSION,
      moduleType: 'QUIZ',
      title: title.trim(),
      questions: [...questions]
        .sort((left, right) => left.orderIndex - right.orderIndex)
        .map(toExportQuestion),
    };
    const content = JSON.stringify(exportData, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const suffix = sanitizeFilenamePart(title) || 'quiz-module';
    anchor.href = url;
    anchor.download = `${suffix}.json`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success(t('editQuiz.exportSuccess'));
  }, [questions, t, title]);

  const saveTitle = useCallback(
    async (options?: { proceedIfBlocked?: boolean }) => {
      const nextTitle = title.trim();
      if (!nextTitle) {
        toast.error(t('edit.common.titleRequired'));
        return false;
      }
      if (nextTitle === savedTitle) {
        if (options?.proceedIfBlocked && blocker.state === 'blocked') {
          blocker.proceed();
        }
        return true;
      }
      setTitleSaving(true);
      try {
        await updateModule(moduleId, { title: nextTitle });
        setSavedTitle(nextTitle);
        setTitleError(null);
        if (options?.proceedIfBlocked && blocker.state === 'blocked') {
          blocker.proceed();
        }
        return true;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 409) {
          setTitleError(t('edit.common.titleAlreadyExists'));
          return false;
        }
        toast.error(t('edit.common.saveTitleFailed'));
        return false;
      } finally {
        setTitleSaving(false);
      }
    },
    [blocker, moduleId, savedTitle, t, title],
  );

  const finishLeaveSave = useCallback(async () => {
    const nextTitle = title.trim();
    if (!nextTitle) return;
    await saveTitle({ proceedIfBlocked: true });
  }, [saveTitle, title]);

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
        {t('edit.common.loading')}
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

  const titleTrimmed = title.trim() || t('edit.common.newQuizModule');

  return (
    <>
      <FocusBar
        backTo="/app"
        backLabel={t('shell.leave')}
        title={titleTrimmed}
        status={isDirty ? t('shell.unsaved') : undefined}
      />
      <article
        className={cn(
          'mx-auto flex min-h-0 w-full max-w-[1180px] flex-1 flex-col gap-5 px-4 py-8 pb-16 sm:gap-6 sm:px-6',
          'text-(--text-primary)',
        )}
      >
        <h1 className="sr-only">
          {t('editQuiz.dialogEdit')}: {titleTrimmed}
        </h1>

        <header className="grid gap-0">
          <Panel
            className="p-5 sm:px-7 sm:py-6 lg:px-8"
            role="region"
            aria-label={t('aria.moduleSummary')}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
              <div className="min-w-0 flex-1">
                <label className="sr-only" htmlFor="module-title-input">
                  {t('edit.common.moduleTitle')}
                </label>
                <input
                  key={moduleId}
                  id="module-title-input"
                  name="quizoQuizModuleTitle"
                  value={title}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={MAX_MODULE_TITLE_LENGTH}
                  onChange={(e) => {
                    setTitle(e.target.value.slice(0, MAX_MODULE_TITLE_LENGTH));
                    setTitleError(null);
                  }}
                  aria-invalid={titleError !== null}
                  className="w-full min-w-0 border-0 bg-transparent font-(family-name:--font-syne) text-2xl font-bold leading-tight tracking-[0.02em] wrap-break-word text-(--text-primary) outline-none placeholder:text-(--text-secondary) sm:text-3xl md:text-4xl"
                />
                {titleError ? (
                  <p
                    className="mt-2 font-(family-name:--font-dm-sans) text-xs text-destructive"
                    role="alert"
                  >
                    {titleError}
                  </p>
                ) : null}
                <ul
                  className="mt-4 flex list-none flex-col gap-3 p-0 text-sm text-(--text-secondary)"
                  aria-label={t('aria.moduleStatistics')}
                >
                  <li className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-(--module-badge-mint-bg) text-(--module-badge-mint-fg)">
                      <IdCard className="size-4" strokeWidth={2} aria-hidden />
                    </span>
                    <span className="font-(family-name:--font-dm-sans) text-(--text-primary)">
                      {t('modules.questions', { count: questions.length })}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-(--module-badge-violet-bg) text-(--module-badge-violet-fg)">
                      <BookOpen
                        className="size-4"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </span>
                    <span>{t('edit.common.zeroSessions')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                      <Clock className="size-4" strokeWidth={2} aria-hidden />
                    </span>
                    <span>{t('edit.common.lastStudiedNever')}</span>
                  </li>
                </ul>
              </div>
              <div className="shrink-0 self-stretch">
                <div className="mb-3 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 cursor-pointer rounded-[12px] px-4"
                    onClick={() => void saveTitle()}
                    disabled={!isDirty || titleSaving}
                  >
                    {titleSaving ? t('common.saving') : t('common.save')}
                  </Button>
                  <Button
                    type="button"
                    variant="outlineSoft"
                    size="icon-header"
                    className="rounded-[12px] text-(--text-secondary) hover:text-(--text-primary)"
                    title={t('aria.deleteModule')}
                    aria-label={t('aria.deleteModule')}
                    onClick={() => setDeleteModuleOpen(true)}
                  >
                    <Trash2 className="size-4" strokeWidth={2} aria-hidden />
                  </Button>
                </div>
                <Button
                  type="button"
                  disabled={questions.length === 0}
                  className="h-12 w-full min-w-56 gap-2 rounded-xl border-0 bg-(--secondary-accent) text-base font-bold text-white hover:bg-(--secondary-accent)/90 sm:w-auto"
                  onClick={openStudy}
                >
                  <ListChecks className="size-4" strokeWidth={2} aria-hidden />
                  {t('editQuiz.startQuiz')}
                </Button>
              </div>
            </div>
          </Panel>
        </header>

        <section
          className="rounded-2xl border border-(--border-default) bg-(--input-bg)/25 px-4 py-3 sm:flex sm:items-center sm:justify-between sm:px-5"
          aria-labelledby="quiz-settings-heading"
        >
          <h2
            id="quiz-settings-heading"
            className="font-(family-name:--font-syne) text-[0.6875rem] font-extrabold tracking-[0.2em] text-(--text-secondary) uppercase"
          >
            {t('editQuiz.settings')}
          </h2>
          <div className="mt-3 flex flex-col gap-4 sm:mt-0 sm:ml-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-x-8 sm:gap-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
              <span
                className="font-(family-name:--font-dm-sans) text-sm text-(--text-primary)"
                id="switch-quiz-timer-label"
              >
                {t('editQuiz.timer')}
              </span>
              <div className="flex flex-wrap items-center justify-end gap-3">
                <label
                  className={cn(
                    'flex items-center gap-2',
                    !timerEnabled && 'opacity-60',
                  )}
                >
                  <span className="sr-only" id="quiz-timer-duration-label">
                    {t('editQuiz.timerDuration')}
                  </span>
                  <Select
                    value={String(timerDurationSec)}
                    disabled={!timerEnabled}
                    onValueChange={(v) => {
                      const n = Number.parseInt(v, 10);
                      if (
                        SESSION_TIMER_DURATION_OPTIONS_SEC.includes(
                          n as SessionTimerDurationSec,
                        )
                      ) {
                        onTimerDuration(n as SessionTimerDurationSec);
                      }
                    }}
                  >
                    <SelectTrigger
                      size="sm"
                      className="min-w-30"
                      aria-labelledby="quiz-timer-duration-label"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SESSION_TIMER_DURATION_OPTIONS_SEC.map((sec) => (
                        <SelectItem key={sec} value={String(sec)}>
                          {t('sessionTimer.minutesShort', {
                            count: sec / 60,
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </label>
                <Switch
                  checked={timerEnabled}
                  onCheckedChange={onTimerEnabled}
                  className="data-[state=checked]:border-transparent data-[state=checked]:bg-(--secondary-accent) dark:data-[state=checked]:bg-(--secondary-accent) dark:data-[state=unchecked]:bg-white/20"
                  aria-labelledby="switch-quiz-timer-label"
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <span
                className="font-(family-name:--font-dm-sans) text-sm text-(--text-primary)"
                id="switch-shuffle-label"
              >
                {t('editQuiz.shuffle')}
              </span>
              <Switch
                checked={shuffle}
                onCheckedChange={onShuffle}
                className="data-[state=checked]:border-transparent data-[state=checked]:bg-(--secondary-accent) dark:data-[state=checked]:bg-(--secondary-accent) dark:data-[state=unchecked]:bg-white/20"
                aria-labelledby="switch-shuffle-label"
              />
            </div>
          </div>
        </section>

        <section
          className={cn(
            'min-h-0 flex-1',
            wideLayout &&
              'lg:grid lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)] lg:items-start lg:gap-5',
          )}
          aria-labelledby="questions-section-heading"
        >
          <div>
            <div className="mb-3 flex flex-col gap-3">
              <h2
                id="questions-section-heading"
                className="min-w-0 font-(family-name:--font-syne) text-xl font-bold tracking-[-0.04em] text-(--text-primary) sm:text-2xl"
              >
                {t('editQuiz.questionsTitle', { count: questions.length })}
              </h2>
              <div className="relative w-full min-w-0">
                <label htmlFor="question-search" className="sr-only">
                  {t('editQuiz.searchQuestions')}
                </label>
                <Search
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-(--text-secondary)"
                  strokeWidth={2}
                  aria-hidden
                />
                <Input
                  id="question-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('editQuiz.searchPlaceholder')}
                  className="h-[52px] w-full rounded-[10px] border border-(--border-default) bg-(--input-bg) pl-10 text-base text-(--text-primary) shadow-none focus-visible:border-(--primary-accent) focus-visible:ring-2 focus-visible:ring-(--primary-accent)/20"
                />
              </div>
            </div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <input
                ref={importInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(event) => void onImportFile(event)}
              />
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2 rounded-xl"
                onClick={onClickImport}
                disabled={importing}
              >
                <Upload className="size-4" strokeWidth={2} />
                {importing ? t('common.loading') : t('editQuiz.importJson')}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 gap-2 rounded-xl"
                onClick={onExportJson}
                disabled={importing}
              >
                <Download className="size-4" strokeWidth={2} />
                {t('editQuiz.exportJson')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-(--text-secondary)"
                onClick={() => setImportHelpOpen(true)}
                title={t('editQuiz.importFormatHelpTitle')}
                aria-label={t('editQuiz.importFormatHelpTitle')}
              >
                <CircleHelp className="size-4" strokeWidth={2} />
              </Button>
            </div>

            <Panel className="flex max-h-[min(52vh,520px)] min-h-[220px] flex-col overflow-hidden">
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-y-contain p-3 sm:space-y-2.5 sm:p-4">
                {filtered.length === 0 ? (
                  <p className="py-10 text-center text-sm text-(--text-secondary) sm:py-12">
                    {questions.length === 0
                      ? t('editQuiz.noQuestions')
                      : t('editQuiz.noQuestionsMatch')}
                  </p>
                ) : (
                  <ul
                    className="list-none space-y-2.5 p-0 sm:space-y-3"
                    role="list"
                  >
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={onDragEnd}
                    >
                      <SortableContext
                        items={filtered.map((question) => question.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {filtered.map((q, index) => (
                          <SortableQuestionRow
                            key={q.id}
                            q={q}
                            index={index}
                            total={filtered.length}
                            canReorder={canDragReorder}
                            selected={
                              questionDialogOpen && editingQuestion?.id === q.id
                            }
                            onEdit={openEditQuestion}
                            onDelete={onDeleteQuestion}
                            onMoveUp={(questionId) =>
                              onMoveQuestion(questionId, -1)
                            }
                            onMoveDown={(questionId) =>
                              onMoveQuestion(questionId, 1)
                            }
                            t={t}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  </ul>
                )}
                {!canDragReorder ? (
                  <p className="mt-2 px-1 text-xs text-(--text-secondary)">
                    {t('editQuiz.reorderSearchHint')}
                  </p>
                ) : null}
              </div>
            </Panel>

            <div className="mt-5 flex justify-center sm:mt-6">
              <Button
                type="button"
                variant="cta"
                className="h-12 gap-2 rounded-[12px] px-8 font-(family-name:--font-syne) text-base font-bold shadow-[0_4px_15px_var(--purple-glow)] transition-all duration-300 ease-in-out"
                onClick={openAddQuestion}
                disabled={questions.length >= MAX_QUESTIONS_PER_MODULE}
              >
                <Plus className="size-4" strokeWidth={2.5} />
                {t('editQuiz.addQuestion')}
              </Button>
            </div>
          </div>
          {wideLayout ? (
            <QuizQuestionDialog
              presentation="panel"
              open={questionDialogOpen}
              editingQuestion={editingQuestion}
              questionsCount={questions.length}
              moduleId={moduleId}
              onOpenChange={(nextOpen) => {
                setQuestionDialogOpen(nextOpen);
                if (!nextOpen) setEditingQuestion(null);
              }}
              onCreateQuestion={onCreateQuestion}
              onUpdateQuestion={onUpdateQuestion}
            />
          ) : null}
        </section>

        {wideLayout ? null : (
          <QuizQuestionDialog
            open={questionDialogOpen}
            editingQuestion={editingQuestion}
            questionsCount={questions.length}
            moduleId={moduleId}
            onOpenChange={(nextOpen) => {
              setQuestionDialogOpen(nextOpen);
              if (!nextOpen) setEditingQuestion(null);
            }}
            onCreateQuestion={onCreateQuestion}
            onUpdateQuestion={onUpdateQuestion}
          />
        )}

        <AlertDialog
          open={pendingImportFile !== null}
          onOpenChange={(open) => {
            if (!open) setPendingImportFile(null);
          }}
        >
          <AlertDialogContent className="max-w-sm border-(--border-default) bg-(--bg-color) text-(--text-primary)">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-(family-name:--font-syne) text-base">
                {t('editQuiz.importReplaceTitle')}
              </AlertDialogTitle>
              <AlertDialogDescription className="font-(family-name:--font-dm-sans) text-(--text-secondary)">
                {t('editQuiz.importReplaceDescription', {
                  count: questions.length,
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:flex-col sm:gap-2">
              <AlertDialogCancel
                className="w-full border-(--border-default) sm:w-full"
                disabled={importing}
              >
                {t('common.cancel')}
              </AlertDialogCancel>
              <Button
                type="button"
                variant="destructive"
                className="w-full sm:w-full"
                disabled={importing}
                onClick={() => void confirmImportReplace()}
              >
                {importing
                  ? t('common.loading')
                  : t('edit.common.importReplaceAction')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <DeleteModuleDialog
          open={deleteModuleOpen}
          pending={deleteModulePending}
          moduleTitle={titleTrimmed}
          onOpenChange={setDeleteModuleOpen}
          onConfirm={onDeleteModule}
        />

        <Dialog open={importHelpOpen} onOpenChange={setImportHelpOpen}>
          <DialogContent className="w-[min(52rem,calc(100%-2rem))] max-w-4xl">
            <DialogHeader>
              <DialogTitle>{t('editQuiz.importFormatHelpTitle')}</DialogTitle>
              <DialogDescription>
                {t('editQuiz.importFormatHelpDescription')}
              </DialogDescription>
            </DialogHeader>
            <p className="text-xs text-(--text-secondary)">
              {t('editQuiz.importImagesNotSupported')}
            </p>
            <pre className="max-h-[50vh] overflow-auto rounded-xl border border-(--border-default) bg-(--input-bg)/30 p-4 text-xs leading-relaxed text-(--text-primary)">
              {quizJsonExample}
            </pre>
          </DialogContent>
        </Dialog>

        <AlertDialog open={leaveOpen} onOpenChange={onLeaveDialogOpenChange}>
          <AlertDialogContent className="max-w-sm" size="default">
            <AlertDialogHeader>
              <AlertDialogTitle>{t('common.unsavedChanges')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('edit.common.unsavedDescriptionQuiz')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:flex-col sm:gap-2">
              <Button
                type="button"
                variant="cta"
                className="w-full sm:w-full"
                onClick={() => void finishLeaveSave()}
              >
                {t('common.saveAndLeave')}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-full"
                onClick={finishLeaveNoSave}
              >
                {t('common.leaveWithoutSaving')}
              </Button>
              <AlertDialogCancel className="w-full sm:w-full">
                {t('common.cancel')}
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </article>
    </>
  );
}
