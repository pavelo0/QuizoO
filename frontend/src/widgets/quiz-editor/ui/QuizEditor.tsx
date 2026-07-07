import { SortableOrderingList } from '@/features/edit-question-ordering';
import {
  DEFAULT_MATCHING_PAIRS,
  formatAcceptedVariantsText,
  getQuestionTypes,
  labelByType,
  parseAcceptedVariantsText,
  summarizeQuestion,
} from '@/features/edit-question-shared';
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
  DialogFooter,
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
import { Textarea } from '@/shared/ui/textarea';
import { useI18n } from '@/shared/i18n/useI18n';
import {
  createQuestion,
  deleteModule,
  deleteQuestion,
  deleteQuestionImage,
  fetchModuleById,
  questionImageUrl,
  updateModule,
  updateQuestion,
  uploadQuestionImage,
} from '@/entities/module';
import { apiErrorText } from '@/shared/lib/apiErrorMessage';
import { MAX_MODULE_TITLE_LENGTH } from '@/shared/config/module';
import { clearQuizDraftInflight } from '@/lib/quizModuleDraft';
import {
  SESSION_TIMER_DURATION_OPTIONS_SEC,
  readQuizTimerDurationSec,
  readQuizTimerEnabled,
  writeQuizTimerDurationSec,
  writeQuizTimerEnabled,
  type SessionTimerDurationSec,
} from '@/lib/sessionTimerPrefs';
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import axios from 'axios';
import {
  BookOpen,
  CircleHelp,
  Clock,
  Download,
  GripVertical,
  IdCard,
  Image as ImageIcon,
  ListChecks,
  MoveDown,
  MoveUp,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
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

const MAX_QUESTIONS_PER_MODULE = 30;
const QUIZ_IMPORT_FORMAT_VERSION = 1;
const QUESTION_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const QUESTION_IMAGE_ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

type QuestionPayload = {
  questionText: string;
  type: QuestionType;
  allowMultipleAnswers?: boolean;
  options?: Array<{ text: string; isCorrect: boolean }>;
  matchingPairs?: Array<{ leftItem: string; rightItem: string }>;
  orderingItems?: Array<{ text: string; correctOrder: number }>;
  acceptedVariants?: string[];
};

function createDefaultOrderingItems() {
  return [
    { id: crypto.randomUUID(), text: '' },
    { id: crypto.randomUUID(), text: '' },
  ];
}

const quizJsonExample = JSON.stringify(
  {
    formatVersion: QUIZ_IMPORT_FORMAT_VERSION,
    moduleType: 'QUIZ',
    _comment: 'Изображения вопросов не включаются в JSON импорта/экспорта.',
    title: 'Контрольный квиз',
    questions: [
      {
        type: 'CHOICE',
        questionText: 'Какой HTTP-метод обычно используют для создания записи?',
        allowMultipleAnswers: false,
        options: [
          { text: 'POST', isCorrect: true },
          { text: 'GET', isCorrect: false },
          { text: 'DELETE', isCorrect: false },
        ],
      },
      {
        type: 'TEXT',
        questionText: 'Назовите столицу Франции',
        answer: 'Париж',
        acceptedVariants: ['Paris', 'paris'],
      },
      {
        type: 'MATCHING',
        questionText: 'Сопоставьте термин и определение',
        pairs: [
          { left: 'Инкапсуляция', right: 'Сокрытие внутренней реализации' },
          {
            left: 'Полиморфизм',
            right: 'Единый интерфейс для разных реализаций',
          },
        ],
      },
      {
        type: 'ORDERING',
        questionText: 'Расположите исторические даты в хронологическом порядке',
        items: ['1914', '1789', '1945', '1969'],
      },
    ],
  },
  null,
  2,
);

function sanitizeFilenamePart(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё_-]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function toExportQuestion(q: ModuleQuestion) {
  if (q.type === 'CHOICE') {
    return {
      type: 'CHOICE',
      questionText: q.questionText,
      allowMultipleAnswers: q.allowMultipleAnswers,
      options: q.questionOptions.map((o) => ({
        text: o.text,
        isCorrect: o.isCorrect,
      })),
    };
  }
  if (q.type === 'TEXT') {
    const answer = q.questionOptions.find((o) => o.isCorrect)?.text ?? '';
    const exported: {
      type: 'TEXT';
      questionText: string;
      answer: string;
      acceptedVariants?: string[];
    } = {
      type: 'TEXT',
      questionText: q.questionText,
      answer,
    };
    if (q.acceptedVariants && q.acceptedVariants.length > 0) {
      exported.acceptedVariants = q.acceptedVariants;
    }
    return exported;
  }
  if (q.type === 'MATCHING') {
    return {
      type: 'MATCHING',
      questionText: q.questionText,
      pairs: q.matchingPairs.map((p) => ({
        left: p.leftItem,
        right: p.rightItem,
      })),
    };
  }
  return {
    type: 'ORDERING',
    questionText: q.questionText,
    items: [...(Array.isArray(q.orderingItems) ? q.orderingItems : [])]
      .sort((a, b) => (a.correctOrder ?? 0) - (b.correctOrder ?? 0))
      .map((item) => item.text),
  };
}

function parseQuizImportJson(
  raw: unknown,
  t: (key: string, vars?: Record<string, string | number>) => string,
): QuestionPayload[] {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error(t('editQuiz.importInvalidStructure'));
  }

  const data = raw as {
    formatVersion?: number;
    moduleType?: string;
    questions?: unknown;
  };

  if (data.formatVersion !== QUIZ_IMPORT_FORMAT_VERSION) {
    throw new Error(
      t('editQuiz.importUnsupportedVersion', {
        version: QUIZ_IMPORT_FORMAT_VERSION,
      }),
    );
  }
  if (data.moduleType !== 'QUIZ') {
    throw new Error(t('editQuiz.importWrongModuleType'));
  }
  if (!Array.isArray(data.questions)) {
    throw new Error(t('editQuiz.importQuestionsArrayRequired'));
  }
  if (data.questions.length > MAX_QUESTIONS_PER_MODULE) {
    throw new Error(
      t('editQuiz.validationMaxQuestions', { count: MAX_QUESTIONS_PER_MODULE }),
    );
  }

  return data.questions.map((item, idx) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error(
        t('editQuiz.importQuestionObjectExpected', { index: idx + 1 }),
      );
    }
    const q = item as {
      type?: string;
      questionText?: string;
      allowMultipleAnswers?: boolean;
      options?: unknown;
      answer?: string;
      acceptedVariants?: unknown;
      pairs?: unknown;
      items?: unknown;
    };
    const questionText = q.questionText?.trim() ?? '';
    if (!questionText) {
      throw new Error(
        t('editQuiz.importQuestionTextRequired', { index: idx + 1 }),
      );
    }

    if (q.type === 'CHOICE') {
      if (!Array.isArray(q.options) || q.options.length < 2) {
        throw new Error(
          t('editQuiz.importChoiceOptionsMin', { index: idx + 1 }),
        );
      }
      const options = q.options.map((opt) => {
        if (!opt || typeof opt !== 'object' || Array.isArray(opt)) {
          throw new Error(
            t('editQuiz.importChoiceOptionInvalid', { index: idx + 1 }),
          );
        }
        const option = opt as { text?: string; isCorrect?: boolean };
        const text = option.text?.trim() ?? '';
        if (!text) {
          throw new Error(
            t('editQuiz.importChoiceOptionTextRequired', { index: idx + 1 }),
          );
        }
        return { text, isCorrect: !!option.isCorrect };
      });
      const correctCount = options.filter((o) => o.isCorrect).length;
      if (correctCount < 1) {
        throw new Error(
          t('editQuiz.importChoiceCorrectRequired', { index: idx + 1 }),
        );
      }
      const allowMultipleAnswers = !!q.allowMultipleAnswers;
      if (!allowMultipleAnswers && correctCount !== 1) {
        throw new Error(
          t('editQuiz.importChoiceSingleCorrect', { index: idx + 1 }),
        );
      }
      return {
        questionText,
        type: 'CHOICE' as const,
        allowMultipleAnswers,
        options,
      };
    }

    if (q.type === 'TEXT') {
      const answer = q.answer?.trim() ?? '';
      if (!answer) {
        throw new Error(
          t('editQuiz.importTextAnswerRequired', { index: idx + 1 }),
        );
      }
      let acceptedVariants: string[] | undefined;
      if (q.acceptedVariants !== undefined) {
        if (!Array.isArray(q.acceptedVariants)) {
          throw new Error(
            t('editQuiz.importTextVariantsInvalid', { index: idx + 1 }),
          );
        }
        acceptedVariants = q.acceptedVariants
          .map((item) => (typeof item === 'string' ? item.trim() : ''))
          .filter((item) => item.length > 0);
      }
      return {
        questionText,
        type: 'TEXT' as const,
        options: [{ text: answer, isCorrect: true }],
        acceptedVariants,
      };
    }

    if (q.type === 'MATCHING') {
      if (!Array.isArray(q.pairs) || q.pairs.length < 2) {
        throw new Error(
          t('editQuiz.importMatchingPairsMin', { index: idx + 1 }),
        );
      }
      const matchingPairs = q.pairs.map((pair) => {
        if (!pair || typeof pair !== 'object' || Array.isArray(pair)) {
          throw new Error(
            t('editQuiz.importMatchingPairInvalid', { index: idx + 1 }),
          );
        }
        const value = pair as { left?: string; right?: string };
        const leftItem = value.left?.trim() ?? '';
        const rightItem = value.right?.trim() ?? '';
        if (!leftItem || !rightItem) {
          throw new Error(
            t('editQuiz.importMatchingPairValuesRequired', { index: idx + 1 }),
          );
        }
        return { leftItem, rightItem };
      });
      return {
        questionText,
        type: 'MATCHING' as const,
        matchingPairs,
      };
    }

    if (q.type === 'ORDERING') {
      if (!Array.isArray(q.items) || q.items.length < 2) {
        throw new Error(
          t('editQuiz.importOrderingItemsMin', { index: idx + 1 }),
        );
      }
      const orderingItems = q.items.map((item, itemIndex) => {
        if (typeof item !== 'string' || !item.trim()) {
          throw new Error(
            t('editQuiz.importOrderingItemTextRequired', { index: idx + 1 }),
          );
        }
        return {
          text: item.trim(),
          correctOrder: itemIndex,
        };
      });
      return {
        questionText,
        type: 'ORDERING' as const,
        orderingItems,
      };
    }

    throw new Error(t('editQuiz.importUnknownType', { index: idx + 1 }));
  });
}

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

