# QuizoO — Stitch AI UI Prompts

> Промты для генерации полного UI макета проекта QuizoO. Каждый промт —
> отдельная страница. Копируй и вставляй в Stitch AI по одному.

---

## 🎨 Общий Design System (читать перед всеми промтами)

Перед генерацией каждой страницы держи в голове общую систему:

- **Название:** QuizoO
- **Общая атмосфера:** современный EdTech, тёмная основная тема, энергичный но
  не кричащий
- **Цветовая палитра:**
  - Фон основной: `#0F1117` (почти чёрный с синеватым оттенком)
  - Фон карточек/панелей: `#1A1D2E` (тёмно-синий)
  - Фон seconday: `#222640`
  - Акцент primary: `#6C63FF` (яркий фиолетовый)
  - Акцент secondary: `#00D4AA` (мятный/бирюзовый)
  - Текст primary: `#FFFFFF`
  - Текст secondary: `#8B8FA8`
  - Danger/ошибка: `#FF5C5C`
  - Success/правильно: `#00D4AA`
- **Шрифты:**
  - Заголовки: **Syne** (жирный, широкий, modern)
  - Тело текста: **DM Sans** (чистый, читаемый)
  - Акценты/метки: **JetBrains Mono** (моноширинный для счётчиков, процентов)
- **Радиус скруглений:** 16px для карточек, 10px для кнопок, 8px для инпутов
- **Тень:** мягкая фиолетовая подсветка на активных элементах
  `0 0 20px rgba(108,99,255,0.3)`
- **Кнопка смены темы:** иконка солнца/луны в правом углу navbar — переключает
  на светлую тему
- **Светлая тема:** фон `#F4F5FF`, карточки `#FFFFFF`, текст `#1A1D2E`, акцент
  тот же фиолетовый

---

## 📄 Промт 1 — Landing Page (Главная / приветственная страница)

```
Design a landing page for a web application called "QuizoO" — a knowledge retention platform using flashcards and quizzes.

ATMOSPHERE: Dark, modern, EdTech. Feels like a premium SaaS product. Energetic but clean. Slight purple glow aesthetic.

COLORS:
- Background: #0F1117 (deep dark navy-black)
- Cards/panels: #1A1D2E
- Primary accent: #6C63FF (vivid purple)
- Secondary accent: #00D4AA (mint/teal)
- Text primary: #FFFFFF
- Text secondary: #8B8FA8

FONTS:
- Headlines: Syne (bold, wide-tracking)
- Body: DM Sans
- Numbers/labels: JetBrains Mono

LAYOUT (top to bottom):

1. NAVBAR (fixed, top)
- Left: Logo "QuizoO" — the "O" letters styled as circular flashcard icons, text in Syne bold, white with purple accent
- Right: navigation links "Features", "How it works" | buttons: "Log in" (ghost/outline) and "Get started" (solid purple #6C63FF)
- Far right corner: dark/light theme toggle button (moon icon for dark, sun for light)
- Navbar background: semi-transparent #1A1D2E with backdrop blur

2. HERO SECTION (centered, full viewport height)
- Big bold headline in Syne: "Learn smarter. Remember longer." — white text, very large (72px+)
- Subheading in DM Sans: "Create your own modules, study with flashcards, test yourself with quizzes." — color #8B8FA8
- Two CTA buttons side by side: "Start for free" (solid #6C63FF, with arrow icon) and "See how it works" (ghost outline white)
- Below buttons: small social proof text in JetBrains Mono: "1,200+ modules created" — muted teal color
- Background: subtle purple radial gradient glow in the center of the dark background, like a soft halo

3. FEATURE CARDS SECTION (3 cards in a row)
- Section title: "Everything you need to learn effectively" — Syne bold, white, centered
- Card 1: icon of stacked cards → "Flashcard Mode" — flip through cards, mark what you know
- Card 2: icon of a checklist → "Quiz Mode" — multiple choice, text input, matching questions
- Card 3: icon of a bar chart → "Track Your Progress" — detailed history and statistics
- Card style: background #1A1D2E, border 1px solid #222640, rounded 16px, icon in purple circle, title in white Syne, description in #8B8FA8 DM Sans
- Hover effect: card lifts slightly, border glows purple

4. HOW IT WORKS SECTION
- 3 steps with large numbered labels in JetBrains Mono (01, 02, 03) in faded purple
- Step 1: "Create a module" — add your topic and cards
- Step 2: "Choose a mode" — flashcards for learning, quiz for testing
- Step 3: "Track your growth" — see your progress over time
- Layout: horizontal steps connected by a dashed purple line

5. FOOTER
- Logo + tagline left side
- Links: "About", "Contact", "GitHub"
- Right: theme toggle again (moon icon)
- Background: #1A1D2E, border-top 1px solid #222640
```

