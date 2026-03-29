import fs from 'node:fs';
import path from 'node:path';

const repo = process.cwd();

/**
 * Абсолютный путь к файлу. lint-staged обычно даёт пути относительно корня репозитория.
 * Не использовать path.join(repo, f): если f уже содержит «хвост» пути без ведущего /,
 * получится дублирование вроде .../QuizOo/Users/.../QuizOo/package.json.
 */
function absFromRepo(f) {
  if (path.isAbsolute(f)) return f;
  const resolved = path.resolve(repo, f);
  if (fs.existsSync(resolved)) return resolved;
  const fallback = path.join(repo, path.basename(f));
  if (fs.existsSync(fallback)) return fallback;
  return resolved;
}

function relForWorkspace(workspace, files) {
  const base = path.join(repo, workspace);
  return files
    .map((f) => path.relative(base, absFromRepo(f)))
    .join(' ');
}

function quoteForShell(files) {
  // JSON.stringify — безопасное экранирование для shell; Prettier принимает относительный путь от cwd (= корень репо)
  return files.map((f) => JSON.stringify(absFromRepo(f))).join(' ');
}

/** @type {import('lint-staged').Configuration} */
export default {
  'frontend/**/*.{ts,tsx}': (files) => {
    if (!files.length) return [];
    return [
      `cd frontend && npx eslint --max-warnings 0 --fix ${relForWorkspace('frontend', files)}`,
      `npx prettier --write ${quoteForShell(files)}`,
    ];
  },
  'backend/**/*.{ts,tsx}': (files) => {
    if (!files.length) return [];
    return [
      `cd backend && npx eslint --max-warnings 0 --fix ${relForWorkspace('backend', files)}`,
      `npx prettier --write ${quoteForShell(files)}`,
    ];
  },
  '**/*.{js,jsx,json,css,md}': (files) => {
    if (!files.length) return [];
    return `npx prettier --write ${quoteForShell(files)}`;
  },
};
