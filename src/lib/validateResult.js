/**
 * ──────────────────────────────────────────────────────────────────────────────
 * validateResult.js — Client-side AI response validation layer
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * This module performs STRUCTURAL/SCHEMA validation on AI-generated study sets.
 * It checks data types, required fields, value ranges, and logical consistency.
 *
 * IMPORTANT DISTINCTION:
 *  • Structural validation: ensures the data has the correct shape/types/ranges.
 *    This is what this module does.
 *  • Factual accuracy: whether the AI's answers are actually correct.
 *    This CANNOT be verified programmatically and depends on the model + prompt.
 *
 * Pipeline:  AI response → validateStudyResult() → normalizeStudyResult() → UI
 *            Any validation failure → user-friendly error → [Try Again]
 * ──────────────────────────────────────────────────────────────────────────────
 */

/**
 * Check if a value is a non-empty string.
 */
function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

/**
 * Validate AI-generated study set data against the expected schema.
 * Returns { valid: true, data } on success or { valid: false, error } on failure.
 *
 * Checks performed:
 *  1. Root object shape (topic, summary, flashcards[], quiz[])
 *  2. Flashcard fields (id, question, answer — all non-empty strings)
 *  3. Quiz fields (id, question, options[4], correctAnswer 0-3, explanation)
 *  4. Logical consistency (correctAnswer in range, no duplicate options, min options)
 */
export function validateStudyResult(result) {
  // ── Root object ──────────────────────────────────────────────────────
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    return { valid: false, error: 'The AI returned an unexpected format — expected a JSON object.' };
  }

  // Topic
  if (!isNonEmptyString(result.topic)) {
    return { valid: false, error: 'The AI response is missing a valid topic.' };
  }

  // Summary
  if (!isNonEmptyString(result.summary)) {
    return { valid: false, error: 'The AI response is missing a valid summary.' };
  }

  // Flashcards must exist and be an array
  if (!Array.isArray(result.flashcards)) {
    return { valid: false, error: 'The AI response is missing the flashcards array.' };
  }

  if (result.flashcards.length < 1) {
    return { valid: false, error: 'The AI response contains no flashcards.' };
  }

  // Quiz must exist and be an array
  if (!Array.isArray(result.quiz)) {
    return { valid: false, error: 'The AI response is missing the quiz array.' };
  }

  if (result.quiz.length < 1) {
    return { valid: false, error: 'The AI response contains no quiz questions.' };
  }

  // ── Flashcard validation ─────────────────────────────────────────────
  for (let i = 0; i < result.flashcards.length; i++) {
    const fc = result.flashcards[i];

    if (!fc || typeof fc !== 'object') {
      return { valid: false, error: `Flashcard ${i + 1} is invalid — expected an object.` };
    }

    if (!isNonEmptyString(fc.question)) {
      return { valid: false, error: `Flashcard ${i + 1} is missing a question.` };
    }

    if (!isNonEmptyString(fc.answer)) {
      return { valid: false, error: `Flashcard ${i + 1} is missing an answer.` };
    }

    // id is required but we'll generate one during normalization if missing
  }

  // ── Quiz validation ──────────────────────────────────────────────────
  for (let i = 0; i < result.quiz.length; i++) {
    const q = result.quiz[i];

    if (!q || typeof q !== 'object') {
      return { valid: false, error: `Quiz question ${i + 1} is invalid — expected an object.` };
    }

    if (!isNonEmptyString(q.question)) {
      return { valid: false, error: `Quiz question ${i + 1} is missing a question.` };
    }

    // Options must be an array
    if (!Array.isArray(q.options)) {
      return { valid: false, error: `Quiz question ${i + 1} is missing the options array.` };
    }

    // Must have exactly 4 options
    if (q.options.length !== 4) {
      return { valid: false, error: `Quiz question ${i + 1} must have exactly 4 options (found ${q.options.length}).` };
    }

    // Must have at least 2 non-empty options (logical minimum for a question)
    let nonEmptyCount = 0;
    for (let j = 0; j < q.options.length; j++) {
      if (!isNonEmptyString(q.options[j])) {
        return { valid: false, error: `Quiz question ${i + 1}, option ${j + 1} is empty or not a string.` };
      }
      nonEmptyCount++;
    }

    if (nonEmptyCount < 2) {
      return { valid: false, error: `Quiz question ${i + 1} has fewer than 2 valid options.` };
    }

    // ── Logical consistency: correctAnswer must be a valid index ──────
    if (typeof q.correctAnswer !== 'number' || !Number.isInteger(q.correctAnswer)) {
      return { valid: false, error: `Quiz question ${i + 1} has a non-integer correctAnswer.` };
    }

    if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
      return {
        valid: false,
        error: `Quiz question ${i + 1} has correctAnswer=${q.correctAnswer} but only ${q.options.length} options exist (valid range: 0-${q.options.length - 1}).`,
      };
    }

    // ── Logical consistency: no duplicate options ─────────────────────
    const normalizedOpts = q.options.map((o) => o.trim().toLowerCase());
    const uniqueOpts = new Set(normalizedOpts);
    if (uniqueOpts.size !== normalizedOpts.length) {
      return { valid: false, error: `Quiz question ${i + 1} has duplicate options, making the question ambiguous.` };
    }

    // Explanation
    if (!isNonEmptyString(q.explanation)) {
      return { valid: false, error: `Quiz question ${i + 1} is missing an explanation.` };
    }
  }

  return { valid: true, data: result };
}

/**
 * Normalize a validated study result:
 * - Trim all string values
 * - Ensure IDs exist (generate fallbacks if missing)
 * - Coerce correctAnswer to integer
 *
 * IMPORTANT: Only call this on data that has ALREADY passed validateStudyResult().
 * This function does NOT perform validation — it only normalizes clean data.
 */
export function normalizeStudyResult(data) {
  return {
    topic: data.topic.trim(),
    summary: data.summary.trim(),
    flashcards: data.flashcards.map((fc, i) => ({
      id: (fc.id && String(fc.id).trim()) || `fc-${i + 1}`,
      question: fc.question.trim(),
      answer: fc.answer.trim(),
    })),
    quiz: data.quiz.map((q, i) => ({
      id: (q.id && String(q.id).trim()) || `q-${i + 1}`,
      question: q.question.trim(),
      options: q.options.map((o) => o.trim()),
      correctAnswer: Math.floor(Number(q.correctAnswer)),
      explanation: q.explanation.trim(),
    })),
  };
}

/**
 * Safe JSON parse wrapper.
 * Returns { ok: true, data } or { ok: false, error }.
 * Never throws.
 */
export function safeJsonParse(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return { ok: false, error: 'Empty response received.' };
  }

  let cleaned = text.trim();

  // Strip markdown fences if the AI wrapped JSON in them
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
  }

  try {
    const data = JSON.parse(cleaned);
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: 'Response is not valid JSON.' };
  }
}
