# QuizoO — Complete UI Design & Interactive Prototype Brief

## 1. Your task

Design and build a polished, cohesive, responsive interface for **QuizoO**, a personal learning web application based on flashcards and quizzes.

This is a redesign of an existing product, not an invitation to invent a different product. Preserve the functionality and distinctions described below. Deliver an interconnected interactive prototype with all 18 named screens, meaningful sample content, and the important UI states.

Prioritize visual craft, clear hierarchy, excellent forms, and realistic workflows. The result should feel like a distinctive, launch-ready learning product, not a generic SaaS template or an abstract Dribbble concept.

Use English for interpreting this brief, but use **Russian for all visible interface copy**. Keep the brand name **QuizoO** unchanged. Use consistent, natural Russian wording and correct plural forms.

## 2. Product and scope

Users create private learning modules of two distinct types:

- **Flashcard set:** pairs of question/term and answer/definition. Users reveal the answer, then choose «Знал» or «Не знал». Unknown cards return to the study queue.
- **Quiz:** a set of questions with single-choice, text-answer, matching, and ordering question types. Users complete the quiz and receive a score and answer review.

Users can manage their modules, study, view results and history, and edit their profile. Administrators can view platform totals, block/unblock users, inspect modules, and delete modules.

Authentication includes email/password and Google. Include password recovery screens as a design requirement; do not imply that an existing backend already implements this workflow.

The landing page is part of this redesign even though the original guest experience was limited to authentication.

### Out of scope

Do not introduce public module discovery, social profiles, comments, subscriptions, pricing, multiplayer, live rooms, AI generation, spaced repetition scheduling, sprints, streak rewards, leaderboards, or advanced heatmaps. Do not display fake disabled navigation entries for these features.

Do not add user deletion, role editing, billing management, or administrator impersonation.

## 3. Visual direction

**Clean, light, confident, friendly, and slightly playful — without becoming childish.**

Combine a calm workspace with blue, purple, and yellow brand accents. Use crisp typography, tangible controls, subtle outlines, generous but purposeful spacing, and occasional editorial-style static illustrations.

The supplied PostHog login screenshot is a reference for the simplicity of the central form, strong typographic hierarchy, clear borders, tactile primary action, and restrained personality. Do not copy its branding, hedgehog mascot, orange palette, exact layout, or authentication providers.

### Color tokens

| Token            | Value   | Purpose                                        |
| ---------------- | ------- | ---------------------------------------------- |
| Background       | #F7F8FC | Main application canvas                        |
| Surface          | #FFFFFF | Cards, forms, tables, dialogs                  |
| Text primary     | #20243C | Headings and body text                         |
| Text secondary   | #71768D | Supporting text and metadata                   |
| Border           | #DFE3EF | Dividers, fields, containers                   |
| Primary blue     | #4561E8 | Main actions, active navigation, focus accents |
| Secondary purple | #8055D9 | Quiz identity and secondary brand accents      |
| Accent yellow    | #F6CE61 | Small highlights and illustration details      |
| Blue tint        | #EEF2FF | Selected elements and flashcard accents        |
| Purple tint      | #F3EEFC | Quiz surfaces and badges                       |
| Yellow tint      | #FFF6D9 | Small highlight surfaces                       |

Blue is the dominant action color. Purple supports the identity of quizzes. Yellow is an accent, not a large saturated page background. Use dark text on yellow surfaces. Keep success, warning, and error colors distinct from brand decoration and verify contrast in actual combinations. Adjust shades where necessary for accessibility.

Use text and icons alongside type colors: a blue badge alone must not be the only indication that a module contains flashcards.

### Typography

- Prefer **Manrope** with Cyrillic support; use a suitable sans-serif fallback if unavailable.
- Display headings: approximately 48–64 px on desktop landing pages; scale down gracefully.
- Application page headings: approximately 28–32 px.
- Section headings: 18–22 px.
- Body and controls: 15–16 px.
- Metadata: 12–14 px; do not make important information tiny.
- Use comfortable line-height, deliberate weights, and strong but restrained hierarchy.

### Geometry and depth

- Base spacing system: 4 px, mostly using 8/12/16/24/32/48 px intervals.
- Inputs and buttons: approximately 10–12 px corner radius.
- Larger cards and dialogs: approximately 16–20 px corner radius.
- Thin, visible borders and minimal shadows.
- A slight bottom-edge shadow is acceptable on a few prominent brand buttons; do not make every control look inflated or three-dimensional.
- Use consistent outline icons rather than emoji as UI icons.
- Do not place every sentence into its own floating card.

