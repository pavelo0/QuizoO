# Сессия 2026-07-02 — Добавление типа вопроса ORDERING

**Ветка:** (создать новую ветку перед коммитом)  
**Связанный план:** [`plans/ordering-question-type-and-sentry.md`](../../plans/ordering-question-type-and-sentry.md)  
**Связанный бэклог:** [`TODO.md`](../TODO.md) → фаза C (новые типы вопросов)

---

## Цель

Добавить новый тип вопроса **ORDERING** в Quiz модуль, где пользователь расставляет элементы в правильном порядке через drag-and-drop.

---

## Что сделано

### 1. Backend - Prisma Schema

**Файл:** [`backend/prisma/schema.prisma`](../../backend/prisma/schema.prisma)

- ✅ Добавлен `ORDERING` в enum `QuestionType`
- ✅ Создана модель `OrderingItem` с полями:
  - `id` - уникальный идентификатор
  - `questionId` - связь с вопросом
  - `text` - текст элемента
  - `correctOrder` - правильная позиция (0-based)
- ✅ Добавлена связь `orderingItems` в модель `Question`

### 2. Backend - Миграция БД

**Файл:** [`backend/prisma/migrations/20260702110000_add_ordering_question_type/migration.sql`](../../backend/prisma/migrations/20260702110000_add_ordering_question_type/migration.sql)

- ✅ Создана миграция для добавления `ORDERING` в enum
- ✅ Создана таблица `ordering_items` с индексами и foreign key
- ⚠️ **Миграция НЕ применена** (БД не запущена) - применить при запуске: `cd backend && npx prisma migrate deploy`

### 3. Backend - Ordering Grader

**Файл:** [`backend/src/modules/quiz/ordering-grader.ts`](../../backend/src/modules/quiz/ordering-grader.ts)

- ✅ Функция `gradeOrderingAnswer()` для проверки правильности ответа
- ✅ Поддержка strict matching (все элементы в правильном порядке)
- ✅ Опциональная поддержка partial credit (частичный балл)
- ✅ Валидация длины массивов

**Файл:** [`backend/src/modules/quiz/ordering-grader.spec.ts`](../../backend/src/modules/quiz/ordering-grader.spec.ts)

- ✅ 20+ unit тестов для grader
- ✅ Покрытие: strict matching, validation, partial credit, edge cases

### 4. Backend - ModulesService

**Файл:** [`backend/src/modules/modules.service.ts`](../../backend/src/modules/modules.service.ts)

**Изменения:**

1. ✅ Импорт `gradeOrderingAnswer` из ordering-grader
2. ✅ Обновлена функция `isQuestionType()` - добавлен `ORDERING`
3. ✅ **createQuestion():**
   - Добавлен тип `orderingItems` в параметр body
   - Добавлена валидация ORDERING вопросов (минимум 2 элемента, уникальность correctOrder)
   - Создание вопроса с orderingItems
   - Обновлены все includes для добавления `orderingItems`
4. ✅ **createQuizSession():**
   - Добавлен тип `orderingAnswer` в параметр body
   - Добавлен include `orderingItems` при загрузке вопросов
   - Добавлена обработка ORDERING ответов с валидацией и grading

**Что осталось сделать в ModulesService:**

- [ ] **updateQuestion()** - добавить поддержку обновления ORDERING вопросов
- [ ] **deleteQuestion()** - проверить cascade delete для orderingItems (должно работать автоматически)
- [ ] Обновить все остальные includes для `orderingItems` (getModuleById, getQuizQuestionsPage, etc.)

---

## Что НЕ сделано (следующие шаги)

### Backend

- [ ] Завершить updateQuestion() для ORDERING
- [ ] Обновить все Prisma includes в других методах
- [ ] Запустить тесты: `cd backend && npm test -- ordering-grader`
- [ ] Обновить существующие тесты modules.service.spec.ts

### Frontend

