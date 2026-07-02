-- Корректирующая миграция:
-- 1) Удаляет все учебные модули владельцев с ролью ADMIN.
-- 2) Создает/нормализует владельца demo-данных percheck298@gmail.com (роль USER).
-- 3) Пересоздает русские demo-модули и контент.

DO $$
DECLARE
  v_demo_user_id TEXT;
BEGIN
  INSERT INTO "users" (
    "id",
    "email",
    "passwordHash",
    "username",
    "role",
    "isBlocked",
    "emailVerified",
    "createdAt",
    "updatedAt"
  )
  VALUES (
    'seed_demo_user',
    'percheck298@gmail.com',
    '$2b$10$u1JSZ71R.cvOzV0KnZcoDOPKdHBwIyz4Z.U/45Z2fAR24Ot68I9xq',
    'Pavel Melnik',
    'USER',
    false,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT ("email")
  DO UPDATE SET
    "role" = 'USER',
    "isBlocked" = false,
    "emailVerified" = true,
    "updatedAt" = NOW()
  RETURNING "id" INTO v_demo_user_id;

  DELETE FROM "modules" m
  USING "users" u
  WHERE m."userId" = u."id" AND u."role" = 'ADMIN';

  DELETE FROM "modules"
  WHERE "id" IN ('seed_ru_demo_flashcards', 'seed_ru_demo_quiz');

  INSERT INTO "modules" ("id", "userId", "title", "description", "type", "createdAt", "updatedAt")
  VALUES (
    'seed_ru_demo_flashcards',
    v_demo_user_id,
    'Контрольный набор: флешкарточки по базовым дисциплинам',
    'Демо-набор для ручной проверки режима карточек и статистики прохождений.',
    'FLASHCARD'::"ModuleType",
    NOW(),
    NOW()
  );

  INSERT INTO "cards" ("id", "moduleId", "question", "answer", "orderIndex", "createdAt")
  VALUES
    ('seed_ru_fc_01', 'seed_ru_demo_flashcards', 'Что вычисляет функция хэширования?', 'Фиксированный отпечаток данных (хэш) по входным данным.', 0, NOW()),
    ('seed_ru_fc_02', 'seed_ru_demo_flashcards', 'Как называется процесс преобразования исходного кода в машинные инструкции?', 'Компиляция.', 1, NOW()),
    ('seed_ru_fc_03', 'seed_ru_demo_flashcards', 'Как вычисляется площадь круга через радиус r?', 'S = πr^2.', 2, NOW()),
    ('seed_ru_fc_04', 'seed_ru_demo_flashcards', 'Какой протокол обычно используется для защищенного веб-трафика?', 'HTTPS (HTTP поверх TLS).', 3, NOW()),
    ('seed_ru_fc_05', 'seed_ru_demo_flashcards', 'Как называется сущность в ООП, объединяющая данные и методы?', 'Класс (его экземпляр называется объектом).', 4, NOW()),
    ('seed_ru_fc_06', 'seed_ru_demo_flashcards', 'Какой органоид клетки отвечает за синтез белка?', 'Рибосома.', 5, NOW()),
    ('seed_ru_fc_07', 'seed_ru_demo_flashcards', 'Кто написал роман «Преступление и наказание»?', 'Федор Михайлович Достоевский.', 6, NOW()),
    ('seed_ru_fc_08', 'seed_ru_demo_flashcards', 'Какая единица измерения силы тока используется в СИ?', 'Ампер.', 7, NOW());

  INSERT INTO "modules" ("id", "userId", "title", "description", "type", "createdAt", "updatedAt")
  VALUES (
    'seed_ru_demo_quiz',
    v_demo_user_id,
    'Контрольный квиз: логика, ИТ и общие знания',
    'Демо-квиз для проверки всех типов вопросов: CHOICE, TEXT и MATCHING.',
    'QUIZ'::"ModuleType",
    NOW(),
    NOW()
  );

  INSERT INTO "questions" ("id", "moduleId", "questionText", "type", "allowMultipleAnswers", "questionImageMime", "orderIndex", "createdAt")
  VALUES
    ('seed_ru_quiz_q01', 'seed_ru_demo_quiz', 'Какой из перечисленных алгоритмов относится к сортировкам сравнения?', 'CHOICE'::"QuestionType", false, NULL, 0, NOW()),
    ('seed_ru_quiz_q02', 'seed_ru_demo_quiz', 'Выберите корректные HTTP-методы для REST API.', 'CHOICE'::"QuestionType", true, NULL, 1, NOW()),
    ('seed_ru_quiz_q03', 'seed_ru_demo_quiz', 'Назовите столицу Франции.', 'TEXT'::"QuestionType", false, NULL, 2, NOW()),
    ('seed_ru_quiz_q04', 'seed_ru_demo_quiz', 'Сопоставьте термин ООП и его определение.', 'MATCHING'::"QuestionType", false, NULL, 3, NOW()),
    ('seed_ru_quiz_q05', 'seed_ru_demo_quiz', 'Какой SQL-оператор используется для выборки данных?', 'CHOICE'::"QuestionType", false, NULL, 4, NOW()),
    ('seed_ru_quiz_q06', 'seed_ru_demo_quiz', 'Как называется процесс поиска и исправления ошибок в программе?', 'TEXT'::"QuestionType", false, NULL, 5, NOW()),
    ('seed_ru_quiz_q07', 'seed_ru_demo_quiz', 'Сопоставьте язык и его типичную область применения.', 'MATCHING'::"QuestionType", false, NULL, 6, NOW());

  INSERT INTO "question_options" ("id", "questionId", "text", "isCorrect")
  VALUES
    ('seed_ru_quiz_q01_o1', 'seed_ru_quiz_q01', 'Пузырьковая сортировка.', true),
    ('seed_ru_quiz_q01_o2', 'seed_ru_quiz_q01', 'Сортировка подсчетом.', false),
    ('seed_ru_quiz_q01_o3', 'seed_ru_quiz_q01', 'Поразрядная сортировка.', false),
    ('seed_ru_quiz_q01_o4', 'seed_ru_quiz_q01', 'Блум-фильтр.', false),
    ('seed_ru_quiz_q02_o1', 'seed_ru_quiz_q02', 'GET', true),
    ('seed_ru_quiz_q02_o2', 'seed_ru_quiz_q02', 'POST', true),
    ('seed_ru_quiz_q02_o3', 'seed_ru_quiz_q02', 'PATCH', true),
    ('seed_ru_quiz_q02_o4', 'seed_ru_quiz_q02', 'COMPILE', false),
    ('seed_ru_quiz_q03_o1', 'seed_ru_quiz_q03', 'Париж', true),
    ('seed_ru_quiz_q05_o1', 'seed_ru_quiz_q05', 'SELECT', true),
    ('seed_ru_quiz_q05_o2', 'seed_ru_quiz_q05', 'INSERT', false),
    ('seed_ru_quiz_q05_o3', 'seed_ru_quiz_q05', 'DELETE', false),
    ('seed_ru_quiz_q05_o4', 'seed_ru_quiz_q05', 'ALTER', false),
    ('seed_ru_quiz_q06_o1', 'seed_ru_quiz_q06', 'Отладка', true);

  INSERT INTO "matching_pairs" ("id", "questionId", "leftItem", "rightItem")
  VALUES
    ('seed_ru_quiz_q04_p1', 'seed_ru_quiz_q04', 'Инкапсуляция', 'Сокрытие внутренней реализации объекта'),
    ('seed_ru_quiz_q04_p2', 'seed_ru_quiz_q04', 'Полиморфизм', 'Единый интерфейс при разных реализациях'),
    ('seed_ru_quiz_q04_p3', 'seed_ru_quiz_q04', 'Наследование', 'Получение свойств и методов базового класса'),
    ('seed_ru_quiz_q07_p1', 'seed_ru_quiz_q07', 'SQL', 'Запросы к базам данных'),
    ('seed_ru_quiz_q07_p2', 'seed_ru_quiz_q07', 'JavaScript', 'Клиентская логика веб-приложений'),
    ('seed_ru_quiz_q07_p3', 'seed_ru_quiz_q07', 'Bash', 'Автоматизация задач в терминале');
END $$;
