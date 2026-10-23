import {
  createCard,
  deleteModule,
  deleteCard,
  fetchModuleById,
  updateCard,
  updateModule,
} from '@/entities/module';
import { clearFlashcardDraftInflight } from '@/features/create-module';
import { useI18n } from '@/shared/i18n/useI18n';
import {
  MAX_FLASHCARDS_PER_MODULE,
  MAX_MODULE_TITLE_LENGTH,
} from '@/shared/config/module';
import { cn } from '@/shared/lib/utils';
import {
  readFlashTimerDurationSec,
  readFlashTimerEnabled,
  SESSION_TIMER_DURATION_OPTIONS_SEC,
  writeFlashTimerDurationSec,
  writeFlashTimerEnabled,
  type SessionTimerDurationSec,
} from '@/shared/lib/sessionTimerPrefs';
import type { ModuleCard, ModuleId } from '@/entities/module';
import { FlashcardCardDialog } from './FlashcardCardDialog';
import {
  FLASHCARD_IMPORT_FORMAT_VERSION,
  flashcardJsonExample,
  parseFlashcardImportJson,
  sanitizeFilenamePart,
} from '../model/flashcardImport';
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
import {
  BookOpen,
  CircleHelp,
  Clock,
  Download,
  IdCard,
  Layers,
  Pencil,
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
} from 'react';
import {
  Link,
  useBlocker,
  useNavigate,
  useParams,
  type Location,
} from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

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
            {t('edit.common.deleteDescriptionFlash', { title: moduleTitle })}
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

