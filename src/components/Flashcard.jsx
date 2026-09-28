import { motion } from 'framer-motion';

export default function Flashcard({ card, flipped, onFlip }) {
  return (
    <div className="flashcard-container" onClick={onFlip} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onFlip(); } }}
      aria-label={flipped ? 'Showing answer, click to flip back' : 'Showing question, click to flip'}
    >
      <motion.div
        className="flashcard-inner"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 25 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div className="flashcard-face flashcard-front">
          <span className="flashcard-label">QUESTION</span>
          <p className="flashcard-text">{card.question}</p>
          <span className="flashcard-hint">Click to reveal answer</span>
        </div>

        {/* Back */}
        <div className="flashcard-face flashcard-back">
          <span className="flashcard-label">ANSWER</span>
          <p className="flashcard-text">{card.answer}</p>
          <span className="flashcard-hint">Click to see question</span>
        </div>
      </motion.div>
    </div>
  );
}
