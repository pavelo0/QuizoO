import {
  createQuestion,
  deleteModule,
  deleteQuestion,
  fetchModuleById,
  updateModule,
  updateQuestion,
} from '@/lib/api/modules';
import { apiErrorMessage } from '@/lib/apiErrorMessage';
import { MAX_MODULE_TITLE_LENGTH } from '@/lib/moduleConstants';
import { clearQuizDraftInflight } from '@/lib/quizModuleDraft';
import { cn } from '@/lib/utils';
import type { ModuleId, ModuleQuestion, QuestionType } from '@/types/module';
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
  ListChecks,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
} from 'react';
import { Link, useBlocker, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const MAX_QUESTIONS_PER_MODULE = 30;

const textareaClass = cn(
  'min-h-28 w-full rounded-2xl border border-(--border-default) bg-(--input-bg) px-4 py-3 text-sm text-(--text-primary) shadow-none',
  'placeholder:text-(--text-secondary) md:text-sm',
  'focus-visible:border-(--primary-accent) focus-visible:ring-2 focus-visible:ring-(--primary-accent)/25',
  'dark:border-white/10',
);

const labelClass = cn(
  'mb-2 block font-(family-name:--font-dm-sans) text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--text-secondary)',
);

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

type QuestionTypeUi = {
  value: QuestionType;
  title: string;
  badge: string;
};

const QUESTION_TYPES: QuestionTypeUi[] = [
  { value: 'CHOICE', title: 'Choice', badge: 'Choice' },
  { value: 'TEXT', title: 'Text answer', badge: 'Text' },
  { value: 'MATCHING', title: 'Matching', badge: 'Matching' },
];

const DEFAULT_MATCHING_PAIRS = [
  { leftItem: '', rightItem: '' },
  { leftItem: '', rightItem: '' },
];

function labelByType(type: QuestionType) {
  return QUESTION_TYPES.find((t) => t.value === type)?.badge ?? type;
}

function summarizeQuestion(q: ModuleQuestion) {
  if (q.type === 'CHOICE') {
    return q.questionOptions.map((o) => o.text).join(' · ') || 'No options yet';
  }
  if (q.type === 'TEXT') {
    const correct = q.questionOptions.find((o) => o.isCorrect)?.text?.trim();
    return correct ? `Correct answer: ${correct}` : 'Correct answer is not set';
  }
  if (q.type === 'MATCHING') {
    return (
      q.matchingPairs
        .map((p) => `${p.leftItem} -> ${p.rightItem}`)
        .join(' · ') || 'No pairs yet'
    );
  }
  return 'Text answer question';
}

type QuestionDialogProps = {
  open: boolean;
  editingQuestion: ModuleQuestion | null;
  questionsCount: number;
  onOpenChange: (open: boolean) => void;
  onCreateQuestion: (payload: {
    questionText: string;
    type: QuestionType;
    options?: Array<{ text: string; isCorrect: boolean }>;
    matchingPairs?: Array<{ leftItem: string; rightItem: string }>;
  }) => Promise<void>;
  onUpdateQuestion: (
    questionId: string,
    payload: {
      questionText: string;
      type: QuestionType;
      options?: Array<{ text: string; isCorrect: boolean }>;
      matchingPairs?: Array<{ leftItem: string; rightItem: string }>;
    },
  ) => Promise<void>;
};

const QuizQuestionDialog = memo(function QuizQuestionDialog({
  open,
  editingQuestion,
  questionsCount,
  onOpenChange,
  onCreateQuestion,
  onUpdateQuestion,
}: QuestionDialogProps) {
  const [type, setType] = useState<QuestionType>('CHOICE');
  const [questionText, setQuestionText] = useState('');
  const [textAnswer, setTextAnswer] = useState('');
  const [options, setOptions] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [pairs, setPairs] = useState(DEFAULT_MATCHING_PAIRS);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{
    questionText?: string;
    textAnswer?: string;
    options?: string;
    matching?: string;
    form?: string;
  }>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSaving(false);
    if (!editingQuestion) {
      setType('CHOICE');
      setQuestionText('');
      setTextAnswer('');
      setOptions([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ]);
      setPairs(DEFAULT_MATCHING_PAIRS);
      return;
    }
    setType(editingQuestion.type);
    setQuestionText(editingQuestion.questionText);
    setTextAnswer(
      editingQuestion.questionOptions.find((o) => o.isCorrect)?.text ?? '',
    );
    setOptions(
      editingQuestion.questionOptions.length > 0
        ? editingQuestion.questionOptions.map((o) => ({
            text: o.text,
            isCorrect: o.isCorrect,
          }))
        : [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
          ],
    );
    setPairs(
      editingQuestion.matchingPairs.length > 0
        ? editingQuestion.matchingPairs.map((p) => ({
            leftItem: p.leftItem,
            rightItem: p.rightItem,
          }))
        : DEFAULT_MATCHING_PAIRS,
    );
  }, [open, editingQuestion]);

  const addChoiceOption = useCallback(() => {
    setOptions((prev) => [...prev, { text: '', isCorrect: false }]);
  }, []);

  const addMatchingPair = useCallback(() => {
    setPairs((prev) => [...prev, { leftItem: '', rightItem: '' }]);
  }, []);

  const onSubmit = useCallback(async () => {
    const question = questionText.trim();
    const nextErrors: {
      questionText?: string;
      textAnswer?: string;
      options?: string;
      matching?: string;
      form?: string;
    } = {};

    if (!question) nextErrors.questionText = 'Enter question text.';
    if (!editingQuestion && questionsCount >= MAX_QUESTIONS_PER_MODULE) {
      nextErrors.form = `You can add up to ${MAX_QUESTIONS_PER_MODULE} questions.`;
    }

    const cleanOptions = options
      .map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect }))
      .filter((o) => o.text.length > 0 || o.isCorrect);
    const cleanPairs = pairs
      .map((p) => ({
        leftItem: p.leftItem.trim(),
        rightItem: p.rightItem.trim(),
      }))
      .filter((p) => p.leftItem.length > 0 || p.rightItem.length > 0);

    if (type === 'CHOICE') {
      if (cleanOptions.length < 2) {
        nextErrors.options = 'Add at least 2 options.';
      } else if (cleanOptions.some((o) => !o.text)) {
        nextErrors.options = 'Option text cannot be empty.';
      } else if (cleanOptions.filter((o) => o.isCorrect).length < 1) {
        nextErrors.options = 'Mark at least one correct option.';
      }
    }

    if (type === 'MATCHING') {
      if (cleanPairs.length < 2) {
        nextErrors.matching = 'Add at least 2 matching pairs.';
      } else if (
        cleanPairs.some(
          (p) => p.leftItem.length === 0 || p.rightItem.length === 0,
        )
      ) {
        nextErrors.matching = 'Both values are required for each pair.';
      }
    }

    const cleanTextAnswer = textAnswer.trim();
    if (type === 'TEXT' && !cleanTextAnswer) {
      nextErrors.textAnswer = 'Enter the correct text answer.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload: {
      questionText: string;
      type: QuestionType;
      options?: Array<{ text: string; isCorrect: boolean }>;
      matchingPairs?: Array<{ leftItem: string; rightItem: string }>;
    } = { questionText: question, type };

    if (type === 'CHOICE') {
      payload.options = cleanOptions;
    }
    if (type === 'TEXT') {
      payload.options = [{ text: cleanTextAnswer, isCorrect: true }];
    }
    if (type === 'MATCHING') {
      payload.matchingPairs = cleanPairs;
    }

    setSaving(true);
    setErrors({});
    try {
      if (editingQuestion) {
        await onUpdateQuestion(editingQuestion.id, payload);
      } else {
        await onCreateQuestion(payload);
      }
      onOpenChange(false);
    } catch (err) {
      setErrors({ form: apiErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  }, [
    editingQuestion,
    onCreateQuestion,
    onOpenChange,
    onUpdateQuestion,
    options,
    pairs,
    questionText,
    textAnswer,
    questionsCount,
    type,
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
        className="w-[min(44rem,calc(100%-2rem))] max-w-3xl gap-0 p-0 sm:max-w-3xl"
        showCloseButton
      >
        <div className="p-6 sm:p-8">
          <DialogHeader className="mb-0 gap-0 space-y-0 text-left sm:text-left">
            <DialogTitle className="font-(family-name:--font-syne) text-lg font-bold tracking-[0.02em] text-(--text-primary) sm:text-xl">
              {editingQuestion ? 'Edit question' : 'New question'}
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

          <div className={cn('mt-6 space-y-6', errors.form ? 'mt-5' : 'mt-6')}>
            <div>
              <p className={labelClass}>Question type</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {QUESTION_TYPES.map((t) => (
                  <Button
                    key={t.value}
                    type="button"
                    variant={type === t.value ? 'cta' : 'outline'}
                    className={cn(
                      'h-11 rounded-xl text-sm',
                      type === t.value &&
                        'shadow-[0_4px_15px_var(--purple-glow)]',
                    )}
                    onClick={() => {
                      setType(t.value);
                      setErrors((prev) => ({
                        ...prev,
                        textAnswer: undefined,
                        options: undefined,
                        matching: undefined,
                        form: undefined,
                      }));
                    }}
                  >
                    {t.title}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="quiz-question-text">
                Question
              </label>
              <Textarea
                id="quiz-question-text"
                value={questionText}
                onChange={(e) => {
                  setQuestionText(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    questionText: undefined,
                    form: undefined,
                  }));
                }}
                placeholder="e.g. Which statement is correct?"
                rows={4}
                aria-invalid={!!errors.questionText}
                className={cn(
                  textareaClass,
                  'resize-y',
                  errors.questionText && 'border-destructive',
                )}
              />
              {errors.questionText ? (
                <p
                  className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
                  role="alert"
                >
                  {errors.questionText}
                </p>
              ) : null}
            </div>

            {type === 'TEXT' ? (
              <div>
                <label className={labelClass} htmlFor="quiz-text-answer">
                  Correct answer
                </label>
                <Input
                  id="quiz-text-answer"
                  value={textAnswer}
                  onChange={(e) => {
                    setTextAnswer(e.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      textAnswer: undefined,
                      form: undefined,
                    }));
                  }}
                  placeholder="e.g. Paris"
                  aria-invalid={!!errors.textAnswer}
                  className={cn(
                    'h-11 rounded-xl',
                    errors.textAnswer && 'border-destructive',
                  )}
                />
                {errors.textAnswer ? (
                  <p
                    className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
                    role="alert"
                  >
                    {errors.textAnswer}
                  </p>
                ) : null}
              </div>
            ) : null}

            {type === 'CHOICE' ? (
              <div>
                <p className={labelClass}>Options</p>
                <div className="space-y-2.5">
                  {options.map((opt, idx) => (
                    <div key={`opt-${idx}`} className="flex items-center gap-2">
                      <Input
                        value={opt.text}
                        onChange={(e) => {
                          const v = e.target.value;
                          setOptions((prev) =>
                            prev.map((x, i) =>
                              i === idx ? { ...x, text: v } : x,
                            ),
                          );
                          setErrors((prev) => ({
                            ...prev,
                            options: undefined,
                            form: undefined,
                          }));
                        }}
                        placeholder={`Option ${idx + 1}`}
                        className="h-11 rounded-xl"
                      />
                      <label className="flex shrink-0 items-center gap-2 text-xs text-(--text-secondary)">
                        <input
                          type="checkbox"
                          checked={opt.isCorrect}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setOptions((prev) =>
                              prev.map((x, i) =>
                                i === idx ? { ...x, isCorrect: checked } : x,
                              ),
                            );
                            setErrors((prev) => ({
                              ...prev,
                              options: undefined,
                              form: undefined,
                            }));
                          }}
                        />
                        Correct
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-xl"
                    onClick={addChoiceOption}
                  >
                    Add option
                  </Button>
                </div>
                {errors.options ? (
                  <p
                    className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
                    role="alert"
                  >
                    {errors.options}
                  </p>
                ) : null}
              </div>
            ) : null}

            {type === 'MATCHING' ? (
              <div>
                <p className={labelClass}>Matching pairs</p>
                <div className="space-y-2.5">
                  {pairs.map((pair, idx) => (
                    <div
                      key={`pair-${idx}`}
                      className="grid items-center gap-2 sm:grid-cols-[1fr_28px_1fr]"
                    >
                      <Input
                        value={pair.leftItem}
                        onChange={(e) => {
                          const v = e.target.value;
                          setPairs((prev) =>
                            prev.map((x, i) =>
                              i === idx ? { ...x, leftItem: v } : x,
                            ),
                          );
                          setErrors((prev) => ({
                            ...prev,
                            matching: undefined,
                            form: undefined,
                          }));
                        }}
                        placeholder="Left item"
                        className="h-11 rounded-xl"
                      />
                      <span className="text-center text-xs text-(--text-secondary)">
                        →
                      </span>
                      <Input
                        value={pair.rightItem}
                        onChange={(e) => {
                          const v = e.target.value;
                          setPairs((prev) =>
                            prev.map((x, i) =>
                              i === idx ? { ...x, rightItem: v } : x,
                            ),
                          );
                          setErrors((prev) => ({
                            ...prev,
                            matching: undefined,
                            form: undefined,
                          }));
                        }}
                        placeholder="Right item"
                        className="h-11 rounded-xl"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-xl"
                    onClick={addMatchingPair}
                  >
                    Add pair
                  </Button>
                </div>
                {errors.matching ? (
                  <p
                    className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
                    role="alert"
                  >
                    {errors.matching}
                  </p>
                ) : null}
              </div>
            ) : null}
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
            {saving ? 'Saving…' : editingQuestion ? 'Save' : 'Add question'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
QuizQuestionDialog.displayName = 'QuizQuestionDialog';

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
            its questions. This action cannot be undone.
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

export default function EditQuizModulePage() {
  const { moduleId: rawId } = useParams();
  const moduleId = (rawId ?? '') as ModuleId;
  const navigate = useNavigate();

  const [loadState, setLoadState] = useState<
    'loading' | 'ok' | 'notfound' | 'wrongType'
  >('loading');
  const [title, setTitle] = useState('New quiz module');
  const [savedTitle, setSavedTitle] = useState('New quiz module');
  const [questions, setQuestions] = useState<ModuleQuestion[]>([]);
  const [search, setSearch] = useState('');
  const [shuffle, setShuffle] = useState(true);

  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ModuleQuestion | null>(
    null,
  );
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
      if (m.type !== 'QUIZ') {
        setLoadState('wrongType');
        return;
      }
      setTitle(m.title);
      setSavedTitle(m.title);
      setQuestions(m.questions);
      setShuffle(readShuffle(m.id));
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

  const openAddQuestion = useCallback(() => {
    if (questions.length >= MAX_QUESTIONS_PER_MODULE) {
      toast.error(`You can add up to ${MAX_QUESTIONS_PER_MODULE} questions.`);
      return;
    }
    setEditingQuestion(null);
    setQuestionDialogOpen(true);
  }, [questions.length]);

  const openEditQuestion = useCallback((q: ModuleQuestion) => {
    setEditingQuestion(q);
    setQuestionDialogOpen(true);
  }, []);

  const onCreateQuestion = useCallback(
    async (payload: {
      questionText: string;
      type: QuestionType;
      options?: Array<{ text: string; isCorrect: boolean }>;
      matchingPairs?: Array<{ leftItem: string; rightItem: string }>;
    }) => {
      const created = await createQuestion(moduleId, {
        ...payload,
        orderIndex: questions.length,
      });
      setQuestions((prev) =>
        [...prev, created].sort((x, y) => x.orderIndex - y.orderIndex),
      );
      toast.success('Question added');
    },
    [moduleId, questions.length],
  );

  const onUpdateQuestion = useCallback(
    async (
      questionId: string,
      payload: {
        questionText: string;
        type: QuestionType;
        options?: Array<{ text: string; isCorrect: boolean }>;
        matchingPairs?: Array<{ leftItem: string; rightItem: string }>;
      },
    ) => {
      const updated = await updateQuestion(moduleId, questionId, payload);
      setQuestions((prev) =>
        prev.map((q) => (q.id === updated.id ? updated : q)),
      );
      toast.success('Question updated');
    },
    [moduleId],
  );

  const onDeleteQuestion = useCallback(
    async (q: ModuleQuestion) => {
      try {
        await deleteQuestion(moduleId, q.id);
        setQuestions((prev) => prev.filter((x) => x.id !== q.id));
        toast.success('Question removed');
      } catch {
        toast.error('Could not delete the question.');
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
            ? 'This module is not a quiz module.'
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

  const titleTrimmed = title.trim() || 'New quiz module';

  return (
    <article
      className={cn(
        'mx-auto flex min-h-0 w-full max-w-[1200px] flex-1 flex-col gap-5 pb-4 sm:gap-6',
        'text-(--text-primary)',
      )}
    >
      <h1 className="sr-only">Edit quiz module: {titleTrimmed}</h1>
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
                name="quizoQuizModuleTitle"
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
                    {questions.length}{' '}
                    {questions.length === 1 ? 'question' : 'questions'}
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
                disabled={questions.length === 0}
                className="h-12 w-full min-w-56 gap-2 rounded-[12px] border-0 bg-(--primary-accent) font-(family-name:--font-syne) text-base font-bold text-white shadow-[0_4px_15px_rgba(108,99,255,0.2)] transition-all duration-300 ease-in-out hover:bg-(--primary-accent)/90 sm:w-auto"
              >
                <ListChecks className="size-4" strokeWidth={2} aria-hidden />
                Start quiz
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
          Quiz settings
        </h2>
        <div className="mt-3 flex items-center justify-between gap-3 sm:mt-0 sm:ml-6">
          <span
            className="font-(family-name:--font-dm-sans) text-sm text-(--text-primary)"
            id="switch-shuffle-label"
          >
            Shuffle questions
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
        aria-labelledby="questions-section-heading"
      >
        <div className="mb-3 flex flex-col gap-3 lg:mb-4 lg:flex-row lg:items-center lg:justify-between">
          <h2
            id="questions-section-heading"
            className="min-w-0 font-(family-name:--font-syne) text-xl font-bold tracking-[-0.04em] text-(--text-primary) sm:text-2xl"
          >
            Questions ({questions.length})
          </h2>
          <div className="relative w-full min-w-0 sm:max-w-full lg:w-80">
            <label htmlFor="question-search" className="sr-only">
              Search questions
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
              placeholder="Search questions…"
              className="h-[52px] w-full rounded-[10px] border border-(--border-default) bg-(--input-bg) pl-10 text-base text-(--text-primary) shadow-none focus-visible:border-(--primary-accent) focus-visible:ring-2 focus-visible:ring-(--primary-accent)/20"
            />
          </div>
        </div>

        <Panel className="flex max-h-[min(52vh,520px)] min-h-[220px] flex-col overflow-hidden">
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-y-contain p-3 sm:space-y-2.5 sm:p-4">
            {filtered.length === 0 ? (
              <p className="py-10 text-center text-sm text-(--text-secondary) sm:py-12">
                {questions.length === 0
                  ? 'No questions yet. Add your first question below.'
                  : 'No questions match your search.'}
              </p>
            ) : (
              <ul
                className="list-none space-y-2.5 p-0 sm:space-y-3"
                role="list"
              >
                {filtered.map((q) => {
                  const n = String(
                    1 + questions.findIndex((x) => x.id === q.id),
                  ).padStart(2, '0');
                  return (
                    <li
                      key={q.id}
                      className="flex items-stretch gap-3 rounded-2xl border border-(--border-default) bg-(--input-bg)/35 px-3 py-3 transition-colors duration-300 sm:px-4"
                    >
                      <span
                        className="w-7 shrink-0 select-none pt-0.5 font-(family-name:--font-jetbrains-mono) text-xs text-(--text-secondary)"
                        aria-label={`Order ${n}`}
                      >
                        {n}
                      </span>
                      <div className="min-w-0 flex-1 text-left">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-(--text-primary) sm:text-base">
                            {q.questionText}
                          </h3>
                          <span className="inline-flex items-center rounded-full bg-(--module-badge-violet-bg) px-2.5 py-1 text-[0.625rem] font-bold tracking-[0.08em] text-(--module-badge-violet-fg) uppercase">
                            {labelByType(q.type)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-(--text-secondary) sm:text-sm">
                          {summarizeQuestion(q)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-(--text-secondary) hover:text-(--text-primary)"
                          onClick={() => openEditQuestion(q)}
                          aria-label="Edit question"
                        >
                          <Pencil className="size-4" strokeWidth={2} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-(--text-secondary) hover:text-(--danger-color)"
                          onClick={() => void onDeleteQuestion(q)}
                          aria-label="Delete question"
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
            onClick={openAddQuestion}
            disabled={questions.length >= MAX_QUESTIONS_PER_MODULE}
          >
            <Plus className="size-4" strokeWidth={2.5} />
            Add new question
          </Button>
        </div>
      </section>

      <QuizQuestionDialog
        open={questionDialogOpen}
        editingQuestion={editingQuestion}
        questionsCount={questions.length}
        onOpenChange={(nextOpen) => {
          setQuestionDialogOpen(nextOpen);
          if (!nextOpen) setEditingQuestion(null);
        }}
        onCreateQuestion={onCreateQuestion}
        onUpdateQuestion={onUpdateQuestion}
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
              Your questions are already kept on the server.
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