---

## 📄 Промт 2 — Login Page (Страница входа)

```
Design a login page for "QuizoO" — a knowledge retention web app.

ATMOSPHERE: Minimal, focused, dark. Single-purpose screen. Feels clean and trustworthy.

COLORS:
- Page background: #0F1117 with a very subtle purple radial glow in the top-left corner
- Form card background: #1A1D2E
- Accent: #6C63FF (purple)
- Secondary accent: #00D4AA (mint)
- Text: #FFFFFF primary, #8B8FA8 secondary
- Input background: #222640
- Input border default: #2E3250, focused: #6C63FF with glow

FONTS: Syne for title, DM Sans for labels and body, JetBrains Mono for small labels

LAYOUT:
- Split screen — left 55% / right 45%

LEFT SIDE (decorative/branding):
- Full height, background: dark gradient from #0F1117 to #1A1D2E
- Large logo "QuizoO" centered, Syne bold, white with purple "O" accent
- Tagline below: "Your personal learning companion" — DM Sans, #8B8FA8
- Below tagline: 3 floating cards showing mini stats, staggered arrangement:
  Card 1: "🔥 15-day streak"
  Card 2: "📚 48 cards learned today"
  Card 3: "✅ 92% quiz accuracy"
  Each card: #1A1D2E background, subtle purple border, white text

RIGHT SIDE (form area):
- White/light panel OR same dark theme (matches theme toggle)
- Centered vertically
- Title: "Welcome back" — Syne bold, large, white
- Subtitle: "Log in to continue your learning" — DM Sans, #8B8FA8
- Form fields (stacked):
  - Email input: label "Email" above, placeholder "you@example.com"
  - Password input: label "Password" above, placeholder "••••••••", eye icon to toggle visibility
- "Forgot password?" link — small, right-aligned, purple #6C63FF
- Submit button: full width, solid #6C63FF, "Log in" text, Syne font, slight glow on hover
- Divider: "or" with lines on each side
- "Don't have an account? Sign up" — link in purple at the bottom
- Theme toggle button: top-right corner of the right panel (sun/moon icon)
```

---

## 📄 Промт 3 — Register Page (Страница регистрации)

```
Design a registration page for "QuizoO" — a knowledge retention platform.

ATMOSPHERE: Same as login page — dark, clean, focused. Slightly more welcoming since it's onboarding.

COLORS:
- Background: #0F1117
- Form panel: #1A1D2E
- Accent: #6C63FF
- Secondary: #00D4AA
- Text: #FFFFFF / #8B8FA8
- Inputs: #222640 background, #6C63FF border on focus

FONTS: Syne (headings), DM Sans (body/labels), JetBrains Mono (step indicator)

LAYOUT — centered single column with decorative background:
- Background: dark with a soft teal glow in the bottom-right area
- Centered card, max-width 480px, rounded 20px, #1A1D2E, subtle shadow

INSIDE CARD (top to bottom):
- Logo at top: "QuizoO" small, centered
- Title: "Create your account" — Syne bold, white, 32px
- Subtitle: "Start learning in minutes" — DM Sans, #8B8FA8

FORM FIELDS:
- Username: input with person icon inside, placeholder "your_username"
- Email: input with envelope icon, placeholder "you@example.com"
- Password: input with lock icon, eye toggle for visibility
- Confirm password: same style as password field
- All inputs: background #222640, border 1px solid #2E3250, rounded 8px, white text, purple focus glow

PASSWORD STRENGTH INDICATOR (below password field):
- 4 small horizontal bars, colored progressively: red → orange → yellow → green
- Small label in JetBrains Mono showing strength: "Weak" / "Medium" / "Strong"

SUBMIT BUTTON:
- Full width, solid #6C63FF, "Create account" in Syne bold white
- Subtle purple glow shadow on hover

BOTTOM:
- "Already have an account? Log in" — link in #6C63FF

TOP-RIGHT:
- Theme toggle (sun/moon icon)
```

