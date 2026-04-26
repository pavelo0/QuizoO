import { createModule } from '@/lib/api/modules';
import type { ModuleId } from '@/types/module';

let inflight: Promise<ModuleId> | null = null;

/**
 * Создаёт «черновик» модуля с флешкарточками. Несколько одновременных вызовов
 * (в т.ч. React StrictMode) сходят к одному запросу.
 */
export function getOrCreateFlashcardDraftId(): Promise<ModuleId> {
  if (!inflight) {
    inflight = createModule({ title: 'New module', type: 'FLASHCARD' })
      .then((m) => m.id)
      .catch((e) => {
        inflight = null;
        throw e;
      });
  }
  return inflight;
}

export function clearFlashcardDraftInflight() {
  inflight = null;
}
