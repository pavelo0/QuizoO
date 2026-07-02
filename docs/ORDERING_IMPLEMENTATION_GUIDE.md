# Руководство по завершению реализации ORDERING типа вопроса

## ✅ Статус: Backend 100% готов, Frontend требует доработки

---

## 🎯 Что нужно сделать

### 1. EditQuizModulePage.tsx - Добавить state и UI

#### Шаг 1.1: Добавить state (после строки 695)

```typescript
const [pairs, setPairs] = useState(DEFAULT_MATCHING_PAIRS);
// ⬇️ ДОБАВИТЬ ЭТО:
const [orderingItems, setOrderingItems] = useState<
  Array<{ id: string; text: string }>
>([
  { id: crypto.randomUUID(), text: '' },
  { id: crypto.randomUUID(), text: '' },
]);
```

#### Шаг 1.2: Обновить errors type (строка 700)

```typescript
const [errors, setErrors] = useState<{
  questionText?: string;
  textAnswer?: string;
  options?: string;
  matching?: string;
  orderingItems?: string; // ⬅️ ДОБАВИТЬ
  image?: string;
  form?: string;
}>({});
```

#### Шаг 1.3: Добавить функции управления (после функций для pairs, ~строка 720-750)

```typescript
// Функции для ORDERING
const addOrderingItem = useCallback(() => {
  setOrderingItems((prev) => [...prev, { id: crypto.randomUUID(), text: '' }]);
}, []);

const updateOrderingItemText = useCallback((id: string, text: string) => {
  setOrderingItems((prev) =>
    prev.map((item) => (item.id === id ? { ...item, text } : item)),
  );
}, []);

const removeOrderingItem = useCallback((id: string) => {
  setOrderingItems((prev) => prev.filter((item) => item.id !== id));
}, []);

const moveOrderingItem = useCallback((fromIndex: number, toIndex: number) => {
  setOrderingItems((prev) => {
    const result = [...prev];
    const [removed] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, removed);
    return result;
  });
}, []);
```

#### Шаг 1.4: Обновить useEffect для загрузки editingQuestion (найти существующий useEffect, ~строка 740-800)

Добавить в блок загрузки:

```typescript
if (editingQuestion.type === 'ORDERING') {
  setOrderingItems(
    editingQuestion.orderingItems
      .sort((a, b) => a.correctOrder - b.correctOrder)
      .map((item) => ({ id: item.id, text: item.text })),
  );
}
```

#### Шаг 1.5: Добавить валидацию (в функции handleSave, ~строка 860-900)

```typescript
if (type === 'ORDERING') {
  const cleanItems = orderingItems
    .map((item) => ({ ...item, text: item.text.trim() }))
    .filter((item) => item.text);

  if (cleanItems.length < 2) {
    nextErrors.orderingItems = t('editQuiz.validationOrderingMinItems');
    setErrors(nextErrors);
    return;
  }

  payload.orderingItems = cleanItems.map((item, index) => ({
    text: item.text,
    correctOrder: index,
  }));
}
```

#### Шаг 1.6: Добавить UI форму (в JSX, ~строка 1100-1300, после MATCHING блока)

```tsx
{
  type === 'ORDERING' ? (
    <div>
      <label className="block text-sm font-medium mb-2">
        {t('editQuiz.orderingItems')}
      </label>

      <div className="space-y-2">
        {orderingItems.map((item, index) => (
          <div key={item.id} className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground w-8">
              {index + 1}.
            </span>
            <Input
              value={item.text}
              onChange={(e) => updateOrderingItemText(item.id, e.target.value)}
              placeholder={t('editQuiz.orderingItemPlaceholder')}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => moveOrderingItem(index, index - 1)}
              disabled={index === 0}
            >
              ↑
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => moveOrderingItem(index, index + 1)}
              disabled={index === orderingItems.length - 1}
            >
              ↓
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeOrderingItem(item.id)}
              disabled={orderingItems.length <= 2}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addOrderingItem}
        className="mt-2"
      >
        <Plus className="w-4 h-4 mr-1" />
        {t('editQuiz.addOrderingItem')}
      </Button>

      {errors.orderingItems && (
        <p className="text-sm text-destructive mt-1">{errors.orderingItems}</p>
      )}
    </div>
  ) : null;
}
```

