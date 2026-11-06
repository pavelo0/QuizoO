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
      fillBlanks: undefined,
    } as unknown as ModuleQuestion);
    expect(question.questionOptions).toEqual([]);
    expect(question.matchingPairs).toEqual([]);
    expect(question.orderingItems).toEqual([]);
    expect(question.fillBlanks).toEqual([]);
    expect(question.points).toBe(1);

    const detail = normalizeModuleDetail({
      id: 'm1',
      questions: undefined,
    } as unknown as ModuleDetail);
    expect(detail.questions).toEqual([]);
    expect(detail.customScoring).toBe(false);
  });

  it('оставляет валидные баллы и флаг шкалы', () => {
    const question = normalizeModuleQuestion({
      id: 'q1',
      type: 'TEXT',
      points: 4,
      questionOptions: [],
      matchingPairs: [],
      orderingItems: [],
      fillBlanks: [],
    } as unknown as ModuleQuestion);
    expect(question.points).toBe(4);

    expect(
      normalizeModuleQuestion({
        id: 'q2',
        type: 'TEXT',
        points: 0,
      } as unknown as ModuleQuestion).points,
    ).toBe(1);
    expect(
      normalizeModuleQuestion({
        id: 'q3',
        type: 'TEXT',
        points: 1.5,
      } as unknown as ModuleQuestion).points,
    ).toBe(1);

    const detail = normalizeModuleDetail({
      id: 'm1',
      customScoring: true,
      questions: [],
    } as unknown as ModuleDetail);
    expect(detail.customScoring).toBe(true);
  });
});
