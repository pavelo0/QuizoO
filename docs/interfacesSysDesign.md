# Техническое описание интерфейсов QuizoO (Layout Guide)

Этот документ содержит детальное описание структуры и элементов каждого экрана платформы QuizoO для реализации верстки.

---

## Общие параметры (Global Styles)

- **Background:** `#0F1117` (основной темный фон).
- **Cards:** `#1A1D2E` (фон карточек и панелей).
- **Accent:** `#6C63FF` (основной фиолетовый).
- **Success:** `#00D4AA` (тиловый/мятный).
- **Fonts:** `Syne` (заголовки), `DM Sans` (основной текст), `JetBrains Mono` (числа/статистика).

---

## 1. Landing Page (Главная страница)

**Структура (сверху вниз):**

1.  **Navbar (Fixed):**
    - Слева: Текстовое лого "QuizoO" (Syne Bold, White).
    - Центр: Ссылки "Features", "Pricing", "How it works" (DM Sans, White).
    - Справа: Кнопка "Log in" (Ghost/Outline) и "Get started" (Solid Purple). Переключатель темы (Moon icon).
2.  **Hero Section:**
    - Центр: Заголовок "Learn smarter. Remember longer." (Syne, 72px+, White).
    - Подзаголовок: Текст в 2 строки (#8B8FA8).
    - Кнопки: "Start for free" (Purple with arrow) и "See how it works" (Outline).
    - Социальное доказательство: "1,200+ modules created" (JetBrains Mono).
    - Фон: 3D иллюстрация учебных карточек и мягкое фиолетовое свечение.
3.  **Features Grid:**
    - Заголовок секции по центру.
    - 3 карточки в ряд: Иконка в круге, заголовок (Syne), описание (#8B8FA8). Эффект при ховере — поднятие и свечение границ.
4.  **How It Works:**
    - Горизонтальная линия с 3 шагами. Крупные цифры "01, 02, 03" (JetBrains Mono, Faded Purple).
5.  **Footer:**
    - Логотип, ссылки по колонкам ("Platform", "Community", "Contact").

---

## 2. Login Page (Страница входа)

**Layout:** Split-screen (55% Branding / 45% Form).

- **Левая часть:** Темный градиент. Центрированное лого "QuizoO" и слоган. 3 парящие карточки со статистикой ("15-day streak" и т.д.) в шахматном порядке.
- **Правая часть:**
  - Заголовок "Welcome back" (Syne Bold).
  - Поля ввода: Email и Password (с иконкой глаза).
  - Кнопка "Sign In" (Full width, Purple glow).
  - Разделитель "OR" с линиями. Кнопки соцсетей (Google, Apple).

---

## 3. Registration Page (Регистрация)

**Layout:** Центральная карточка (max-width: 480px) на темном фоне с тиловым свечением снизу.

- **Внутри карточки:**
  - Логотип по центру сверху. Заголовок "Create your account".
  - Поля: Username, Email, Password, Confirm Password (все с иконками слева).
  - **Password Strength:** 4 цветовых индикатора (red to green) + текст "Medium/Strong" (JetBrains Mono).
  - Кнопка "Create account" и ссылка на логин внизу.

---

## 4. Dashboard (Панель управления)

**Layout:** Navbar + Main Content + Right Sidebar.

- **Верхняя панель:** Приветствие "Good evening, Alex 👋" и 3 мини-карточки статистики (Total Modules, Cards, Avg Score).
- **Секция модулей:**
  - Заголовок "My Modules" и кнопка "+ New Module".
  - Поиск (Search bar) во всю ширину.
  - **Сетка карточек:** 3 колонки. Каждая карточка содержит: тег типа (Flashcards/Quiz), заголовок, описание, дату последнего изучения, кнопки Edit/Delete и основную кнопку действия (Study/Start Quiz).
- **Sidebar (справа):** Список "Recent Activity" с иконками типов активностей и временем.

---

## 5. Module Detail (Детали модуля)

- **Header Card:** Крупный блок с градиентным фоном. Название модуля, описание и статистика справа. Огромная кнопка запуска (Teal для карточек, Purple для квиза).
- **Список контента:** Таблица/список всех карточек или вопросов. Каждая строка — Question + Answer/Type. Кнопки управления при ховере.
- **Floating Bar:** Внизу экрана всегда висит кнопка "+ Add New Card/Question".

---

## 6. Study Modes (Режимы обучения)

- **Flashcard Mode:**
  - Минималистичный интерфейс. Большая центральная карточка с 3D-поворотом.
  - Кнопки снизу (появляются после переворота): "Didn't know" (Red) и "I knew it" (Teal).
  - Счетчик прогресса внизу (Known/Unknown/Remaining).
- **Quiz Mode:**
  - Карточка вопроса с тегом типа (Multiple Choice и т.д.).
  - Варианты ответа в виде кликабельных плиток (A, B, C, D).
  - После выбора — подсветка правильного (Green) или неправильного (Red).

---

## 7. Admin Panel (Админка)

- **Sidebar (слева):** Вертикальное меню с иконками, логотип с бейджем "ADMIN".
- **Users Management:** Большая таблица пользователей. Колонки: User (Avatar + Name), Role, Modules, Status (Pill badges). Кнопки "Block/View".
- **Modal:** Всплывающее окно подтверждения блокировки с красной иконкой предупреждения.

---

## Технические детали компонентов

- **Border-radius:** 12px для кнопок, 16px для карточек, 8px для инпутов.
- **Shadows:** Фиолетовое свечение (`box-shadow: 0 0 20px rgba(108, 99, 255, 0.2)`) для активных элементов.
- **Transitions:** Плавная анимация 0.3s для всех ховер-эффектов.
