import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, X, RotateCcw } from 'lucide-react';
import Flashcard from './Flashcard';
import ProgressBar from './ProgressBar';

export default function FlashcardDeck({
  flashcards,
  currentCard,
  flipped,
  knownCards,
  reviewCards,
  onFlip,
  onNext,
  onPrev,
  onMarkKnown,
  onMarkReview,
}) {
  const card = flashcards[currentCard];
  const total = flashcards.length;
  const isFirst = currentCard === 0;
  const isLast = currentCard === total - 1;

  // Keyboard navigation
  const handleKey = useCallback(
    (e) => {
      if (e.key === 'ArrowRight' && !isLast) onNext();
      if (e.key === 'ArrowLeft' && !isFirst) onPrev();
      if (e.key === ' ') { e.preventDefault(); onFlip(); }
    },
    [isFirst, isLast, onNext, onPrev, onFlip]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const allReviewed = knownCards.size + reviewCards.size === total;

  return (
    <div className="flashcard-deck">
      <ProgressBar current={currentCard} total={total} label={`Card ${currentCard + 1} of ${total}`} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
        >
          <Flashcard card={card} flipped={flipped} onFlip={onFlip} />
        </motion.div>
      </AnimatePresence>

      <div className="flashcard-controls">
        <button className="btn btn-ghost" onClick={onPrev} disabled={isFirst} aria-label="Previous card">
          <ChevronLeft size={18} />
          <span>Previous</span>
        </button>

        <div className="flashcard-mark-btns">
          <button
            className={`btn btn-know ${knownCards.has(card.id) ? 'btn-know--active' : ''}`}
            onClick={() => onMarkKnown(card.id)}
            aria-label="Mark as known"
          >
            <Check size={16} />
            <span>Know this</span>
          </button>
          <button
            className={`btn btn-review ${reviewCards.has(card.id) ? 'btn-review--active' : ''}`}
            onClick={() => onMarkReview(card.id)}
            aria-label="Mark for review"
          >
            <X size={16} />
            <span>Need review</span>
          </button>
        </div>

        <button className="btn btn-ghost" onClick={onNext} disabled={isLast} aria-label="Next card">
          <span>Next</span>
          <ChevronRight size={18} />
        </button>
      </div>

      {allReviewed && (
        <motion.div
          className="flashcard-summary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>{total} cards reviewed</h3>
          <div className="flashcard-summary-stats">
            <span className="stat stat--know">
              <Check size={14} /> {knownCards.size} mastered
            </span>
            <span className="stat stat--review">
              <RotateCcw size={14} /> {reviewCards.size} need review
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
