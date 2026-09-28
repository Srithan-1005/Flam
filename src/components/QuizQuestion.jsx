import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  showExplanation,
  onSelect,
  onSubmit,
  onNext,
  isLast,
}) {
  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <motion.div
      className="quiz-question"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      <div className="quiz-question-header">
        <span className="quiz-question-number">
          Question {questionNumber} of {totalQuestions}
        </span>
      </div>

      <h3 className="quiz-question-text">{question.question}</h3>

      <div className="quiz-options">
        {question.options.map((option, i) => {
          let optionClass = 'quiz-option';
          if (showExplanation) {
            if (i === question.correctAnswer) optionClass += ' quiz-option--correct';
            else if (i === selectedAnswer && !isCorrect) optionClass += ' quiz-option--wrong';
          } else if (i === selectedAnswer) {
            optionClass += ' quiz-option--selected';
          }

          return (
            <button
              key={i}
              className={optionClass}
              onClick={() => !showExplanation && onSelect(i)}
              disabled={showExplanation}
              aria-label={`Option ${i + 1}: ${option}`}
            >
              <span className="quiz-option-letter">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="quiz-option-text">{option}</span>
              {showExplanation && i === question.correctAnswer && <CheckCircle2 size={18} className="quiz-option-icon correct" />}
              {showExplanation && i === selectedAnswer && !isCorrect && i !== question.correctAnswer && <XCircle size={18} className="quiz-option-icon wrong" />}
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <motion.div
          className={`quiz-explanation ${isCorrect ? 'quiz-explanation--correct' : 'quiz-explanation--wrong'}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="quiz-explanation-title">
            {isCorrect ? (
              <><CheckCircle2 size={16} /> Correct!</>
            ) : (
              <><XCircle size={16} /> Not quite.</>
            )}
          </p>
          <p className="quiz-explanation-text">{question.explanation}</p>
        </motion.div>
      )}

      <div className="quiz-actions">
        {!showExplanation ? (
          <button
            className="btn btn-primary"
            disabled={selectedAnswer === null}
            onClick={onSubmit}
          >
            Submit Answer
          </button>
        ) : (
          <button className="btn btn-primary" onClick={onNext}>
            {isLast ? 'See Results' : 'Next Question'}
          </button>
        )}
      </div>
    </motion.div>
  );
}