---

## 📄 Промт 4 — Dashboard (Главная страница пользователя)

```
Design a dashboard page for "QuizoO" — a learning platform. This is the main hub where users see and manage their knowledge modules.

ATMOSPHERE: Organized, spacious, motivating. Dark theme. Feels like a personal learning workspace.

COLORS: #0F1117 background, #1A1D2E cards, #6C63FF accent, #00D4AA secondary, #FFFFFF/#8B8FA8 text

FONTS: Syne (headings), DM Sans (body), JetBrains Mono (stats/numbers)

LAYOUT:

TOP NAVBAR (fixed):
- Left: "QuizoO" logo
- Center: navigation — "My Modules", "Statistics", "Settings"
- Right: user avatar circle (initials inside) + username + dropdown arrow | theme toggle (sun/moon icon)

PAGE CONTENT:

SECTION 1 — Welcome Banner:
- Greeting: "Good evening, Alex 👋" — Syne bold, 36px, white
- Subtext: "You have 5 modules. Keep it up!" — DM Sans, #8B8FA8
- Quick stats row (3 mini cards in JetBrains Mono numbers):
  - "12" — Total Modules
  - "248" — Cards Studied
  - "87%" — Avg Quiz Score
  Each stat card: #1A1D2E, rounded, small purple icon above number

SECTION 2 — My Modules:
- Section header row: "My Modules" (Syne bold, left) + "New Module" button (right, solid #6C63FF, plus icon, rounded 10px)
- Search bar below: input with magnifier icon, placeholder "Search modules...", #222640 background

MODULE CARDS GRID (3 columns, responsive):
Each module card design:
- Background: #1A1D2E
- Top-left: two small pills: one showing module type ("Flashcards" or "Quiz") and one showing card/question count, e.g. "Flashcards · 24 cards" or "Quiz · 12 questions", JetBrains Mono, pill shape, teal/purple backgrounds
- Module title: Syne bold, white, 18px
- Module description: DM Sans, #8B8FA8, 2 lines max
- Bottom row: "Last studied: 2 days ago" in small DM Sans | two icon buttons: Edit (pencil) and Delete (trash), muted color
- Bottom CTA: one primary action button depending on the module type:
  - For flashcards modules: "📇 Study flashcards" (teal outline or solid).
  - For quiz modules: "📝 Start quiz" (purple outline or solid).
- Hover: card lifts, purple glow border appears

NEW MODULE FLOW:
- Clicking the "New Module" button opens a full-screen overlay (or modal) with two large selectable cards:
  - Left card: "Create Flashcards set" — short description, icon of stacked cards.
  - Right card: "Create Quiz" — short description, icon of a checklist.
- Each choice card has a big title, 1–2 line description, and a primary "Continue" button on hover/click.
- Once the user selects a type, they are taken to the corresponding editor screen (Flashcards Module Editor or Quiz Module Editor).

EMPTY STATE (if no modules):
- Centered illustration: a large empty card outline with a "+" symbol
- Text: "No modules yet. Create your first one!" — DM Sans
- Big "Create module" button below — solid purple

RIGHT SIDEBAR (optional, only on wide screens):
- "Recent Activity" section
- List of last 5 sessions: module name, mode (flashcard/quiz), score if quiz, time ago
- Each item: small colored icon (📇 or 📝), text, date — separated by thin dividers
```

---

## 📄 Промт 5 — Module Detail Page (Просмотр модуля)

