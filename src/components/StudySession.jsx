import { motion } from 'framer-motion';
import { ArrowLeft, Layers, Target, BookOpen, Check, X, BarChart3, RefreshCw, RotateCcw, PlusCircle } from 'lucide-react';
import FlashcardDeck from './FlashcardDeck';
import Quiz from './Quiz';

export default function StudySession({ session }) {
  const {
    studyData,
    activeTab,
    setActiveTab,
    startOver,
    // flashcard
    currentCard,
    flipped,
    knownCards,
    reviewCards,
    flipCard,
    nextCard,
    prevCard,
    markKnown,
    markReview,
    // quiz
    currentQuestion,
    selectedAnswer,
    showExplanation,
    quizSubmitted,
    activeQuestions,
    score,
    wrongAnswerIndices,
    isRetesting,
    selectAnswer,
    submitAnswer,
    nextQuestion,
    retakeQuiz,
    retestWrongAnswers,
  } = session;

  if (!studyData) return null;

  const totalCards = studyData.flashcards.length;
  const totalQuiz = studyData.quiz.length;

  return (
    <motion.div
      className="study-session"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Top bar */}
      <div className="session-header">
        <button className="btn btn-ghost" onClick={startOver}>
          <ArrowLeft size={16} />
          <span>New Study Session</span>
        </button>
      </div>

      {/* Topic + Summary */}
      <div className="session-topic">
        <h2>{studyData.topic}</h2>
        <p className="session-subtitle">AI-generated study session</p>
      </div>

      <div className="session-summary-card">
        <BookOpen size={18} />
        <p>{studyData.summary}</p>
      </div>

      {/* Stats row */}
      <div className="session-stats">
        <div className="stat-pill">
          <Layers size={14} />
          <span>{totalCards} Flashcards</span>
        </div>
        <div className="stat-pill">
          <Target size={14} />
          <span>{totalQuiz} Questions</span>
        </div>
        {knownCards.size > 0 && (
          <div className="stat-pill stat-pill--know">
            <Check size={14} />
            <span>{knownCards.size} Mastered</span>
          </div>
        )}
        {reviewCards.size > 0 && (
          <div className="stat-pill stat-pill--review">
            <X size={14} />
            <span>{reviewCards.size} Review</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs" role="tablist">
        <button
          className={`tab ${activeTab === 'flashcards' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('flashcards')}
          role="tab"
          aria-selected={activeTab === 'flashcards'}
        >
          <Layers size={16} />
          <span>Flashcards</span>
        </button>
        <button
          className={`tab ${activeTab === 'quiz' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('quiz')}
          role="tab"
          aria-selected={activeTab === 'quiz'}
        >
          <Target size={16} />
          <span>Quiz</span>
        </button>
      </div>

      {/* Content */}
      <div className="session-content">
        {activeTab === 'flashcards' && (
          <FlashcardDeck
            flashcards={studyData.flashcards}
            currentCard={currentCard}
            flipped={flipped}
            knownCards={knownCards}
            reviewCards={reviewCards}
            onFlip={flipCard}
            onNext={nextCard}
            onPrev={prevCard}
            onMarkKnown={markKnown}
            onMarkReview={markReview}
          />
        )}

        {activeTab === 'quiz' && (
          <Quiz
            questions={activeQuestions}
            currentQuestion={currentQuestion}
            selectedAnswer={selectedAnswer}
            showExplanation={showExplanation}
            quizSubmitted={quizSubmitted}
            score={score}
            wrongCount={wrongAnswerIndices.length}
            onSelect={selectAnswer}
            onSubmit={submitAnswer}
            onNext={nextQuestion}
            onRetake={retakeQuiz}
            onRetestWrong={retestWrongAnswers}
            isRetesting={isRetesting}
          />
        )}
      </div>
    </motion.div>
  );
}