#### Шаг 1.7: Добавить i18n ключи в messages.ts

```typescript
// English
'editQuiz.orderingItems': 'Ordering items',
'editQuiz.orderingItemPlaceholder': 'Enter item text',
'editQuiz.addOrderingItem': 'Add item',
'editQuiz.validationOrderingMinItems': 'At least 2 items required',

// Russian
'editQuiz.orderingItems': 'Элементы для упорядочивания и их правильный порядок ',
'editQuiz.orderingItemPlaceholder': 'Введите текст элемента',
'editQuiz.addOrderingItem': 'Добавить элемент',
'editQuiz.validationOrderingMinItems': 'Требуется минимум 2 элемента',
```

#### Шаг 1.8: Обновить toExportQuestion (строка ~187-220)

```typescript
if (q.type === 'ORDERING') {
  return {
    type: 'ORDERING',
    question: q.questionText,
    items: q.orderingItems
      .sort((a, b) => a.correctOrder - b.correctOrder)
      .map((item) => item.text),
  };
}
```

#### Шаг 1.9: Обновить formatQuestionPreview (строка ~466-490)

```typescript
if (q.type === 'ORDERING') {
  const items = q.orderingItems
    .sort((a, b) => a.correctOrder - b.correctOrder)
    .map((item) => item.text)
    .slice(0, 3);
  return items.join(' → ') + (q.orderingItems.length > 3 ? '...' : '');
}
```

---

### 2. QuizStudyPage.tsx - Добавить поддержку ORDERING

#### Шаг 2.1: Обновить DraftAnswer type (строка ~50)

```typescript
type DraftAnswer = {
  choiceOptionIds?: string[];
  textAnswer?: string;
  matchingAnswer?: Record<string, string>;
  orderingAnswer?: string[]; // ⬅️ ДОБАВИТЬ
};
```

#### Шаг 2.2: Добавить state для текущего порядка (после других state, ~строка 200-250)

```typescript
const [currentOrderingItems, setCurrentOrderingItems] = useState<
  Array<{
    id: string;
    text: string;
  }>
>([]);
```

#### Шаг 2.3: Обновить isQuestionAnswered (строка ~83-100)

```typescript
if (question.type === 'ORDERING') {
  const items = Array.isArray(question.orderingItems)
    ? question.orderingItems
    : [];
  const userOrder = draft.orderingAnswer ?? [];
  return userOrder.length === items.length;
}
```

#### Шаг 2.4: Инициализация при загрузке вопроса (в useEffect где загружаются вопросы)

```typescript
if (currentQuestion.type === 'ORDERING') {
  // Перемешать элементы для пользователя
  const items = [...currentQuestion.orderingItems];
  const shuffled = items.sort(() => Math.random() - 0.5);
  setCurrentOrderingItems(
    shuffled.map((item) => ({
      id: item.id,
      text: item.text,
    })),
  );

  // Инициализировать draft
  setDraftAnswers((prev) => ({
    ...prev,
    [currentQuestion.id]: {
      orderingAnswer: shuffled.map((item) => item.id),
    },
  }));
}
```

#### Шаг 2.5: Функция для изменения порядка

```typescript
const moveOrderingItemInStudy = useCallback(
  (fromIndex: number, toIndex: number) => {
    if (!currentQuestion || currentQuestion.type !== 'ORDERING') return;

    setCurrentOrderingItems((prev) => {
      const result = [...prev];
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);

      // Обновить draft
      const newOrder = result.map((item) => item.id);
      setDraftAnswers((prevDrafts) => ({
        ...prevDrafts,
        [currentQuestion.id]: {
          orderingAnswer: newOrder,
        },
      }));

      return result;
    });
  },
  [currentQuestion],
);
```

#### Шаг 2.6: Добавить UI (в JSX, ~строка 1065-1132, после MATCHING блока)

