import type {
  ModuleCard,
  ModuleDetail,
  ModuleListItem,
  ModuleQuestion,
  ModuleType,
} from '@/entities/module';

const stamp = '2026-01-01T00:00:00.000Z';

export function moduleListItem(
  partial: Partial<ModuleListItem> &
    Pick<ModuleListItem, 'id' | 'title' | 'type'>,
): ModuleListItem {
  return {
    description: null,
    createdAt: stamp,
    updatedAt: stamp,
    cardCount: 0,
    questionCount: 0,
    lastStudiedAt: null,
    ...partial,
  };
}

export function moduleCard(
  partial: Partial<ModuleCard> & Pick<ModuleCard, 'id' | 'question' | 'answer'>,
): ModuleCard {
  return {
    moduleId: 'mod-1',
    orderIndex: 0,
    createdAt: stamp,
    ...partial,
  };
}

export function moduleQuestion(
  partial: Partial<ModuleQuestion> &
    Pick<ModuleQuestion, 'id' | 'questionText' | 'type'>,
): ModuleQuestion {
  return {
    moduleId: 'mod-1',
    allowMultipleAnswers: false,
    questionImageMime: null,
    orderIndex: 0,
    points: 1,
    createdAt: stamp,
    questionOptions: [],
    matchingPairs: [],
    orderingItems: [],
    fillBlanks: [],
    ...partial,
  };
}

export function moduleDetail(
  type: ModuleType,
  extra: Partial<ModuleDetail> = {},
): ModuleDetail {
  return {
    id: 'mod-1',
    userId: 'user-1',
    title: type === 'FLASHCARD' ? 'Biology cards' : 'Biology quiz',
    description: null,
    type,
    customScoring: false,
    createdAt: stamp,
    updatedAt: stamp,
    cardCount: extra.cards?.length ?? 0,
    questionCount: extra.questions?.length ?? 0,
    cards: [],
    questions: [],
    ...extra,
  };
}