```
Design a module detail page for "QuizoO". This page shows a single module (either Flashcards or Quiz type) and lets the user start the matching session. Module type is fixed when the module is created.

CONTEXT: There are two module types. For a **Flashcards** module — show one main CTA "Study with Flashcards" and list the cards (question/answer pairs). For a **Quiz** module — show one main CTA "Start quiz" and list the questions (with their types). Do not show both CTAs on the same card; the page reflects the module type.

ATMOSPHERE: Focused and informative. Dark theme. Clear hierarchy between module info and content list.

COLORS: #0F1117 background, #1A1D2E panels, #6C63FF accent, #00D4AA secondary

FONTS: Syne (titles), DM Sans (body), JetBrains Mono (card numbers, stats)

LAYOUT:

TOP NAVBAR: same as dashboard — logo left, nav center, avatar + theme toggle right

BREADCRUMB:
- "My Modules > English B1" — small DM Sans, #8B8FA8, with ">" separator

MODULE HEADER CARD (full width, rounded 16px):
- Background: gradient from #1A1D2E to #222640
- Left side: Module title "English B1" — Syne bold 36px white | description below — DM Sans #8B8FA8
- Right side: stats in JetBrains Mono:
  - "32 cards"
  - "4 sessions completed"
  - "Last studied: Yesterday"
- Bottom of header: one main action button depending on module type:
  - If Flashcards module: single button "📇 Study with Flashcards" — #00D4AA teal solid, Syne bold.
  - If Quiz module: single button "📝 Start quiz" — #6C63FF purple solid, Syne bold.
  Button large, rounded 12px, icon + text.

For Quiz modules only (optional row below header):
- "Shuffle questions" toggle switch (purple when on).

CARDS / QUESTIONS LIST SECTION:
- Section header: "Cards (N)" for Flashcards module or "Questions (N)" for Quiz module — Syne bold | right side: "Edit" button (outline purple, pencil icon)
- Search bar: "Search cards..." or "Search questions..." accordingly

LIST (stacked rows):
- Flashcards module: each row = one card — left: index (e.g. "01"); center: question + answer (answer in #8B8FA8); right: edit + delete on hover.
- Quiz module: each row = one question — left: index; center: question text + small type pill (Multiple choice / Text input / Matching); right: edit + delete on hover.
- Separated by thin #222640 divider lines; hover: row background lightens slightly.

BOTTOM FLOATING BAR:
- Fixed at bottom of screen
- "Add card" for Flashcards module or "Add question" for Quiz module — full width inside bar, solid purple, large, "+" icon
```

---

## 📄 Промт 6 — Module Editor (Создание и редактирование модуля)

```
Design editor screens for creating and editing modules in "QuizoO". After clicking "New Module" on the dashboard and choosing a module type, the user lands on one of two editor variants:
- Flashcards Module Editor — for simple question/answer study sets.
- Quiz Module Editor — for quizzes with different question types (multiple choice, text input, matching).

ATMOSPHERE: Productive, workspace-like. Dark. Clean form UI. No distractions.

COLORS: #0F1117 background, #1A1D2E card panels, #6C63FF accent, #222640 input backgrounds

FONTS: Syne (headings), DM Sans (labels, inputs), JetBrains Mono (card counter)

LAYOUT:

TOP NAVBAR: same consistent navbar with theme toggle

PAGE TITLE AREA:
- "Create New Module" or "Edit Module" — Syne bold 32px white
- Subtitle: "Add your cards below. You can always edit them later." — DM Sans #8B8FA8

FLASHCARDS MODULE EDITOR:

MODULE INFO FORM (top card, #1A1D2E, rounded 16px):
- Field 1: "Module title" — label + text input (full width), placeholder "e.g. Spanish Vocabulary Level A2"
- Field 2: "Description (optional)" — label + textarea, placeholder "What is this module about?", 3 rows tall
- Both inputs: #222640 background, border #2E3250, focus border #6C63FF with glow, white text, rounded 8px

CARDS SECTION (below module info):
- Section header row: "Cards" left | card counter in JetBrains Mono right: "8 cards added"

CARD ROWS (stacked, each is an editable card):
Each card row design:
- Container: #1A1D2E, rounded 12px, 1px border #2E3250
- Left: drag handle icon (6 dots), muted gray — for reordering
- Card number badge: JetBrains Mono, purple, e.g. "#01"
- Two inputs side by side:
  - Left input: "Question / Term" — placeholder "e.g. What is the capital of France?"
  - Right input: "Answer / Definition" — placeholder "e.g. Paris"
  Both: #222640 background, rounded, full inner width, white text
- Right side: trash/delete icon button — appears on hover, red on hover
- Hover entire card: subtle border glow

ADD CARD BUTTON:
- Full width, dashed border #6C63FF, rounded 12px, "+" icon + "Add card" text
- Hover: solid purple background

BOTTOM ACTION ROW (sticky at bottom or at end of page):
- Left: "Cancel" button — ghost/outline
- Right: "Save Module" button — solid #6C63FF, Syne bold, arrow icon

QUIZ MODULE EDITOR:

- Same overall shell (navbar, page title area, module info form) as the flashcards editor, but the main content area shows a list of quiz questions instead of simple Q/A cards.
- Section header: "Questions" left | JetBrains Mono counter right: "5 questions added".

QUESTION ROWS:
- Container: #1A1D2E, rounded 12px, 1px border #2E3250.
- Left: drag handle icon for reordering.
- Top row inside each question:
  - Small pill showing question type: "Multiple choice", "Text input", or "Matching".
  - A compact type switcher (dropdown or pill group) so the user can change the question type.
  - On the far right: trash/delete icon button (red on hover).

QUESTION TYPE LAYOUTS:

- Multiple choice:
  - Question text input at the top.
  - Below: a vertical list of answer options; each row has a radio icon or "Correct" badge, an input field, and a small drag handle for reordering options.
  - One option is marked as correct; others are distractors. A "+ Add option" link lets the user add more options.

- Text input:
  - Question text input at the top.
  - Below: a single "Correct answer" text input with helper text like "User's answer will be compared to this value".

- Matching:
  - Two columns inside the card:
    - Left column: "Term" inputs listed vertically.
    - Right column: "Definition" inputs listed vertically, aligned with the terms.
  - Each row is a pair; a "+ Add pair" button adds another term/definition row.

BOTTOM OF EDITOR:
- Under the questions list: a large "+ Add Question" button (dashed outline, purple border; solid purple on hover).
- Sticky bottom action row similar to flashcards editor with "Cancel" (ghost) on the left and "Save Quiz" (solid purple) on the right.
```

