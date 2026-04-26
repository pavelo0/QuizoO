import { createModule } from '@/lib/api/modules';
import type { ModuleId } from '@/types/module';

let inflight: Promise<ModuleId> | null = null;

/**
 * Создает черновик quiz-модуля. Параллельные вызовы схлопываются в один запрос.
 */
export function getOrCreateQuizDraftId(): Promise<ModuleId> {
  if (!inflight) {
    inflight = createModule({ title: 'New quiz module', type: 'QUIZ' })
      .then((m) => m.id)
      .catch((e) => {
        inflight = null;
        throw e;
      });
  }
  return inflight;
}

export function clearQuizDraftInflight() {
  inflight = null;
}
