import { motion } from 'framer-motion';
import { Trophy, RefreshCw, RotateCcw, Star } from 'lucide-react';

export default function QuizResult({
  score,
  total,
  wrongCount,
  onRetake,
  onRetestWrong,
  isPerfect,
}) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  let grade = 'Keep practicing!';
  if (pct === 100) grade = 'Perfect score!';
  else if (pct >= 80) grade = 'Great work!';
  else if (pct >= 60) grade = 'Good effort!';

  return (
    <motion.div
      className="quiz-result"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="quiz-result-icon">
        {isPerfect ? <Star size={40} /> : <Trophy size={40} />}
      </div>

      <h2 className="quiz-result-title">Quiz Complete</h2>

      <div className="quiz-result-score">
        <motion.span
          className="quiz-result-number"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {score} / {total}
        </motion.span>
        <span className="quiz-result-pct">{pct}%</span>
      </div>

      <p className="quiz-result-grade">{grade}</p>

      {isPerfect && (
        <p className="quiz-result-perfect">
          You got every question correct. 🎉
        </p>
      )}

      <div className="quiz-result-actions">
        {wrongCount > 0 && (
          <button className="btn btn-primary" onClick={onRetestWrong}>
            <RotateCcw size={16} />
            <span>Retry {wrongCount} missed question{wrongCount > 1 ? 's' : ''}</span>
          </button>
        )}
        <button className="btn btn-ghost" onClick={onRetake}>
          <RefreshCw size={16} />
          <span>Retake full quiz</span>
        </button>
      </div>
    </motion.div>
  );
}