---

## 📄 Промт 7 — Flashcard Mode (Режим карточек)

```
Design the flashcard study mode page for "QuizoO". The user is studying a module by flipping through cards one by one.

ATMOSPHERE: Immersive, focused. Dark background to reduce distractions. The card is the center of everything. Calm but engaging.

COLORS: #0F1117 background with very subtle purple ambient glow, #1A1D2E card face, #6C63FF accent, #00D4AA for "Known" action

FONTS: Syne (card question/answer), DM Sans (UI text), JetBrains Mono (progress counter)

LAYOUT:

TOP BAR (minimal, not full navbar):
- Left: "← Back to module" small link, DM Sans, #8B8FA8
- Center: module name "English B1" in DM Sans white
- Right: progress counter in JetBrains Mono: "Card 7 / 32" | theme toggle icon

PROGRESS BAR:
- Thin full-width bar below top bar
- Fill: gradient from #6C63FF to #00D4AA
- Shows % of cards seen

MAIN FLASHCARD (center of screen, large):
- Size: roughly 600x380px, centered both horizontally and vertically in remaining space
- Shape: rounded 24px, very slight 3D perspective appearance
- FRONT FACE:
  - Background: #1A1D2E
  - Top-right corner: small label in JetBrains Mono: "QUESTION" muted purple
  - Center: question text in Syne bold, white, large (28-32px), centered
  - Bottom center: "Tap to flip" hint in small DM Sans #8B8FA8 with flip icon
  - Subtle purple shadow/glow around the card
- BACK FACE (after flip, 3D CSS flip animation):
  - Background: gradient from #1A1D2E to #222640
  - Top-right: "ANSWER" label in JetBrains Mono, teal color #00D4AA
  - Center: answer text in Syne, white, centered
  - Border: subtle teal glow on back face instead of purple

FLIP ANIMATION NOTE: show the card mid-flip (tilted at 90 degrees or slightly) to imply 3D flip interaction

BELOW CARD — action buttons (only visible after card is flipped):
- Two large buttons side by side, rounded 12px:
  - "✗ Didn't know" — background #FF5C5C red, Syne bold white, left button
  - "✓ I knew it" — background #00D4AA teal, Syne bold white, right button
- Keyboard hint below buttons: small DM Sans #8B8FA8: "← Didn't know  |  → Knew it"

BOTTOM STATS ROW:
- Three mini counters in JetBrains Mono:
  - "✓ 12 Known" in teal
  - "✗ 3 Unknown" in red
  - "○ 17 Remaining" in muted gray
```

---

## 📄 Промт 8 — Quiz Mode (Режим квиза)