- [ ] Обновить типы в [`frontend/src/types/module.ts`](../../frontend/src/types/module.ts):
  - Добавить `'ORDERING'` в `QuestionType`
  - Добавить `ModuleOrderingItem` interface
  - Добавить `QuizOrderingUserAnswer` type
- [ ] Обновить [`EditQuizModulePage.tsx`](../../frontend/src/pages/EditQuizModulePage.tsx):
  - UI для создания ORDERING вопросов
  - Drag-and-drop для упорядочивания элементов
  - Валидация
  - JSON export/import
- [ ] Обновить [`QuizStudyPage.tsx`](../../frontend/src/pages/QuizStudyPage.tsx):
  - UI для прохождения ORDERING вопросов
  - Drag-and-drop для ответа
  - Отображение результатов
- [ ] Создать компонент `SortableOrderingItem.tsx`
- [ ] Добавить i18n сообщения в [`messages.ts`](../../frontend/src/i18n/messages.ts)

### Тестирование

- [ ] Unit тесты backend (ordering-grader) - запустить
- [ ] Integration тесты (modules.service)
- [ ] E2E тесты (Playwright)

### Документация

- [ ] Обновить [`AIContext.md`](../AIContext.md)
- [ ] Обновить [`TODO.md`](../TODO.md)
- [ ] Обновить [`api.md`](../api.md) с примерами ORDERING

---

## Технические детали

### Структура данных ORDERING

```typescript
// Вопрос
{
  id: "q1",
  type: "ORDERING",
  questionText: "Расположите этапы алгоритма в правильном порядке",
  orderingItems: [
    { id: "item1", text: "Инициализация", correctOrder: 0 },
    { id: "item2", text: "Обработка", correctOrder: 1 },
    { id: "item3", text: "Завершение", correctOrder: 2 }
  ]
}

// Ответ пользователя
{
  questionId: "q1",
  orderingAnswer: ["item2", "item1", "item3"] // порядок пользователя
}

// Результат grading
{
  isCorrect: false, // не все в правильном порядке
  correctOrder: ["item1", "item2", "item3"],
  userOrder: ["item2", "item1", "item3"],
  strictMatch: false
}
```

### API Endpoints

**POST /api/modules/:id/questions** - создать ORDERING вопрос

```json
{
  "questionText": "Расположите этапы...",
  "type": "ORDERING",
  "orderingItems": [
    { "text": "Шаг 1", "correctOrder": 0 },
    { "text": "Шаг 2", "correctOrder": 1 }
  ]
}
```

**POST /api/modules/:id/quiz-sessions** - отправить ответы

```json
{
  "answers": [
    {
      "questionId": "q1",
      "orderingAnswer": ["item2", "item1", "item3"]
    }
  ]
}
```

---

## Команды для продолжения

```bash
# 1. Применить миграцию (когда БД запущена)
cd backend && npx prisma migrate deploy

# 2. Запустить тесты
cd backend && npm test -- ordering-grader

# 3. Запустить backend для проверки
cd backend && npm run start:dev

# 4. Создать ветку для коммита
git checkout -b feature/ordering-question-type
git add .
git commit -m "feat: add ORDERING question type (backend partial)"
```

---

## Следующая сессия

**Приоритет 1:** Завершить backend

1. Завершить updateQuestion() для ORDERING
2. Обновить все includes
3. Запустить и проверить тесты

**Приоритет 2:** Frontend типы и базовый UI

1. Обновить TypeScript типы
2. Базовый UI в EditQuizModulePage (без drag-and-drop сначала)
3. Базовый UI в QuizStudyPage

**Приоритет 3:** Drag-and-drop и полировка

1. Интеграция @dnd-kit
2. Компонент SortableOrderingItem
3. i18n сообщения
4. Тестирование end-to-end

---

## Примечания

- ESLint ошибки в modules.service.ts - существовали и раньше, связаны с типизацией Prisma
- Prisma Client успешно сгенерирован с новым типом ORDERING
- Grader поддерживает partial credit, но пока не используется (можно добавить позже)
- Минимальное количество элементов: 2 (можно изменить в валидации)

---

**Конец сессии**