### Avoid

No glassmorphism, neon glow, purple-blue gradient wash, giant gradient text, rainbow dashboards, stock photography, excessive blobs, oversized empty banners, fake logos, fabricated testimonials, or meaningless decorative charts. No dark theme in this first version.

## 4. Mascot and illustration rules

The user wants a static mascot in occasional illustrations but has **not chosen its identity**. Do not arbitrarily decide that the brand uses a badger, cat, hedgehog, owl, or any other animal.

For this prototype, use a consistent **provisional non-character illustration motif**: outlined study cards, small stars, bookmarks, and book shapes in blue, purple, and yellow. Compose these as finished, restrained illustrations that can later receive an approved mascot without changing the layout. Do not leave visible broken-image boxes or labels saying “mascot placeholder”.

Reserve illustration placements on the landing page, authentication pages where space allows, the empty library, study completion, and 404. Do not put a mascot or decorative illustration in editors, active study tasks, quiz questions, administrative tables, or every navigation item.

The eventual mascot must be static artwork, not a chatbot, floating assistant, animated guide, or speaking character. Do not invent dialogue or tooltips from it.

## 4.1 Additional mascot information

Mascot
Create Q (Кью), a small fictional creature shaped like a rounded study card: a compact, almost-square light-lavender body, a thin dark-blue outline, and one folded upper corner revealing a yellow reverse side. Give it two small dark eyes, a simple subtle mouth, short arms, and tiny rounded feet. Use flat editorial-style illustration with clean, slightly organic lines, minimal shading, and consistent proportions across all scenes. Its personality is calm, curious, quietly supportive, and slightly playful—not childish, hyperactive, or a know-it-all teacher. Avoid oversized sparkling eyes, rosy cheeks, clothing, graduation caps, robot features, and 3D rendering. Include it selectively: beside the product preview on the landing page, sitting on a stack of cards on login, carrying a blank card on registration, holding a blank card in the empty module library, resting beside a closed book after flashcard study, and examining an upside-down card on the 404 page. On the full-page error screen, it may stand beside a small scattered stack of cards without looking distressed. Keep illustrations secondary to page content and omit them on narrow screens if space is limited. Never place the mascot in editors, active flashcard study, quiz questions, statistics, or admin tables. It is static artwork only: no animation, speech bubbles, chatbot behavior, floating overlay, or interaction. This direction replaces the earlier provisional non-character illustration motif and the instruction not to invent a mascot.

## 5. Layout system

### Public shell

Landing and authentication pages use a simple brand header without an application sidebar.

### Application shell

Dashboard, statistics, and profile use a compact left sidebar on desktop and a collapsible navigation drawer on mobile.

Navigation:

- «Мои модули»
- «Статистика»
- Profile entry near the bottom
- «Администрирование» only for an administrator
- Logout action

Sidebar width: approximately 232–248 px. Use a visually quiet active state with a blue tint and a clear icon/label.

### Focus shell

Editors and active learning sessions use a compact top bar instead of the full sidebar. Include a contextual back/exit action, module title, progress or save state, and relevant actions.

### Responsive behavior

Design for desktop around 1440 px, tablet around 768 px, and mobile around 390 px, with fluid layouts between them.

- Keep public content within a sensible maximum width.
- Use a readable content width instead of stretching forms across the screen.
- Convert module grids from three columns to two and then one.
- Stack flashcard editor fields on narrow screens.
- Make quiz question navigation collapsible on mobile.
- Keep the current task and primary action easy to find.
- Provide intentional mobile table behavior using priority columns, expandable rows, or readable cards. Avoid crushing full desktop tables into tiny text.
- Avoid sticky actions obscuring content or the software keyboard.

## 6. Shared components and interaction language

Create consistent components for buttons, fields, password visibility controls, selects, search, tabs, filters, badges, module cards, progress indicators, tables, dialogs, notifications, skeletons, empty states, and inline errors.

Every interactive element needs appropriate default, hover, focus-visible, active, loading, and disabled states.

- Show specific validation messages next to the relevant field.
- Keep user-entered values when submission fails.
- Use confirmation dialogs for destructive operations.
- Name the actual item or person in confirmation copy.
- Never rely solely on toast messages for important validation.
- Use restrained transitions around 150–220 ms and honor reduced-motion preferences.
- Make controls keyboard accessible; provide accessible names for icon-only buttons.
- Support keyboard alternatives to drag-and-drop.
- Keep touch targets comfortable, aiming for approximately 44 px where practical.
- Do not communicate errors, selection, or correctness by color alone.