```tsx
{
  currentQuestion.type === 'ORDERING' ? (
    <div className="mt-6 space-y-3">
      <p className="text-sm text-muted-foreground">
        {t('quizStudy.orderingInstruction')}
      </p>

      <div className="space-y-2">
        {currentOrderingItems.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-lg border bg-card"
          >
            <span className="font-medium text-muted-foreground">
              {index + 1}.
            </span>
            <span className="flex-1">{item.text}</span>
            {!showResults && (
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveOrderingItemInStudy(index, index - 1)}
                  disabled={index === 0}
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveOrderingItemInStudy(index, index + 1)}
                  disabled={index === currentOrderingItems.length - 1}
                >
                  ↓
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  ) : null;
}
```

#### Шаг 2.7: Отображение результатов (функция formatUserAnswer, ~строка 155-180)

```typescript
if (q.type === 'ORDERING') {
  if (!answer.userAnswer || !('orderingAnswer' in answer.userAnswer)) {
    return t('quizStudy.noAnswer');
  }

  const userOrderIds = answer.userAnswer.orderingAnswer;
  const itemsById = new Map(q.orderingItems.map((item) => [item.id, item]));
  const correctOrder = q.orderingItems
    .sort((a, b) => a.correctOrder - b.correctOrder)
    .map((item) => item.id);

  return userOrderIds
    .map((id, index) => {
      const item = itemsById.get(id);
      const isCorrect = correctOrder[index] === id;
      return `${index + 1}. ${item?.text ?? '?'} ${isCorrect ? '✓' : '✗'}`;
    })
    .join('\n');
}
```

#### Шаг 2.8: Добавить i18n ключ

```typescript
// English
'quizStudy.orderingInstruction': 'Arrange the items in the correct order using the arrow buttons.',

// Russian
'quizStudy.orderingInstruction': 'Расположите элементы в правильном порядке, используя кнопки со стрелками.',
```

---

## 🚀 Тестирование

### 1. Применить миграцию БД

```bash
cd backend
npx prisma migrate deploy
```

### 2. Запустить тесты

```bash
cd backend
npm test -- ordering-grader
```

### 3. Запустить приложение

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Тестовый сценарий

1. Создать новый Quiz модуль
2. Добавить вопрос типа ORDERING
3. Добавить 3-4 элемента
4. Сохранить вопрос
5. Пройти quiz
6. Проверить результаты

---

## 📝 Опциональные улучшения (можно добавить позже)

### Drag-and-drop с @dnd-kit

Заменить кнопки ↑↓ на drag-and-drop:

```tsx
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Компонент SortableItem
function SortableOrderingItem({
  item,
  index,
}: {
  item: { id: string; text: string };
  index: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-3 p-3 rounded-lg border bg-card cursor-move"
    >
      <GripVertical className="w-5 h-5 text-muted-foreground" />
      <span className="font-medium text-muted-foreground">{index + 1}.</span>
      <span className="flex-1">{item.text}</span>
    </div>
  );
}

// В родительском компоненте
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  }),
);

function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;
  if (over && active.id !== over.id) {
    setOrderingItems((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  }
}

// JSX
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext
    items={orderingItems.map((item) => item.id)}
    strategy={verticalListSortingStrategy}
  >
    {orderingItems.map((item, index) => (
      <SortableOrderingItem key={item.id} item={item} index={index} />
    ))}
  </SortableContext>
</DndContext>;
```

---

## ✅ Чеклист завершения

- [ ] EditQuizModulePage: State добавлен
- [ ] EditQuizModulePage: Функции управления добавлены
- [ ] EditQuizModulePage: UI форма добавлена
- [ ] EditQuizModulePage: Валидация работает
- [ ] EditQuizModulePage: Export/Import обновлен
- [ ] QuizStudyPage: State добавлен
- [ ] QuizStudyPage: UI добавлен
- [ ] QuizStudyPage: Результаты отображаются
- [ ] i18n: Все ключи добавлены
- [ ] Миграция БД применена
- [ ] Тесты пройдены
- [ ] E2E тестирование выполнено

---

**Backend готов на 100%! Frontend требует ~2-4 часа работы по этому руководству.**
