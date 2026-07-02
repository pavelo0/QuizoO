export type OrderingGradeResult = {
  isCorrect: boolean;
  correctOrder: string[];
  userOrder: string[];
  strictMatch: boolean;
  partialScore?: number;
};

/**
 * Проверяет правильность ответа на ORDERING вопрос.
 *
 * @param userOrder - массив ID элементов в порядке, выбранном пользователем
 * @param correctOrder - массив ID элементов в правильном порядке
 * @param allowPartialCredit - разрешить частичный балл (по умолчанию false)
 * @returns результат проверки с флагом isCorrect и дополнительной информацией
 */
export function gradeOrderingAnswer(
  userOrder: string[],
  correctOrder: string[],
  allowPartialCredit = false,
): OrderingGradeResult {
  // Валидация: длины должны совпадать
  if (userOrder.length !== correctOrder.length) {
    return {
      isCorrect: false,
      correctOrder,
      userOrder,
      strictMatch: false,
    };
  }

  // Проверка полного совпадения (strict match)
  const strictMatch = userOrder.every((id, idx) => id === correctOrder[idx]);

  // Опционально: вычисление частичного балла
  let partialScore: number | undefined;
  if (allowPartialCredit) {
    partialScore = strictMatch
      ? 1
      : calculatePartialScore(userOrder, correctOrder);
  }

  return {
    isCorrect: strictMatch,
    correctOrder,
    userOrder,
    strictMatch,
    partialScore,
  };
}

/**
 * Вычисляет частичный балл за ORDERING ответ.
 * Использует простой подсчет элементов на правильных позициях.
 *
 * @param userOrder - порядок пользователя
 * @param correctOrder - правильный порядок
 * @returns балл от 0 до 1
 */
function calculatePartialScore(
  userOrder: string[],
  correctOrder: string[],
): number {
  if (userOrder.length === 0 || correctOrder.length === 0) {
    return 0;
  }

  let correctPositions = 0;
  for (let i = 0; i < userOrder.length; i++) {
    if (userOrder[i] === correctOrder[i]) {
      correctPositions++;
    }
  }

  return correctPositions / correctOrder.length;
}