```
Design the quiz mode page for "QuizoO". The user is answering questions in a test format. Three question types appear: multiple choice, text input, and matching.

ATMOSPHERE: Focused, test-like, but not sterile. Dark theme. Progress is clearly visible. Each question type has distinct visual style.

COLORS: #0F1117 background, #1A1D2E question card, #6C63FF accent, #00D4AA correct, #FF5C5C incorrect

FONTS: Syne (question text), DM Sans (options/labels), JetBrains Mono (question counter, score)

LAYOUT:

TOP BAR (minimal):
- Left: "← Exit quiz" — small DM Sans link, #8B8FA8
- Center: module name — DM Sans white
- Right: question counter in JetBrains Mono "Q 5 / 20" | score so far "Score: 80%" in teal | theme toggle

PROGRESS BAR: same as flashcard — thin, purple-to-teal gradient

QUESTION CARD (centered, large, #1A1D2E, rounded 20px):
- Top-left badge: question type label — e.g. "MULTIPLE CHOICE" or "TEXT INPUT" or "MATCHING" — JetBrains Mono, small pill shape, purple background
- Question text: Syne bold, white, 24-28px, centered with good padding

--- QUESTION TYPE 1: MULTIPLE CHOICE ---
Below question text: 4 answer options as large clickable cards:
- Each option: rounded 12px, background #222640, border 1px #2E3250
- Left: letter badge A / B / C / D in JetBrains Mono, small square, purple background
- Option text: DM Sans white
- STATES:
  - Default: #222640 background
  - Hovered: border turns purple, slight glow
  - Selected before submit: border solid purple, background tints purple lightly
  - Correct (after submit): border teal, background teal tint, checkmark icon right side
  - Incorrect (after submit): border red, background red tint, X icon right side

--- QUESTION TYPE 2: TEXT INPUT ---
- Large text input field below question: #222640, white text, rounded 10px, centered or full width
- Placeholder: "Type your answer here..."
- After submission: if correct → green border + "✓ Correct! Answer: Paris" teal message | if wrong → red border + "✗ Incorrect. Correct answer: Paris" red message

--- QUESTION TYPE 3: MATCHING ---
- Two columns side by side:
  LEFT COLUMN: terms (word/phrase) as draggable pills — purple background
  RIGHT COLUMN: definitions as drop zones — dashed border, #222640
- Correctly matched pairs: green connected with a line
- Incorrectly matched: red highlight on wrong pairing
- Header labels above each column: "Terms" | "Definitions" in DM Sans #8B8FA8 small

BOTTOM OF CARD:
- "Submit Answer" button — solid #6C63FF, full width of card, Syne bold
- After submission it changes to "Next Question →" — teal color
```

---

## 📄 Промт 9 — Quiz Session Results (Результаты после квиза)

```
Design the results page for "QuizoO" that appears **only after completing a quiz session** (not after flashcards). Quiz has a real score and per-question correct/wrong; this screen shows that.

ATMOSPHERE: Rewarding, celebratory but informative. Dark theme with pops of color. User should feel motivated to study again.

COLORS: #0F1117 background, #1A1D2E cards, #6C63FF accent, #00D4AA success

FONTS: Syne (big numbers, titles), DM Sans (body), JetBrains Mono (stats)

LAYOUT (top to bottom, centered):

HERO SCORE SECTION:
- Large circular score badge (centered):
  - Circle ring: progress ring SVG showing % filled, gradient purple-to-teal
  - Inside: big score number in Syne bold e.g. "84%" — white, very large (56px)
  - Below number: "Quiz complete!" — DM Sans #8B8FA8
- Module name above circle: "English B1 — Quiz Results" Syne 24px white

RESULT INTERPRETATION:
- A badge below the circle showing rating:
  - 90-100%: "🏆 Excellent!" — gold color
  - 70-89%: "🎯 Good job!" — teal color
  - 50-69%: "📚 Keep studying!" — yellow
  - <50%: "💪 More practice needed!" — red
- Text in Syne bold

STATS ROW (3 mini cards in a row):
- "✓ 17 Correct" — teal
- "✗ 3 Incorrect" — red
- "⏱ 4:32" — time taken, purple
Each: #1A1D2E, rounded 12px, JetBrains Mono for number, DM Sans for label

ACTION BUTTONS (2 buttons, side by side):
- "Try Again" — outline #6C63FF, rounded 10px, DM Sans
- "Study Flashcards" — solid #6C63FF, rounded 10px, DM Sans

DETAILED BREAKDOWN (below buttons):
- Section title: "Question Breakdown" — Syne bold, left aligned
- List of all questions:
  Each row:
    - Left: ✓ or ✗ icon (teal or red circle)
    - Question text — DM Sans white
    - Your answer: green text if correct, red if wrong
    - Correct answer: shown in teal if you were wrong
  Rows separated by thin dividers, alternating very slightly in background shade
  Scrollable if many questions

BOTTOM:
- "← Back to module" link — DM Sans, #8B8FA8
```

