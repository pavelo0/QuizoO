# Документация QuizoO

Вся проектная документация собрана в этой папке. Раньше часть файлов лежала в `ProjectInfo/` — содержимое перенесено сюда, дубликаты сведены: актуальный чеклист в [`checklist.md`](./checklist.md), устаревшие варианты — в [`archive/`](./archive/).

## Быстрый старт

| Документ                                           | Описание                                                                        |
| -------------------------------------------------- | ------------------------------------------------------------------------------- |
| [`docker-stack-guide.md`](./docker-stack-guide.md) | Что за контейнеры в Docker Desktop, что коммитить, что делать после `git clone` |
| [`docker-and-deploy.md`](./docker-and-deploy.md)   | Детальная шпаргалка: Dockerfile, Nginx, деплой (Vercel/Render/VPS)              |

## Архитектура и ТЗ

| Документ                                                                                   | Описание                                                                                                 |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| [`architecture.md`](./architecture.md)                                                     | Краткая схема стека (Compose, Nginx, React, NestJS, Postgres)                                            |
| [`project-overview.md`](./project-overview.md)                                             | Описание продукта, роли, сущности, режимы обучения                                                       |
| [`requirements-and-diagrams.md`](./requirements-and-diagrams.md)                           | Функциональные требования, ER, use case                                                                  |
| [`zapiska-assignment-excerpt.md`](./zapiska-assignment-excerpt.md)                         | Выдержка формулировок задания (п. 2.1–2.2)                                                               |
| [`archive/architecture-coursework-legacy.md`](./archive/architecture-coursework-legacy.md) | Раннее ТЗ с примерами кода; **актуальная инфраструктура** — в `docker-stack-guide` / `docker-and-deploy` |

## Разработка

| Документ                                                                     | Описание                                                  |
| ---------------------------------------------------------------------------- | --------------------------------------------------------- |
| [`checklist.md`](./checklist.md)                                             | Основной чеклист прогресса (обновляемый)                  |
| [`archive/checklist-legacy-stages.md`](./archive/checklist-legacy-stages.md) | Ранняя нумерация этапов курсовой/диплома с пометкой `(*)` |
| [`techDesign.md`](./techDesign.md)                                           | Техдизайн UI, токены, связь со Stitch                     |
| [`stitch-prompts.md`](./stitch-prompts.md)                                   | Промпты для макетов/атмосферы                             |
| [`frontend-setup-from-step4.md`](./frontend-setup-from-step4.md)             | Пошаговый гайд по фронту                                  |
| [`authentication.md`](./authentication.md)                                   | Аутентификация                                            |
| [`dbSchema.md`](./dbSchema.md)                                               | Схема БД                                                  |
| [`interfacesSysDesign.md`](./interfacesSysDesign.md)                         | Интерфейсы и проектирование                               |
| [`course.md`](./course.md)                                                   | Контекст курса                                            |

## Диаграммы

Файлы `.drawio` и экспортированные `.png`: `architecture`, `database`, `use-case`.
