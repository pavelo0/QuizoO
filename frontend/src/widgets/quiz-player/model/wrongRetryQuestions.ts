import { normalizeModuleQuestion } from '@/entities/module';
import type { ModuleQuestion, QuizSessionDetail } from '@/entities/module';

export function questionsForWrongRetry(
  session: Pick<QuizSessionDetail, 'answers'>,
): ModuleQuestion[] {
  return session.answers
    .filter((answer) => !answer.isCorrect)
    .map((answer) => hideAnswerKey(normalizeModuleQuestion(answer.question)));
}

function hideAnswerKey(question: ModuleQuestion): ModuleQuestion {
  if (question.type === 'ORDERING') {
    return {
      ...question,
      orderingItems: question.orderingItems.map((item) => ({
        id: item.id,
        text: item.text,
      })),
    };
  }
  if (question.type === 'FILL_BLANK') {
    return {
      ...question,
      fillBlanks: [...question.fillBlanks]
        .sort((left, right) => left.blankIndex - right.blankIndex)
        .map((blank) => ({
          id: blank.id,
          blankIndex: blank.blankIndex,
          answer: '',
          acceptedVariants: [],
        })),
    };
  }
  return question;
}