---

## 📄 Промт 9b — Flashcard Session Complete (Итог сессии карточек)

```
Design the **end-of-session summary screen for the Flashcards mode** in "QuizoO". Shown when the user finishes a flashcard session (no score — user only self-marked "Knew" / "Didn't know"). This is NOT a "results" page like the quiz; it is a short summary and next actions.

CONTEXT: In flashcard mode there is no "correct/incorrect" — the user flips cards and marks "Knew" or "Didn't know". Cards marked "Didn't know" were repeated in the stack. So the summary is: how many cards were seen, how many marked "Knew", how many "Didn't know" (repeated). No percentage score, no per-card breakdown.

ATMOSPHERE: Calm, encouraging, minimal. Dark theme. Feels like "session done, here's a quick recap."

COLORS: #0F1117 background, #1A1D2E cards, #6C63FF accent, #00D4AA for "known" stat, #8B8FA8 muted text

FONTS: Syne (title), DM Sans (body, labels), JetBrains Mono (numbers)

LAYOUT (centered, compact):

TITLE:
- "Session complete" or "Done! 👋" — Syne bold, white, 28–32px
- Module name below: e.g. "English B1" — DM Sans #8B8FA8

STATS ROW (2–3 mini cards in a row, no big circle):
- "Cards reviewed: 24" — JetBrains Mono number, DM Sans label
- "✓ Knew: 20" — teal #00D4AA
- "✗ To review again: 4" or "Repeated: 4" — muted or soft red, meaning "you marked these as didn't know"
Each stat: #1A1D2E, rounded 12px, same style as app

ACTION BUTTONS (2 buttons, side by side):
- "← Back to module" — outline/ghost, DM Sans
- "Study again" or "Repeat" — solid #6C63FF, primary

BOTTOM:
- Optional: "View statistics" or "My modules" text link — DM Sans #8B8FA8

No score ring, no question-by-question breakdown. Keep it short and clear.
```

---

## 📄 Промт 10 — Statistics Page (Страница статистики)

```
Design a statistics/progress page for "QuizoO" where users see their overall learning progress.

ATMOSPHERE: Data-driven but warm. Dark with colorful charts. Feels like a personal analytics dashboard. Motivating.

COLORS: #0F1117 background, #1A1D2E chart panels, #6C63FF purple, #00D4AA teal, #FF5C5C red for errors

FONTS: Syne (section titles), DM Sans (labels), JetBrains Mono (numbers/stats)

LAYOUT:

TOP NAVBAR: same consistent navbar, theme toggle top right

PAGE TITLE:
- "Your Progress" — Syne bold 36px white left aligned
- Subtitle: "Track how your knowledge grows over time" — DM Sans #8B8FA8

TOP STATS ROW (4 cards):
- "Total Sessions: 47" — purple icon
- "Cards Studied: 842" — teal icon
- "Avg Quiz Score: 79%" — green icon
- "Study Streak: 🔥 8 days" — orange icon
Each: #1A1D2E, rounded 16px, large JetBrains Mono number, DM Sans label, small icon top-left

MAIN CHART (full width, below stats):
- Panel: #1A1D2E, rounded 16px, padding
- Title: "Quiz Score Over Time" — Syne bold white left aligned
- Chart type: line chart with area fill
  - X axis: dates
  - Y axis: score %
  - Line: #6C63FF with a soft purple gradient fill below
  - Data points: small circles, pulse glow on hover
- Time filter pills top-right of chart: "7 days" | "30 days" | "All time" — active pill: solid purple, inactive: outline

MODULE BREAKDOWN TABLE (below chart):
- Title: "Performance by Module" — Syne bold
- Table design:
  - Headers: "Module", "Sessions", "Best Score", "Last Studied" — DM Sans bold #8B8FA8, small caps
  - Rows: white text, DM Sans, alternating background #1A1D2E / #161926
  - "Best Score" shown as a colored pill: green if >80%, yellow if >60%, red if <60%
  - "Last Studied" in JetBrains Mono, muted
  - Rounded table container, no hard borders inside

WEAK CARDS SECTION:
- Title: "Cards to review 🔁" — Syne bold
- Cards that had most wrong answers across sessions
- List of 5-8 card rows:
  - Question text | "X times wrong" in red JetBrains Mono | "Study" link in purple
```

