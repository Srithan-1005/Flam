import { useState, useRef, useCallback } from 'react';
import { generateStudySet } from '../lib/api';
import { validateStudyResult, normalizeStudyResult } from '../lib/validateResult';

/**
 * Central hook that manages the entire study session lifecycle:
 * - input → loading → success/error
 * - stale-request protection via AbortController + requestId
 * - flashcard state (current, flipped, known/review)
 * - quiz state (current question, answers, score, retest)
 */

// Application-level states
const STATUS = {
  EMPTY: 'EMPTY',
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};

export { STATUS };

export function useStudySession() {
  // ── core state ───────────────────────────────────────
  const [status, setStatus] = useState(STATUS.EMPTY);
  const [studyData, setStudyData] = useState(null);
  const [error, setError] = useState('');

  // stale-request protection
  const requestIdRef = useRef(0);
  const abortRef = useRef(null);

  // ── flashcard state ──────────────────────────────────
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState(new Set());
  const [reviewCards, setReviewCards] = useState(new Set());

  // ── quiz state ───────────────────────────────────────
  const [activeTab, setActiveTab] = useState('flashcards');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState({}); // { qIndex: selectedOption }
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // ── retest state ─────────────────────────────────────
  const [isRetesting, setIsRetesting] = useState(false);
  const [retestIndices, setRetestIndices] = useState([]);

  // ── derived quiz helpers ─────────────────────────────
  const quizQuestions = studyData?.quiz || [];
  const activeQuestions = isRetesting
    ? retestIndices.map((i) => quizQuestions[i])
    : quizQuestions;

  const score = Object.entries(answeredQuestions).reduce((acc, [idx, ans]) => {
    const qIndex = Number(idx);
    const question = quizQuestions[qIndex];
    return question && ans === question.correctAnswer ? acc + 1 : acc;
  }, 0);

  const wrongAnswerIndices = Object.entries(answeredQuestions)
    .filter(([idx, ans]) => {
      const question = quizQuestions[Number(idx)];
      return question && ans !== question.correctAnswer;
    })
    .map(([idx]) => Number(idx));

  // ── generate ─────────────────────────────────────────
  const generate = useCallback(async (input) => {
    // Abort previous request if still pending
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const thisRequestId = ++requestIdRef.current;
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus(STATUS.LOADING);
    setError('');
    setStudyData(null);
    resetSession();

    try {
      const raw = await generateStudySet(input, controller.signal);

      // Stale-request guard: only accept the most recent request
      if (thisRequestId !== requestIdRef.current) return;

      const validation = validateStudyResult(raw);
      if (!validation.valid) {
        setError(validation.error);
        setStatus(STATUS.ERROR);
        return;
      }

      const normalized = normalizeStudyResult(validation.data);
      setStudyData(normalized);
      setStatus(STATUS.SUCCESS);
    } catch (err) {
      // Ignore aborted requests
      if (err.name === 'AbortError') return;
      // Stale-request guard
      if (thisRequestId !== requestIdRef.current) return;

      setError(err.message || 'Something went wrong. Please try again.');
      setStatus(STATUS.ERROR);
    }
  }, []);

  // ── reset helpers ────────────────────────────────────
  function resetSession() {
    setCurrentCard(0);
    setFlipped(false);
    setKnownCards(new Set());
    setReviewCards(new Set());
    setActiveTab('flashcards');
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnsweredQuestions({});
    setQuizSubmitted(false);
    setShowExplanation(false);
    setIsRetesting(false);
    setRetestIndices([]);
  }

  const startOver = useCallback(() => {
    setStatus(STATUS.EMPTY);
    setStudyData(null);
    setError('');
    resetSession();
  }, []);

  // ── flashcard actions ────────────────────────────────
  const flipCard = useCallback(() => setFlipped((f) => !f), []);

  const nextCard = useCallback(() => {
    setFlipped(false);
    setCurrentCard((c) => {
      const total = studyData?.flashcards?.length || 1;
      return Math.min(c + 1, total - 1);
    });
  }, [studyData]);

  const prevCard = useCallback(() => {
    setFlipped(false);
    setCurrentCard((c) => Math.max(c - 1, 0));
  }, []);

  const markKnown = useCallback((id) => {
    setKnownCards((s) => new Set(s).add(id));
    setReviewCards((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });
  }, []);

  const markReview = useCallback((id) => {
    setReviewCards((s) => new Set(s).add(id));
    setKnownCards((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });
  }, []);

  // ── quiz actions ─────────────────────────────────────
  const selectAnswer = useCallback((optionIndex) => {
    setSelectedAnswer(optionIndex);
  }, []);

  const submitAnswer = useCallback(() => {
    if (selectedAnswer === null) return;

    // Determine the real index in the original quiz array
    const realIndex = isRetesting
      ? retestIndices[currentQuestion]
      : currentQuestion;

    setAnsweredQuestions((prev) => ({
      ...prev,
      [realIndex]: selectedAnswer,
    }));
    setShowExplanation(true);
  }, [selectedAnswer, currentQuestion, isRetesting, retestIndices]);

  const nextQuestion = useCallback(() => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCurrentQuestion((c) => {
      if (c + 1 >= activeQuestions.length) {
        setQuizSubmitted(true);
        return c;
      }
      return c + 1;
    });
  }, [activeQuestions.length]);

  const retakeQuiz = useCallback(() => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnsweredQuestions({});
    setQuizSubmitted(false);
    setShowExplanation(false);
    setIsRetesting(false);
    setRetestIndices([]);
  }, []);

  const retestWrongAnswers = useCallback(() => {
    setIsRetesting(true);
    setRetestIndices(wrongAnswerIndices);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setQuizSubmitted(false);
    setShowExplanation(false);
    // Clear only the wrong answers so they can be re-answered
    setAnsweredQuestions((prev) => {
      const next = { ...prev };
      wrongAnswerIndices.forEach((i) => delete next[i]);
      return next;
    });
  }, [wrongAnswerIndices]);

  return {
    // state
    status,
    studyData,
    error,
    activeTab,

    // flashcard state
    currentCard,
    flipped,
    knownCards,
    reviewCards,

    // quiz state
    currentQuestion,
    selectedAnswer,
    answeredQuestions,
    quizSubmitted,
    showExplanation,
    activeQuestions,
    score,
    wrongAnswerIndices,
    isRetesting,

    // actions
    generate,
    startOver,
    setActiveTab,
    flipCard,
    nextCard,
    prevCard,
    markKnown,
    markReview,
    selectAnswer,
    submitAnswer,
    nextQuestion,
    retakeQuiz,
    retestWrongAnswers,
  };
}