function reorderQuestions(questions: ModuleQuestion[]) {
  return questions.map((question, index) => ({
    ...question,
    orderIndex: index,
  }));
}

type SortableQuestionRowProps = {
  q: ModuleQuestion;
  index: number;
  total: number;
  canReorder: boolean;
  onEdit: (q: ModuleQuestion) => void;
  onDelete: (q: ModuleQuestion) => Promise<void>;
  onMoveUp: (questionId: string) => void;
  onMoveDown: (questionId: string) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const SortableQuestionRow = memo(function SortableQuestionRow({
  q,
  index,
  total,
  canReorder,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  t,
}: SortableQuestionRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: q.id,
    disabled: !canReorder,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const n = String(index + 1).padStart(2, '0');
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-stretch gap-3 rounded-2xl border border-(--border-default) bg-(--input-bg)/35 px-3 py-3 transition-colors duration-300 sm:px-4',
        isDragging && 'opacity-80 shadow-lg',
      )}
    >
      <span
        className="w-7 shrink-0 select-none pt-0.5 font-(family-name:--font-jetbrains-mono) text-xs text-(--text-secondary)"
        aria-label={t('aria.order', { number: n })}
      >
        {n}
      </span>
      <div className="min-w-0 flex-1 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-(--text-primary) sm:text-base">
            {q.questionText}
          </h3>
          <span className="inline-flex items-center rounded-full bg-(--module-badge-violet-bg) px-2.5 py-1 text-[0.625rem] font-bold tracking-[0.08em] text-(--module-badge-violet-fg) uppercase">
            {labelByType(q.type, t)}
          </span>
        </div>
        <p className="mt-1 text-sm text-(--text-secondary) sm:text-sm">
          {summarizeQuestion(q, t)}
        </p>
        {q.questionImageMime ? (
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-(--text-secondary)">
            <ImageIcon className="size-3.5" />
            {t('editQuiz.imageAttached')}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        {canReorder ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="cursor-grab text-(--text-secondary) hover:text-(--text-primary) active:cursor-grabbing"
            aria-label={t('editQuiz.reorder')}
            title={t('editQuiz.reorder')}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" strokeWidth={2} />
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-(--text-secondary) hover:text-(--text-primary)"
          onClick={() => onMoveUp(q.id)}
          aria-label={t('editQuiz.moveUp')}
          disabled={!canReorder || index === 0}
        >
          <MoveUp className="size-4" strokeWidth={2} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-(--text-secondary) hover:text-(--text-primary)"
          onClick={() => onMoveDown(q.id)}
          aria-label={t('editQuiz.moveDown')}
          disabled={!canReorder || index === total - 1}
        >
          <MoveDown className="size-4" strokeWidth={2} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-(--text-secondary) hover:text-(--text-primary)"
          onClick={() => onEdit(q)}
          aria-label={t('aria.editQuestion')}
        >
          <Pencil className="size-4" strokeWidth={2} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-(--text-secondary) hover:text-(--danger-color)"
          onClick={() => void onDelete(q)}
          aria-label={t('aria.deleteQuestion')}
        >
          <Trash2 className="size-4" strokeWidth={2} />
        </Button>
      </div>
    </li>
  );
});
SortableQuestionRow.displayName = 'SortableQuestionRow';

type QuestionDialogProps = {
  open: boolean;
  editingQuestion: ModuleQuestion | null;
  questionsCount: number;
  onOpenChange: (open: boolean) => void;
  onCreateQuestion: (
    payload: {
      questionText: string;
      type: QuestionType;
      allowMultipleAnswers?: boolean;
      options?: Array<{ text: string; isCorrect: boolean }>;
      matchingPairs?: Array<{ leftItem: string; rightItem: string }>;
      acceptedVariants?: string[];
    },
    imageFile: File | null,
  ) => Promise<void>;
  onUpdateQuestion: (
    questionId: string,
    payload: {
      questionText: string;
      type: QuestionType;
      allowMultipleAnswers?: boolean;
      options?: Array<{ text: string; isCorrect: boolean }>;
      matchingPairs?: Array<{ leftItem: string; rightItem: string }>;
      acceptedVariants?: string[];
    },
    imageUpdate: {
      file: File | null;
      removeExisting: boolean;
      hasExisting: boolean;
    },
  ) => Promise<void>;
  moduleId: ModuleId;
};

const QuizQuestionDialog = memo(function QuizQuestionDialog({
  open,
  editingQuestion,
  questionsCount,
  onOpenChange,
  onCreateQuestion,
  onUpdateQuestion,
  moduleId,
}: QuestionDialogProps) {
  const { t } = useI18n();
  const QUESTION_TYPES = useMemo(() => getQuestionTypes(t), [t]);
  const [type, setType] = useState<QuestionType>('CHOICE');
  const [questionText, setQuestionText] = useState('');
  const [textAnswer, setTextAnswer] = useState('');
  const [acceptedVariantsText, setAcceptedVariantsText] = useState('');
  const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(false);
  const [options, setOptions] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [pairs, setPairs] = useState(DEFAULT_MATCHING_PAIRS);
  const [orderingItems, setOrderingItems] = useState<
    Array<{ id: string; text: string }>
  >(createDefaultOrderingItems);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [errors, setErrors] = useState<{
    questionText?: string;
    textAnswer?: string;
    options?: string;
    matching?: string;
    orderingItems?: string;
    image?: string;
    form?: string;
  }>({});
  const hasExistingImage = Boolean(editingQuestion?.questionImageMime);
  const existingImageUrl = editingQuestion
    ? questionImageUrl(moduleId, editingQuestion.id, {
        version: editingQuestion.createdAt,
      })
    : null;

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSaving(false);
    setImageFile(null);
    setRemoveExistingImage(false);
    setImagePreviewUrl((previousUrl) => {
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }
      return null;
    });
    if (!editingQuestion) {
      setType('CHOICE');
      setQuestionText('');
      setTextAnswer('');
      setAcceptedVariantsText('');
      setAllowMultipleAnswers(false);
      setOptions([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ]);
      setPairs(DEFAULT_MATCHING_PAIRS);
      setOrderingItems(createDefaultOrderingItems());
      return;
    }
    setType(editingQuestion.type);
    setQuestionText(editingQuestion.questionText);
    setAllowMultipleAnswers(
      editingQuestion.type === 'CHOICE'
        ? editingQuestion.allowMultipleAnswers
        : false,
    );
    setTextAnswer(
      editingQuestion.questionOptions.find((o) => o.isCorrect)?.text ?? '',
    );
    setAcceptedVariantsText(
      formatAcceptedVariantsText(editingQuestion.acceptedVariants),
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
    if (editingQuestion.type === 'ORDERING') {
      const loaded = [
        ...(Array.isArray(editingQuestion.orderingItems)
          ? editingQuestion.orderingItems
          : []),
      ]
        .sort((a, b) => (a.correctOrder ?? 0) - (b.correctOrder ?? 0))
        .map((item) => ({ id: item.id, text: item.text }));
      setOrderingItems(
        loaded.length >= 2 ? loaded : createDefaultOrderingItems(),
      );
    } else {
      setOrderingItems(createDefaultOrderingItems());
    }
  }, [open, editingQuestion]);

  const addChoiceOption = useCallback(() => {
    setOptions((prev) => [...prev, { text: '', isCorrect: false }]);
  }, []);

  const addMatchingPair = useCallback(() => {
    setPairs((prev) => [...prev, { leftItem: '', rightItem: '' }]);
  }, []);

  const addOrderingItem = useCallback(() => {
    setOrderingItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: '' },
    ]);
  }, []);

  const updateOrderingItemText = useCallback((id: string, text: string) => {
    setOrderingItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text } : item)),
    );
  }, []);

  const removeOrderingItem = useCallback((id: string) => {
    setOrderingItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const onImageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextFile = event.target.files?.[0] ?? null;
      event.target.value = '';
      if (!nextFile) return;
      if (!QUESTION_IMAGE_ALLOWED_MIMES.includes(nextFile.type)) {
        setErrors((prev) => ({
          ...prev,
          image: t('editQuiz.imageTypeError'),
          form: undefined,
        }));
        return;
      }
      if (nextFile.size > QUESTION_IMAGE_MAX_BYTES) {
        setErrors((prev) => ({
          ...prev,
          image: t('editQuiz.imageSizeError'),
          form: undefined,
        }));
        return;
      }
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      setImageFile(nextFile);
      setImagePreviewUrl(URL.createObjectURL(nextFile));
      setRemoveExistingImage(false);
      setErrors((prev) => ({
        ...prev,
        image: undefined,
        form: undefined,
      }));
    },
    [imagePreviewUrl, t],
  );

  const clearSelectedImage = useCallback(() => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImageFile(null);
    setImagePreviewUrl(null);
    if (hasExistingImage) {
      setRemoveExistingImage(true);
    }
    setErrors((prev) => ({
      ...prev,
      image: undefined,
      form: undefined,
    }));
  }, [hasExistingImage, imagePreviewUrl]);

  const onSubmit = useCallback(async () => {
    const question = questionText.trim();
    const nextErrors: {
      questionText?: string;
      textAnswer?: string;
      options?: string;
      matching?: string;
      orderingItems?: string;
      image?: string;
      form?: string;
    } = {};

    if (!question)
      nextErrors.questionText = t('editQuiz.validationQuestionText');
    if (!editingQuestion && questionsCount >= MAX_QUESTIONS_PER_MODULE) {
      nextErrors.form = t('editQuiz.validationMaxQuestions', {
        count: MAX_QUESTIONS_PER_MODULE,
      });
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
        nextErrors.options = t('editQuiz.validationAtLeast2Options');
      } else if (cleanOptions.some((o) => !o.text)) {
        nextErrors.options = t('editQuiz.validationOptionEmpty');
      } else if (cleanOptions.filter((o) => o.isCorrect).length < 1) {
        nextErrors.options = t('editQuiz.validationAtLeastOneCorrect');
      } else if (
        !allowMultipleAnswers &&
        cleanOptions.filter((o) => o.isCorrect).length !== 1
      ) {
        nextErrors.options = t('editQuiz.validationSingleCorrect');
      }
    }

    if (type === 'MATCHING') {
      if (cleanPairs.length < 2) {
        nextErrors.matching = t('editQuiz.validationAtLeast2Pairs');
      } else if (
        cleanPairs.some(
          (p) => p.leftItem.length === 0 || p.rightItem.length === 0,
        )
      ) {
        nextErrors.matching = t('editQuiz.validationPairValues');
      }
    }

    const cleanTextAnswer = textAnswer.trim();
    if (type === 'TEXT' && !cleanTextAnswer) {
      nextErrors.textAnswer = t('editQuiz.validationTextAnswer');
    }

    const cleanOrderingItems = orderingItems
      .map((item) => ({ id: item.id, text: item.text.trim() }))
      .filter((item) => item.text.length > 0);

    if (type === 'ORDERING') {
      if (cleanOrderingItems.length < 2) {
        nextErrors.orderingItems = t('editQuiz.validationOrderingMinItems');
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload: {
      questionText: string;
      type: QuestionType;
      allowMultipleAnswers?: boolean;
      options?: Array<{ text: string; isCorrect: boolean }>;
      matchingPairs?: Array<{ leftItem: string; rightItem: string }>;
      orderingItems?: Array<{ text: string; correctOrder: number }>;
      acceptedVariants?: string[];
    } = { questionText: question, type };

    if (type === 'CHOICE') {
      payload.allowMultipleAnswers = allowMultipleAnswers;
      payload.options = cleanOptions;
    }
    if (type === 'TEXT') {
      payload.options = [{ text: cleanTextAnswer, isCorrect: true }];
      payload.acceptedVariants =
        parseAcceptedVariantsText(acceptedVariantsText);
    }
    if (type === 'MATCHING') {
      payload.matchingPairs = cleanPairs;
    }
    if (type === 'ORDERING') {
      payload.orderingItems = cleanOrderingItems.map((item, index) => ({
        text: item.text,
        correctOrder: index,
      }));
    }

    setSaving(true);
    setErrors({});
    try {
      if (editingQuestion) {
        await onUpdateQuestion(editingQuestion.id, payload, {
          file: imageFile,
          removeExisting: removeExistingImage,
          hasExisting: hasExistingImage,
        });
      } else {
        await onCreateQuestion(payload, imageFile);
      }
      onOpenChange(false);
    } catch (err) {
      setErrors({ form: apiErrorText(err, t) });
    } finally {
      setSaving(false);
    }
  }, [
    editingQuestion,
    imageFile,
    removeExistingImage,
    hasExistingImage,
    onCreateQuestion,
    onOpenChange,
    onUpdateQuestion,
    options,
    pairs,
    orderingItems,
    questionText,
    textAnswer,
    acceptedVariantsText,
    questionsCount,
    type,
    allowMultipleAnswers,
    t,
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
        className="flex max-h-[calc(100dvh-2rem)] w-[min(44rem,calc(100%-2rem))] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
        showCloseButton
      >
        <div className="min-h-0 overflow-y-auto p-6 sm:p-8">
          <DialogHeader className="mb-0 gap-0 space-y-0 text-left sm:text-left">
            <DialogTitle className="font-(family-name:--font-syne) text-lg font-bold tracking-[0.02em] text-(--text-primary) sm:text-xl">
              {editingQuestion
                ? t('editQuiz.dialogEdit')
                : t('editQuiz.dialogNew')}
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
              <p className={labelClass}>{t('editQuiz.dialogQuestionType')}</p>
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
                      if (t.value !== 'CHOICE') {
                        setAllowMultipleAnswers(false);
                      }
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
                {t('editQuiz.dialogQuestion')}
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
                placeholder={t('editQuiz.dialogQuestionPlaceholder')}
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

            <div>
              <p className={labelClass}>{t('editQuiz.imageLabel')}</p>
              {imagePreviewUrl || (hasExistingImage && !removeExistingImage) ? (
                <div className="mb-3 overflow-hidden rounded-xl border border-(--border-default) bg-(--input-bg)/30 p-2">
                  <img
                    src={imagePreviewUrl ?? existingImageUrl ?? ''}
                    alt={t('editQuiz.imagePreviewAlt')}
                    className="max-h-52 w-full rounded-lg object-contain"
                  />
                </div>
              ) : null}
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={onImageChange}
                    aria-label={t('editQuiz.imageChoose')}
                  />
                  <span className="inline-flex h-10 cursor-pointer items-center rounded-xl border border-(--border-default) px-4 text-sm text-(--text-primary) transition-colors hover:bg-(--input-bg)/60">
                    {t('editQuiz.imageChoose')}
                  </span>
                </label>
                {imageFile || (hasExistingImage && !removeExistingImage) ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-10 rounded-xl text-(--text-secondary)"
                    onClick={clearSelectedImage}
                  >
                    <X className="size-4" />
                    {t('editQuiz.imageRemove')}
                  </Button>
                ) : null}
              </div>
              <p className="mt-2 text-xs text-(--text-secondary)">
                {t('editQuiz.imageHint')}
              </p>
              {errors.image ? (
                <p
                  className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
                  role="alert"
                >
                  {errors.image}
                </p>
              ) : null}
            </div>

            {type === 'TEXT' ? (
              <div>
                <label className={labelClass} htmlFor="quiz-text-answer">
                  {t('editQuiz.dialogCorrectAnswer')}
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
                  placeholder={t('editQuiz.dialogCorrectPlaceholder')}
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
                <label
                  className={cn(labelClass, 'mt-4 block')}
                  htmlFor="quiz-accepted-variants"
                >
                  {t('editQuiz.dialogAcceptedVariants')}
                </label>
                <p className="mb-2 font-(family-name:--font-dm-sans) text-xs text-(--text-secondary)">
                  {t('editQuiz.dialogAcceptedVariantsHint')}
                </p>
                <Textarea
                  id="quiz-accepted-variants"
                  value={acceptedVariantsText}
                  onChange={(e) => {
                    setAcceptedVariantsText(e.target.value);
                    setErrors((prev) => ({ ...prev, form: undefined }));
                  }}
                  placeholder={t('editQuiz.dialogAcceptedVariantsPlaceholder')}
                  rows={3}
                  className="min-h-[5.5rem] rounded-xl"
                />
              </div>
            ) : null}

            {type === 'CHOICE' ? (
              <div>
                <div className="mb-3 flex items-center justify-between rounded-xl border border-(--border-default) bg-(--input-bg)/45 px-3 py-2">
                  <p className="text-xs text-(--text-secondary)">
                    {t('editQuiz.dialogAnswerMode')}
                  </p>
                  <label className="flex items-center gap-2 text-xs text-(--text-primary)">
                    <input
                      type="checkbox"
                      checked={allowMultipleAnswers}
                      onChange={(e) => {
                        setAllowMultipleAnswers(e.target.checked);
                        setErrors((prev) => ({
                          ...prev,
                          options: undefined,
                          form: undefined,
                        }));
                      }}
                    />
                    {t('editQuiz.dialogAllowMultiple')}
                  </label>
                </div>
                <p className={labelClass}>{t('editQuiz.dialogOptions')}</p>
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
                        placeholder={t('editQuiz.dialogOption', {
                          index: idx + 1,
                        })}
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
                        {t('editQuiz.dialogOptionCorrect')}
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
                    {t('editQuiz.dialogAddOption')}
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
                <p className={labelClass}>
                  {t('editQuiz.dialogMatchingPairs')}
                </p>
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
                        placeholder={t('editQuiz.dialogLeftItem')}
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
                        placeholder={t('editQuiz.dialogRightItem')}
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
                    {t('editQuiz.dialogAddPair')}
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

            {type === 'ORDERING' ? (
              <div>
                <p className={labelClass}>
                  {t('editQuiz.dialogOrderingItems')}
                </p>
                <SortableOrderingList
                  items={orderingItems}
                  mode="edit"
                  onReorder={setOrderingItems}
                  onItemTextChange={(id, text) => {
                    updateOrderingItemText(id, text);
                    setErrors((prev) => ({
                      ...prev,
                      orderingItems: undefined,
                      form: undefined,
                    }));
                  }}
                  onRemoveItem={removeOrderingItem}
                  textPlaceholder={t('editQuiz.orderingItemPlaceholder')}
                />
                <div className="mt-3 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-xl"
                    onClick={addOrderingItem}
                  >
                    {t('editQuiz.dialogAddOrderingItem')}
                  </Button>
                </div>
                <p className="mt-2 text-xs text-(--text-secondary)">
                  {t('editQuiz.orderingHint')}
                </p>
                {errors.orderingItems ? (
                  <p
                    className="mt-1.5 font-(family-name:--font-dm-sans) text-xs text-destructive"
                    role="alert"
                  >
                    {errors.orderingItems}
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
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="cta"
            onClick={() => void onSubmit()}
            className="h-12 rounded-2xl px-6"
            disabled={saving}
          >
            {saving
              ? t('common.saving')
              : editingQuestion
                ? t('editQuiz.dialogSave')
                : t('editQuiz.dialogAdd')}
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

export function QuizEditor() {
  const { t } = useI18n();
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
      toast.success(t('editQuiz.questionUpdated'));
    },
    [moduleId, t],
  );

  const onDeleteQuestion = useCallback(
    async (q: ModuleQuestion) => {
      try {
        await deleteQuestion(moduleId, q.id);
        setQuestions((prev) => prev.filter((x) => x.id !== q.id));
        toast.success(t('editQuiz.questionRemoved'));
      } catch {
        toast.error(t('editQuiz.questionDeleteFailed'));
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
    <article
      className={cn(
        'mx-auto flex min-h-0 w-full max-w-[1200px] flex-1 flex-col gap-5 pb-4 sm:gap-6',
        'text-(--text-primary)',
      )}
    >
      <h1 className="sr-only">
        {t('editQuiz.dialogEdit')}: {titleTrimmed}
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
                disabled={questions.length === 0}
                className="h-12 w-full min-w-56 gap-2 rounded-[12px] border-0 bg-(--primary-accent) font-(family-name:--font-syne) text-base font-bold text-white shadow-[0_4px_15px_rgba(108,99,255,0.2)] transition-all duration-300 ease-in-out hover:bg-(--primary-accent)/90 sm:w-auto"
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
        className="min-h-0 flex-1"
        aria-labelledby="questions-section-heading"
      >
        <div className="mb-3 flex flex-col gap-3 lg:mb-4 lg:flex-row lg:items-center lg:justify-between">
          <h2
            id="questions-section-heading"
            className="min-w-0 font-(family-name:--font-syne) text-xl font-bold tracking-[-0.04em] text-(--text-primary) sm:text-2xl"
          >
            {t('editQuiz.questionsTitle', { count: questions.length })}
          </h2>
          <div className="relative w-full min-w-0 sm:max-w-full lg:w-80">
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
      </section>

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
  );
}