## 7. Screen specifications

### 01 — Landing

**Route:** `/`

**Purpose:** Explain QuizoO and invite a guest to register.

Header: QuizoO wordmark left; «Войти» and «Начать учиться» right. Keep navigation minimal.

Hero:

- Left: headline «Не просто читай. Запоминай.»
- Supporting copy: «Создавай карточки и квизы, проверяй себя и наблюдай за прогрессом.»
- Primary action «Начать учиться» → registration.
- Secondary link «Уже есть аккаунт» → login.
- Right: a carefully composed product preview showing a real flashcard, a small quiz answer panel, and a compact result element. Use blue, purple, and small yellow accents, not a generic analytics dashboard.
- Include the restrained illustration motif without competing with the preview.

Below the hero:

1. Two complementary sections: «Запоминай карточками» and «Проверяй себя квизами».
2. Three steps: create a module, add material, start learning.
3. A larger product interface preview.
4. A compact final registration CTA.
5. A minimal footer with brand and basic navigation. Do not invent legal pages as working routes.

No pricing, fake customer counts, testimonials, partner logos, or claims about unimplemented features.

### 02 — Login

**Route:** `/login`

Centered authentication card approximately 440–480 px wide, brand above, calm light background, optional small illustration away from the fields.

- Heading «С возвращением».
- Email and password fields.
- Password visibility toggle.
- «Забыли пароль?» → password recovery.
- Full-width primary button «Войти».
- Divider and Google sign-in button.
- Registration link below the card.

Show loading, invalid credentials, field validation, and service-unavailable states without clearing fields. Successful prototype login opens the dashboard.

### 03 — Registration

**Route:** `/register`

Use the same authentication layout and geometry.

- Heading «Создай место для своих знаний».
- Username, email, and password.
- Clear password guidance.
- Primary button «Создать аккаунт».
- Google registration action.
- Link «Уже есть аккаунт? Войти».

Include email-in-use and validation states. Do not add a lengthy onboarding questionnaire or unsupported consent requirements.

### 04 — Password recovery

**Routes:** `/forgot-password`, `/reset-password`

Treat these as stages of one screen family:

1. Email entry and «Отправить ссылку».
2. Neutral confirmation: «Если аккаунт с таким адресом существует, мы отправили письмо со ссылкой для сброса пароля.»
3. New password and confirmation after opening a valid reset link.
4. Success state with «Войти».
5. Expired/invalid link with «Запросить новую ссылку».

Keep the same authentication card language. Include a back-to-login link.

### 05 — Dashboard / My modules

**Route:** `/app/modules`

Application sidebar plus main content.

Header: «Мои модули» left; primary «Создать модуль» right.

Optional compact «Продолжить занятие» panel only when the demo has an unfinished session. Do not imply unsupported persistent sessions are already implemented in production.

Toolbar:

- Search among the user's own modules.
- Tabs: «Все», «Карточки», «Квизы».
- Sorting control.

Module grid. Each card includes:

- Type icon and labeled badge.
- Title and short optional description.
- Number of cards/questions.
- Relevant updated or studied date when available.
- Primary «Учиться» or «Пройти квиз».
- Overflow actions: edit and delete.

Creation flow: «Создать модуль» opens a **full-screen type selection state**, not an extra product feature. Two large clear choices: «Набор карточек» and «Квиз». Each opens its corresponding editor. Include cancel/back.

States: populated library, first-use empty library with illustration and CTA, no search results, skeleton loading, local load error, delete confirmation.

### 06 — Flashcard editor

**Routes:** `/app/flashcards/new`, `/app/flashcards/:id/edit`

Focus shell. Top bar: back, editor/module title, unsaved/saved state, «Сохранить».

Module title and optional description above an ordered list of card editing blocks.

Each block:

- Card number.
- Reorder handle and accessible move up/down controls.
- Left field «Термин или вопрос».
- Right field «Ответ или определение».
- Delete action.

«Добавить карточку» below the list. On mobile stack fields vertically.

Include empty/new module state, validation of required content, save loading/success/failure, reorder interactions, deletion, and confirmation before leaving with unsaved changes.

Use explicit saving; do not pretend that background autosave exists. This is a content editor, not the study-card flip interface.

### 07 — Quiz editor

**Routes:** `/app/quizzes/new`, `/app/quizzes/:id/edit`

Focus shell with title, unsaved state, and «Сохранить».

Module title and optional description. Left column: ordered question list with numbers, short question snippets, type labels, selected state, and add question action. Main pane: selected question editor.

Question editor includes question text, type selector, and appropriate fields:

