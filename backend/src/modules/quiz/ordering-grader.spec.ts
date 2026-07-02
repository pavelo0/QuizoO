import { gradeOrderingAnswer } from './ordering-grader';

describe('gradeOrderingAnswer', () => {
  describe('strict matching (default)', () => {
    it('засчитывает правильный порядок', () => {
      const result = gradeOrderingAnswer(
        ['id1', 'id2', 'id3'],
        ['id1', 'id2', 'id3'],
      );

      expect(result.isCorrect).toBe(true);
      expect(result.strictMatch).toBe(true);
      expect(result.partialScore).toBeUndefined();
    });

    it('отклоняет неправильный порядок', () => {
      const result = gradeOrderingAnswer(
        ['id2', 'id1', 'id3'],
        ['id1', 'id2', 'id3'],
      );

      expect(result.isCorrect).toBe(false);
      expect(result.strictMatch).toBe(false);
    });

    it('отклоняет частично правильный порядок', () => {
      const result = gradeOrderingAnswer(
        ['id1', 'id3', 'id2'],
        ['id1', 'id2', 'id3'],
      );

      expect(result.isCorrect).toBe(false);
      expect(result.strictMatch).toBe(false);
    });

    it('отклоняет полностью перевернутый порядок', () => {
      const result = gradeOrderingAnswer(
        ['id3', 'id2', 'id1'],
        ['id1', 'id2', 'id3'],
      );

      expect(result.isCorrect).toBe(false);
      expect(result.strictMatch).toBe(false);
    });
  });

  describe('validation', () => {
    it('отклоняет неполный ответ (меньше элементов)', () => {
      const result = gradeOrderingAnswer(['id1', 'id2'], ['id1', 'id2', 'id3']);

      expect(result.isCorrect).toBe(false);
      expect(result.strictMatch).toBe(false);
    });

    it('отклоняет ответ с лишними элементами', () => {
      const result = gradeOrderingAnswer(
        ['id1', 'id2', 'id3', 'id4'],
        ['id1', 'id2', 'id3'],
      );

      expect(result.isCorrect).toBe(false);
      expect(result.strictMatch).toBe(false);
    });

    it('обрабатывает пустые массивы', () => {
      const result = gradeOrderingAnswer([], []);

      expect(result.isCorrect).toBe(true);
      expect(result.strictMatch).toBe(true);
    });
  });

  describe('partial credit (опционально)', () => {
    it('вычисляет частичный балл для частично правильного ответа', () => {
      const result = gradeOrderingAnswer(
        ['id1', 'id3', 'id2'],
        ['id1', 'id2', 'id3'],
        true, // allowPartialCredit
      );

      expect(result.isCorrect).toBe(false);
      expect(result.partialScore).toBeCloseTo(0.33, 1); // 1 из 3 правильно
    });

    it('дает 0 баллов за полностью неправильный порядок', () => {
      const result = gradeOrderingAnswer(
        ['id3', 'id1', 'id2'],
        ['id1', 'id2', 'id3'],
        true,
      );

      expect(result.isCorrect).toBe(false);
      expect(result.partialScore).toBe(0);
    });

    it('дает 1.0 балл за правильный порядок', () => {
      const result = gradeOrderingAnswer(
        ['id1', 'id2', 'id3'],
        ['id1', 'id2', 'id3'],
        true,
      );

      expect(result.isCorrect).toBe(true);
      expect(result.partialScore).toBe(1.0);
    });

    it('вычисляет частичный балл для 2 из 4 правильных', () => {
      const result = gradeOrderingAnswer(
        ['id1', 'id3', 'id2', 'id4'],
        ['id1', 'id2', 'id3', 'id4'],
        true,
      );

      expect(result.isCorrect).toBe(false);
      expect(result.partialScore).toBe(0.5); // 2 из 4
    });

    it('не вычисляет частичный балл если allowPartialCredit=false', () => {
      const result = gradeOrderingAnswer(
        ['id1', 'id3', 'id2'],
        ['id1', 'id2', 'id3'],
        false,
      );

      expect(result.partialScore).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('обрабатывает один элемент', () => {
      const result = gradeOrderingAnswer(['id1'], ['id1']);

      expect(result.isCorrect).toBe(true);
    });

    it('обрабатывает два элемента в правильном порядке', () => {
      const result = gradeOrderingAnswer(['id1', 'id2'], ['id1', 'id2']);

      expect(result.isCorrect).toBe(true);
    });

    it('обрабатывает два элемента в неправильном порядке', () => {
      const result = gradeOrderingAnswer(['id2', 'id1'], ['id1', 'id2']);

      expect(result.isCorrect).toBe(false);
    });

    it('сохраняет исходные массивы в результате', () => {
      const userOrder = ['id2', 'id1', 'id3'];
      const correctOrder = ['id1', 'id2', 'id3'];
      const result = gradeOrderingAnswer(userOrder, correctOrder);

      expect(result.userOrder).toEqual(userOrder);
      expect(result.correctOrder).toEqual(correctOrder);
    });
  });
});