---

## 📄 Промт 11 — Admin Dashboard (Панель администратора)

```
Design an admin dashboard for "QuizoO". The admin manages users and modules of the platform.

ATMOSPHERE: Professional, utilitarian but still on-brand dark theme. Data-heavy. Feels like a control center.

COLORS: Same palette — #0F1117, #1A1D2E, #6C63FF, #00D4AA, #FF5C5C for danger actions

FONTS: Syne (page titles), DM Sans (table data, labels), JetBrains Mono (numbers, IDs)

LAYOUT:

LEFT SIDEBAR (fixed, collapsible):
- Top: "QuizoO" logo + "ADMIN" badge in red pill
- Navigation items (icon + label):
  - 🏠 Dashboard
  - 👥 Users
  - 📚 Modules
  - 📊 Analytics (greyed — future)
- Bottom: avatar + admin username + "Logout" link
- Background: #1A1D2E, border-right 1px #222640

MAIN CONTENT AREA (to the right of sidebar):

PAGE: ADMIN DASHBOARD (overview)
- Page title: "Admin Overview" — Syne bold, white

STAT CARDS ROW (4 cards):
- Total Users: 1,240
- Total Modules: 5,880
- Sessions Today: 320
- Flagged Content: 3 (in red with warning icon)

RECENT USERS TABLE (below stats):
- Title: "Recently Registered Users"
- Columns: Avatar+Name, Email, Join Date, Modules Count, Status, Actions
- Status badge: "Active" green pill | "Blocked" red pill
- Actions column: "Block" (red text button) | "View" (purple text button)
- Table: #1A1D2E, alternating row shades, DM Sans, JetBrains Mono for dates

RECENT MODULES TABLE (below users):
- Title: "Recently Created Modules"
- Columns: Module Title, Created By, Cards Count, Created At, Actions
- Actions: "Delete" (red, with confirm modal) | "View" (purple)

THEME TOGGLE: top-right of main content header bar (sun/moon icon)
```

---

## 📄 Промт 12 — Admin Users Page (Управление пользователями)

```
Design the users management page for the "QuizoO" admin panel.

ATMOSPHERE: Clean data table. Professional. Dark theme consistent with admin panel.

COLORS: #0F1117 / #1A1D2E / #6C63FF / #FF5C5C (block action) / #00D4AA (active status)

FONTS: Syne (page title), DM Sans (table content), JetBrains Mono (IDs, dates)

LAYOUT (with same left sidebar as admin dashboard):

PAGE TITLE ROW:
- Left: "Users" — Syne bold 32px white
- Right: search input "Search by name or email..." + filter dropdown "All / Active / Blocked"

FULL WIDTH USERS TABLE:
Columns:
- # (row number, JetBrains Mono, muted)
- User (avatar circle with initials + username + email below, two-line)
- Role: "user" or "admin" — pill badge, purple for admin, gray for user
- Modules: number in JetBrains Mono
- Joined: date in JetBrains Mono, muted
- Status: "Active" green pill | "Blocked" red pill
- Actions: "Block" red text button | "Unblock" teal text button | "View modules" purple text button

TABLE STYLE:
- Container: #1A1D2E, rounded 16px
- Row height: comfortable, 64px
- Row hover: background slightly lighter, actions become more visible
- Dividers: 1px #222640 between rows
- Pagination at bottom: "← Previous | Page 1 of 12 | Next →" — DM Sans, purple active page

CONFIRM MODAL (appears when "Block" clicked):
- Dark overlay background
- Modal card: #1A1D2E, rounded 16px, centered
- Warning icon in red circle
- Title: "Block this user?" — Syne bold
- Text: "They will lose access to their account immediately." — DM Sans #8B8FA8
- Buttons: "Cancel" outline | "Block User" solid red

THEME TOGGLE: top-right corner of header
```
