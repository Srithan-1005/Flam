import { AnimatePresence } from 'framer-motion';
import QuizQuestion from './QuizQuestion';
import QuizResult from './QuizResult';
import ProgressBar from './ProgressBar';

export default function Quiz({
  questions,
  currentQuestion,
  selectedAnswer,
  showExplanation,
  quizSubmitted,
  score,
  wrongCount,
  onSelect,
  onSubmit,
  onNext,
  onRetake,
  onRetestWrong,
  isRetesting,
}) {
  const total = questions.length;
  const isPerfect = quizSubmitted && wrongCount === 0;

  if (quizSubmitted) {
    return (
      <QuizResult
        score={score}
        total={total}
        wrongCount={wrongCount}
        onRetake={onRetake}
        onRetestWrong={onRetestWrong}
        isPerfect={isPerfect}
      />
    );
  }

  const question = questions[currentQuestion];
  if (!question) return null;

  return (
    <div className="quiz">
      {isRetesting && (
        <div className="quiz-retest-badge">Retesting missed questions</div>
      )}

      <ProgressBar
        current={currentQuestion}
        total={total}
        label={`Question ${currentQuestion + 1} of ${total}`}
      />

      <AnimatePresence mode="wait">
        <QuizQuestion
          key={`${question.id}-${currentQuestion}`}
          question={question}
          questionNumber={currentQuestion + 1}
          totalQuestions={total}
          selectedAnswer={selectedAnswer}
          showExplanation={showExplanation}
          onSelect={onSelect}
          onSubmit={onSubmit}
          onNext={onNext}
          isLast={currentQuestion === total - 1}
        />
      </AnimatePresence>
    </div>
  );
}
