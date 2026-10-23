import type { ModuleDetail, ModuleQuestion } from '../model/types';
import { describe, expect, it } from 'vitest';
import {
  normalizeActivityPage,
  normalizeModuleDetail,
  normalizeModuleQuestion,
} from './normalize';

describe('normalize module payloads', () => {
  it('заменяет битые массивы пустыми', () => {
    expect(normalizeActivityPage(undefined)).toEqual({
      items: [],
      nextCursor: null,
    });
    expect(
      normalizeActivityPage({
        items: undefined as unknown as [],
        nextCursor: 1 as unknown as string,
      }),
    ).toEqual({ items: [], nextCursor: null });

    const question = normalizeModuleQuestion({
      id: 'q1',
      type: 'CHOICE',
      questionOptions: undefined,
      matchingPairs: undefined,
      orderingItems: undefined,
    } as unknown as ModuleQuestion);
    expect(question.questionOptions).toEqual([]);
    expect(question.matchingPairs).toEqual([]);
    expect(question.orderingItems).toEqual([]);

    const detail = normalizeModuleDetail({
      id: 'm1',
      questions: undefined,
    } as unknown as ModuleDetail);
    expect(detail.questions).toEqual([]);
  });
});