export function FlashcardEditor() {
  const { t } = useI18n();
  const { moduleId: rawId } = useParams();
  const moduleId = (rawId ?? '') as ModuleId;
  const navigate = useNavigate();

  const [loadState, setLoadState] = useState<
    'loading' | 'ok' | 'notfound' | 'wrongType'
  >('loading');
  const [title, setTitle] = useState(t('edit.common.newFlashModule'));
  const [savedTitle, setSavedTitle] = useState(t('edit.common.newFlashModule'));
  const [titleError, setTitleError] = useState<string | null>(null);
  const [cards, setCards] = useState<ModuleCard[]>([]);
  const [search, setSearch] = useState('');
  const [shuffle, setShuffle] = useState(true);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerDurationSec, setTimerDurationSec] =
    useState<SessionTimerDurationSec>(600);

  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<ModuleCard | null>(null);
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
      if (m.type !== 'FLASHCARD') {
        setLoadState('wrongType');
        return;
      }
      setTitle(m.title);
      setSavedTitle(m.title);
      setTitleError(null);
      setCards(m.cards);
      setShuffle(readShuffle(m.id));
      setTimerEnabled(readFlashTimerEnabled(m.id));
      setTimerDurationSec(readFlashTimerDurationSec(m.id));
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
      toast.error(
        t('editFlash.validationMaxCards', { count: MAX_FLASHCARDS_PER_MODULE }),
      );
      return;
    }
    setEditingCard(null);
    setCardDialogOpen(true);
  }, [cards.length, t]);

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
      toast.success(t('editFlash.cardAdded'));
    },
    [cards.length, moduleId, t],
  );

  const onUpdateCard = useCallback(
    async (cardId: string, question: string, answer: string) => {
      const updated = await updateCard(moduleId, cardId, {
        question,
        answer,
      });
      setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      toast.success(t('editFlash.cardUpdated'));
    },
    [moduleId, t],
  );

  const onDeleteCard = useCallback(
    async (c: ModuleCard) => {
      try {
        await deleteCard(moduleId, c.id);
        setCards((prev) => prev.filter((x) => x.id !== c.id));
        toast.success(t('editFlash.cardRemoved'));
      } catch {
        toast.error(t('editFlash.cardDeleteFailed'));
      }
    },
    [moduleId, t],
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
      writeFlashTimerEnabled(moduleId, v);
    },
    [moduleId],
  );

  const onTimerDuration = useCallback(
    (sec: SessionTimerDurationSec) => {
      setTimerDurationSec(sec);
      writeFlashTimerDurationSec(moduleId, sec);
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
    void navigate(`/app/modules/${encodeURIComponent(moduleId)}/flash-study`);
  }, [moduleId, navigate]);

  const onClickImport = useCallback(() => {
    importInputRef.current?.click();
  }, []);

  const runFlashImport = useCallback(
    async (file: File) => {
      setImporting(true);
      try {
        const rawText = await file.text();
        const parsed = JSON.parse(rawText) as unknown;
        const importedCards = parseFlashcardImportJson(parsed, t);

        await Promise.all(cards.map((card) => deleteCard(moduleId, card.id)));

        const createdCards: ModuleCard[] = [];
        for (const [index, card] of importedCards.entries()) {
          const created = await createCard(moduleId, {
            question: card.question,
            answer: card.answer,
            orderIndex: index,
          });
          createdCards.push(created);
        }

        setCards(
          createdCards.sort(
            (left, right) => left.orderIndex - right.orderIndex,
          ),
        );
        toast.success(
          t('editFlash.importSuccess', { count: createdCards.length }),
        );
      } catch (error) {
        if (error instanceof SyntaxError) {
          toast.error(t('editFlash.importInvalidJson'));
          return;
        }
        toast.error(
          error instanceof Error ? error.message : t('editFlash.importFailed'),
        );
      } finally {
        setImporting(false);
      }
    },
    [cards, moduleId, t],
  );

  const onImportFile = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;

      if (cards.length > 0) {
        setPendingImportFile(file);
        return;
      }

      await runFlashImport(file);
    },
    [cards.length, runFlashImport],
  );

  const confirmImportReplace = useCallback(() => {
    const next = pendingImportFile;
    setPendingImportFile(null);
    if (next) void runFlashImport(next);
  }, [pendingImportFile, runFlashImport]);

  const onExportJson = useCallback(() => {
    const exportData = {
      formatVersion: FLASHCARD_IMPORT_FORMAT_VERSION,
      moduleType: 'FLASHCARD',
      title: title.trim(),
      cards: [...cards]
        .sort((left, right) => left.orderIndex - right.orderIndex)
        .map((card) => ({
          question: card.question,
          answer: card.answer,
        })),
    };
    const content = JSON.stringify(exportData, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const suffix = sanitizeFilenamePart(title) || 'flashcard-module';
    anchor.href = url;
    anchor.download = `${suffix}.json`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success(t('editFlash.exportSuccess'));
  }, [cards, t, title]);

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

  const titleTrimmed = title.trim() || t('edit.common.newFlashModule');

  return (
    <article
      className={cn(
        'mx-auto flex min-h-0 w-full max-w-[1200px] flex-1 flex-col gap-5 pb-4 sm:gap-6',
        'text-(--text-primary)',
      )}
    >
      <h1 className="sr-only">
        {t('editFlash.dialogEdit')}: {titleTrimmed}
      </h1>
      <nav
        className="text-xs text-(--text-secondary)"
        aria-label={t('aria.breadcrumb')}
      >
        <ol className="flex min-w-0 list-none flex-wrap items-center gap-x-1.5 gap-y-1 p-0">
          <li className="shrink-0">
            <Link
              to="/app"
              className="font-(family-name:--font-dm-sans) font-medium text-(--text-secondary) underline-offset-2 transition-opacity hover:opacity-100 hover:underline"
            >
              {t('modules.myModules')}
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
                name="quizoModuleTitle"
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
                    {t('modules.cards', { count: cards.length })}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-(--module-badge-violet-bg) text-(--module-badge-violet-fg)">
                    <BookOpen className="size-4" strokeWidth={2} aria-hidden />
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
                disabled={cards.length === 0}
                className="h-12 w-full min-w-56 gap-2 rounded-[12px] border-0 bg-(--secondary-accent) font-(family-name:--font-syne) text-base font-bold text-white shadow-[0_4px_15px_rgba(0,212,170,0.2)] transition-all duration-300 ease-in-out hover:bg-(--secondary-accent)/90 sm:w-auto"
                onClick={openStudy}
              >
                <Layers className="size-4" strokeWidth={2} aria-hidden />
                {t('editFlash.startStudy')}
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
          {t('editFlash.settings')}
        </h2>
        <div className="mt-3 flex flex-col gap-4 sm:mt-0 sm:ml-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-x-8 sm:gap-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
            <span
              className="font-(family-name:--font-dm-sans) text-sm text-(--text-primary)"
              id="switch-flash-timer-label"
            >
              {t('editFlash.timer')}
            </span>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <label
                className={cn(
                  'flex items-center gap-2',
                  !timerEnabled && 'opacity-60',
                )}
              >
                <span className="sr-only" id="flash-timer-duration-label">
                  {t('editFlash.timerDuration')}
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
                    aria-labelledby="flash-timer-duration-label"
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
                aria-labelledby="switch-flash-timer-label"
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span
              className="font-(family-name:--font-dm-sans) text-sm text-(--text-primary)"
              id="switch-shuffle-label"
            >
              {t('editFlash.shuffle')}
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
        className="min-h-0 flex-1"
        aria-labelledby="cards-section-heading"
      >
        <div className="mb-3 flex flex-col gap-3 lg:mb-4 lg:flex-row lg:items-center lg:justify-between">
          <h2
            id="cards-section-heading"
            className="min-w-0 font-(family-name:--font-syne) text-xl font-bold tracking-[-0.04em] text-(--text-primary) sm:text-2xl"
          >
            {t('editFlash.cardsTitle', { count: cards.length })}
          </h2>
          <div className="relative w-full min-w-0 sm:max-w-full lg:w-80">
            <label htmlFor="card-search" className="sr-only">
              {t('editFlash.searchCards')}
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
              placeholder={t('editFlash.searchPlaceholder')}
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
            {importing ? t('common.loading') : t('editFlash.importJson')}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-10 gap-2 rounded-xl"
            onClick={onExportJson}
            disabled={importing}
          >
            <Download className="size-4" strokeWidth={2} />
            {t('editFlash.exportJson')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-(--text-secondary)"
            onClick={() => setImportHelpOpen(true)}
            title={t('editFlash.importFormatHelpTitle')}
            aria-label={t('editFlash.importFormatHelpTitle')}
          >
            <CircleHelp className="size-4" strokeWidth={2} />
          </Button>
        </div>

        <Panel className="flex max-h-[min(52vh,520px)] min-h-[220px] flex-col overflow-hidden">
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-y-contain p-3 sm:space-y-2.5 sm:p-4">
            {filtered.length === 0 ? (
              <p className="py-10 text-center text-sm text-(--text-secondary) sm:py-12">
                {cards.length === 0
                  ? t('editFlash.noCards')
                  : t('editFlash.noCardsMatch')}
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
                        aria-label={t('aria.order', { number: n })}
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
                          aria-label={t('aria.editCard')}
                        >
                          <Pencil className="size-4" strokeWidth={2} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-(--text-secondary) hover:text-(--danger-color)"
                          onClick={() => void onDeleteCard(c)}
                          aria-label={t('aria.deleteCard')}
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
            {t('editFlash.addCard')}
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

      <AlertDialog
        open={pendingImportFile !== null}
        onOpenChange={(open) => {
          if (!open) setPendingImportFile(null);
        }}
      >
        <AlertDialogContent className="max-w-sm border-(--border-default) bg-(--bg-color) text-(--text-primary)">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-(family-name:--font-syne) text-base">
              {t('editFlash.importReplaceTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-(family-name:--font-dm-sans) text-(--text-secondary)">
              {t('editFlash.importReplaceDescription', {
                count: cards.length,
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
            <DialogTitle>{t('editFlash.importFormatHelpTitle')}</DialogTitle>
            <DialogDescription>
              {t('editFlash.importFormatHelpDescription')}
            </DialogDescription>
          </DialogHeader>
          <pre className="max-h-[50vh] overflow-auto rounded-xl border border-(--border-default) bg-(--input-bg)/30 p-4 text-xs leading-relaxed text-(--text-primary)">
            {flashcardJsonExample}
          </pre>
        </DialogContent>
      </Dialog>

      <AlertDialog open={leaveOpen} onOpenChange={onLeaveDialogOpenChange}>
        <AlertDialogContent className="max-w-sm" size="default">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.unsavedChanges')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('edit.common.unsavedDescriptionFlash')}
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
  );
}
