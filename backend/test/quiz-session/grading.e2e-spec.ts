import { registerVerifiedUser } from '../support/auth';
import { useApiApp } from '../support/hooks';

type Option = { id: string; text: string; isCorrect: boolean };
type Pair = { id: string };
type OrderingItem = { id: string; correctOrder: number };
type QuestionBody = {
  id: string;
  questionOptions: Option[];
  matchingPairs: Pair[];
  orderingItems: OrderingItem[];
};

describe('quiz-session', () => {
  const api = useApiApp();

  it('оценивает CHOICE, TEXT, MATCHING и ORDERING и сохраняет разбор', async () => {
    const user = await registerVerifiedUser(api.getApp());
    const created = await user.agent
      .post('/api/modules')
      .send({ title: 'Exam', type: 'QUIZ' })
      .expect(201);
    const moduleId = created.body.id as string;
    const questionsPath = `/api/modules/${moduleId}/questions`;

    const choice = (
      await user.agent.post(questionsPath).send({
        questionText: 'Один',
        type: 'CHOICE',
        options: [
          { text: 'Верный', isCorrect: true },
          { text: 'Лишний', isCorrect: false },
        ],
      })
    ).body as QuestionBody;

    const multi = (
      await user.agent.post(questionsPath).send({
        questionText: 'Несколько',
        type: 'CHOICE',
        allowMultipleAnswers: true,
        options: [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: true },
          { text: 'C', isCorrect: false },
        ],
      })
    ).body as QuestionBody;

    const text = (
      await user.agent.post(questionsPath).send({
        questionText: 'Город',
        type: 'TEXT',
        options: [{ text: 'Минск', isCorrect: true }],
        acceptedVariants: ['Minsk'],
      })
    ).body as QuestionBody;

    const matching = (
      await user.agent.post(questionsPath).send({
        questionText: 'Пары',
        type: 'MATCHING',
        matchingPairs: [
          { leftItem: 'H2O', rightItem: 'Вода' },
          { leftItem: 'NaCl', rightItem: 'Соль' },
        ],
      })
    ).body as QuestionBody;

    const ordering = (
      await user.agent.post(questionsPath).send({
        questionText: 'Хронология',
        type: 'ORDERING',
        orderingItems: [
          { text: 'Сначала', correctOrder: 0 },
          { text: 'Потом', correctOrder: 1 },
          { text: 'В конце', correctOrder: 2 },
        ],
      })
    ).body as QuestionBody;

    const correctChoice = choice.questionOptions.find(
      (option) => option.isCorrect,
    );
    const wrongChoice = choice.questionOptions.find(
      (option) => !option.isCorrect,
    );
    const correctMulti = multi.questionOptions
      .filter((option) => option.isCorrect)
      .map((option) => option.id);
    const ordered = [...ordering.orderingItems].sort(
      (left, right) => left.correctOrder - right.correctOrder,
    );
    const matchingAnswer = Object.fromEntries(
      matching.matchingPairs.map((pair) => [pair.id, pair.id]),
    );

    if (!correctChoice || !wrongChoice) {
      throw new Error('Choice options were not created');
    }

    const other = await user.agent
      .post('/api/modules')
      .send({ title: 'Other exam', type: 'QUIZ' })
      .expect(201);
    const foreign = (
      await user.agent.post(`/api/modules/${other.body.id}/questions`).send({
        questionText: 'Чужой',
        type: 'CHOICE',
        options: [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: false },
        ],
      })
    ).body as QuestionBody;
    const foreignOption = foreign.questionOptions[0];

    await user.agent
      .post(`/api/modules/${moduleId}/quiz-sessions`)
      .send({
        answers: [{ questionId: choice.id, choiceOptionId: foreignOption?.id }],
      })
      .expect(400);

    const passed = await user.agent
      .post(`/api/modules/${moduleId}/quiz-sessions`)
      .send({
        answers: [
          { questionId: choice.id, choiceOptionId: correctChoice.id },
          { questionId: multi.id, choiceOptionIds: correctMulti },
          { questionId: text.id, textAnswer: '  MINSK ' },
          { questionId: matching.id, matchingAnswer },
          {
            questionId: ordering.id,
            orderingAnswer: ordered.map((item) => item.id),
          },
        ],
      })
      .expect(201);

    expect(passed.body).toMatchObject({
      totalQuestions: 5,
      correctCount: 5,
      scorePercent: 100,
    });
    const passedAnswers = passed.body.answers as Array<{
      questionId: string;
      isCorrect: boolean;
      userAnswer: { textAnswer?: string } | null;
      question: { questionOptions: Option[] };
    }>;
    expect(passedAnswers.every((answer) => answer.isCorrect)).toBe(true);
    const textReview = passedAnswers.find(
      (answer) => answer.questionId === text.id,
    );
    expect(textReview?.userAnswer).toMatchObject({ textAnswer: 'minsk' });
    expect(textReview?.question.questionOptions[0]?.text).toBe('Минск');

    const failed = await user.agent
      .post(`/api/modules/${moduleId}/quiz-sessions`)
      .send({
        answers: [
          { questionId: choice.id, choiceOptionId: wrongChoice.id },
          { questionId: multi.id, choiceOptionIds: [correctMulti[0]] },
          { questionId: text.id, textAnswer: 'Брест' },
          {
            questionId: matching.id,
            matchingAnswer: {
              [matching.matchingPairs[0].id]: matching.matchingPairs[1].id,
              [matching.matchingPairs[1].id]: matching.matchingPairs[0].id,
            },
          },
          {
            questionId: ordering.id,
            orderingAnswer: [...ordered].reverse().map((item) => item.id),
          },
        ],
      })
      .expect(201);

    expect(failed.body).toMatchObject({ correctCount: 0, scorePercent: 0 });
    const failedAnswers = failed.body.answers as Array<{ isCorrect: boolean }>;
    expect(failedAnswers.every((answer) => answer.isCorrect === false)).toBe(
      true,
    );

    const loaded = await user.agent
      .get(`/api/modules/${moduleId}/quiz-sessions/${failed.body.id}`)
      .expect(200);
    expect(loaded.body.answers).toHaveLength(5);
    expect(
      (loaded.body.answers as Array<{ isCorrect: boolean }>).every(
        (answer) => answer.isCorrect === false,
      ),
    ).toBe(true);
  });
});