1. **Single choice:** four editable answer choices and one correct-answer radio selection. Do not invent automatic distractor generation.
2. **Text answer:** reference answer field with concise helper text explaining the comparison rules without adding a new settings system.
3. **Matching:** editable term/definition pairs, add/remove pair.
4. **Ordering:** editable items listed in their correct order with reorder controls.

Support question creation, selection, reordering, deletion, validation, saving, and unsaved-exit confirmation. Mark incomplete questions in the list with an icon and text, not color alone.

On mobile use a collapsible question navigator rather than squeezing two columns.

### 08 — Flashcard study

**Route:** `/app/flashcards/:id/study`

Minimal focus shell with exit action, module title, and progress.

Center a spacious card with readable question text and a small «Вопрос» label. Initial action: «Показать ответ».

After revealing, show the answer clearly and enable:

- «Не знал» — neutral secondary style.
- «Знал» — primary style.

Do not expose self-assessment before the answer is revealed. Unknown cards return to the queue. Label progress so that repetition does not misleadingly imply a fixed number of total presentations. Distinguish initial cards from cards awaiting repeat where useful.

Allow keyboard actions with unobtrusive hints on desktop. No mascot, unrelated metrics, timer, or quiz-score treatment.

Exiting an active session requires a clear confirmation explaining any prototype session loss.

### 09 — Flashcard study summary

**Route:** `/app/flashcards/:id/summary`

Centered completion view, restrained static illustration, title «Занятие завершено».

Show:

- Unique cards studied.
- Cards known on first attempt.
- Cards that required repetition.

Use coherent data, e.g. 20 unique cards, 14 known on first attempt, 6 requiring repetition. Do not count repeated presentations as extra unique cards.

Actions: «Повторить занятие» and «К моим модулям».

This is self-assessment, not an objective exam grade. Do not present a misleading quiz accuracy score.

### 10 — Quiz taking

**Route:** `/app/quizzes/:id/take`

Focus shell: exit, quiz title, «Вопрос 4 из 12», progress bar.

Main content: question, concise type instruction, response area, and previous/next navigation. Preserve responses when navigating.

Types:

- Single choice: large selectable option rows with clear labels and selected state.
- Text: labeled input.
- Matching: understandable two-column pairing, with tap/click and keyboard alternatives to dragging.
- Ordering: reorderable list with explicit up/down controls.

Do not reveal correctness before final submission. No timer for ordinary quizzes.

Final «Завершить квиз» opens confirmation with unanswered question count. Allow returning to incomplete questions. Include an exit confirmation.

### 11 — Quiz result

**Route:** `/app/quizzes/:id/results/:attemptId`

Top summary: module title, primary percentage, and correct-answer count. Example: 9 correct out of 12 = 75%.

Actions: «Пройти ещё раз» and «К модулям».

Below: review list with «Все вопросы» and «Ошибки» filters.

Each review item shows question text, the user's answer, correct answer, and a textual/icon status. Provide suitable review layouts for matching and ordering, not only single choice. Unanswered questions must be explicitly marked.

Use supportive language; no humiliating copy, huge red backgrounds, or meaningless celebration for every score.

### 12 — Statistics

**Route:** `/app/statistics`

Application shell. Heading «Статистика», module filter, period filter.

Compact totals:

- Unique cards studied, with clearly defined counting semantics.
- Completed quizzes.
- Average quiz result.

Main content:

- Quiz result trend over time.
- Readable session history with date, module, module type, and appropriate result.
- Links to saved quiz results when present.

Do not combine flashcard self-assessment and quiz accuracy into one metric. Average quiz results must clearly state their basis. If distinct-card tracking is unavailable, label the metric as total card reviews instead of claiming unique cards.

No fake chart when there is insufficient data: use a clear first-use or insufficient-data state. No heatmap, streaks, rankings, or advanced weak-point analytics.

### 13 — Profile

**Route:** `/app/profile`

Application shell with a readable, not excessively wide settings layout.

- Initials avatar and username.
- Account details form: username and email.
- Separate password change form.
- Compact learning summary.
- Logout action.

Each form has its own save button and local success/error feedback. Do not create a public social profile.

For Google-created accounts, show an appropriate provider-connected state and avoid requiring a nonexistent current password. Do not invent account-linking or unlinking workflows.

### 14 — Admin overview

**Route:** `/admin`

Use the same design system with a denser, more restrained admin shell.

Admin navigation: «Обзор», «Пользователи», «Модули», «Вернуться в приложение».

Metrics:

- Users.
- Blocked users.
- Modules.
- Module split between flashcards and quizzes.

