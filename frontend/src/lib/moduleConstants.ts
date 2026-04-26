/**
 * Практический лимит длины названия модуля на фронте (согласован с формой создания и поиском).
 * В Prisma поле `title` без жёсткого VARCHAR — ограничение нужно для UX и согласованности API.
 */
export const MAX_MODULE_TITLE_LENGTH = 200;

/** Лимит карточек в модуле с флешкарточками (UX). */
export const MAX_FLASHCARDS_PER_MODULE = 10;