Below: compact recent-user and recent-module lists with links to the corresponding admin screens.

No financial dashboard, infrastructure monitoring, invented revenue, or decorative mascot.

### 15 — Admin users

**Route:** `/admin/users`

Header «Пользователи». Search, status filter, paginated table.

Columns: username, email, role, status, actions.

Actions: inspect a read-only user summary and block/unblock. The summary may be a side panel; do not add an unnecessary top-level screen.

Confirmation names the actual user and clearly states the action. Update status in the prototype after confirmation.

Include loading, empty search, local errors, and blocked/active badges with text. Do not add user deletion or role editing.

### 16 — Admin modules

**Route:** `/admin/modules`

Search, type filter, paginated table.

Columns: title, owner, type, item count, actions.

Read-only content preview in a side panel or same-screen state. Support both flashcards and the four quiz question types.

Deletion requires confirmation naming the module and explaining that it is destructive. Update the list after approval in the prototype.

No arbitrary editing of another user's content.

### 17 — 404

**Route:** any unmatched route

A simple standalone composition with large «404», heading «Эта страница потерялась», brief copy, restrained static illustration, primary «На главную», and secondary «Назад».

«На главную» goes to the landing page for guests and the dashboard for authenticated users. Back navigation needs a sensible fallback when no previous page exists.

### 18 — Error screen

**Route:** `/error` for demonstration; also usable as a route-level error state.

Heading «Не удалось загрузить страницу», concise explanation, primary «Попробовать снова», secondary «На главную».

Optional compact error reference; no raw stack traces or sensitive details. Distinguish this visual from 404.

Do not replace the entire application for a small widget failure. Use inline error states inside tables, charts, and forms where appropriate.

## 8. Demo content and consistency

Use realistic Russian learning content, not lorem ipsum. Suggested modules:

- «Основы JavaScript» — flashcards.
- «HTTP и веб-технологии» — quiz.
- «Термины баз данных» — flashcards.
- «Основы криптографии» — quiz.

Populate enough varied content to demonstrate wrapping, multiple card lengths, empty descriptions, selected states, and all question types. Avoid filling every module with the same title or repeated placeholder copy.

Keep module names, item counts, session results, and history consistent across screens. A quiz result must correspond to the answers in its review. Progress and percentages must be mathematically coherent.

## 9. Prototype behavior and implementation constraints

If producing code, use React, React Router, Tailwind, and shadcn/ui-compatible components, consistent with the existing frontend. Customize the visual language; do not leave the result looking like untouched component-library defaults.

Use local mock data and client-side state where backend integration is unavailable. Do not require real API keys, credentials, external services, or a functioning backend to explore the prototype.

Implement meaningful navigation and local interactions:

- Authentication demo → dashboard.
- Module creation type selection → correct editor.
- Add, edit, reorder, remove, validate, and save demo content.
- Start and complete flashcard study.
- Answer different quiz types and view a coherent result.
- Search/filter libraries and admin lists.
- Edit local profile data.
- Confirm block/unblock and module deletion in mock data.
- Exercise loading, empty, and error states.

Google authentication and recovery email sending must not pretend to contact a real service. Use clearly identified prototype feedback where these external actions cannot actually run.

Ensure every main route can be opened directly without crashing. Keep any developer-only screen/state navigation unobtrusive and separate from the product's normal navigation. Admin demo access must not be mistaken for real authorization security.

## 10. Build order and completion checklist

Establish the shared design tokens, shells, and reusable components first. Then implement the dashboard and editors, learning flows and results, public/authentication pages, statistics/profile, admin screens, and system states. Maintain the same visual language throughout.

Do not stop after a polished landing page or a single dashboard. Complete all 18 screen families and their essential transitions.

Before finishing, verify:

- All visible copy is natural Russian.
- All 18 screen families exist and can be reached or directly opened.
- Flashcards and quizzes remain distinct in editing, learning, and results.
- Four quiz question types are represented.
- Blue is primary, purple secondary, and yellow restrained.
- No arbitrary animal mascot has been invented.
- No out-of-scope features or fake business claims were added.
- Empty, loading, validation, success, and error states are intentionally designed.
- Destructive actions and unsaved exits require confirmation.
- Desktop and mobile layouts are genuinely usable.
- Keyboard focus, contrast, labels, and non-color status indicators are present.
- There are no dead primary buttons, broken images, or inconsistent demo totals.

The final experience should feel like one thoughtfully designed learning product: expressive enough to remember, calm enough to study in, and practical enough to implement in the existing project.
