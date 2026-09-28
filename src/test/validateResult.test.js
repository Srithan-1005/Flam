/**
 * ──────────────────────────────────────────────────────────────────────────────
 * validateResult.test.js — Validation test suite
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * Runs without any test framework — just Node.js + assert.
 * Usage:  node src/test/validateResult.test.js
 *
 * Tests the entire validation pipeline:
 *  1. Valid response → passes
 *  2. Malformed JSON → safeJsonParse rejects
 *  3. Wrong root structure → validation rejects
 *  4. Missing required fields → validation rejects
 *  5. Invalid quiz correctAnswer index → validation rejects
 *  6. Empty string values → validation rejects
 *  7. Duplicate quiz options → validation rejects
 *  8. Edge cases (null, array, number, empty string input)
 *  9. Normalization of valid data
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// We import directly from source (ESM)
import {
  validateStudyResult,
  normalizeStudyResult,
  safeJsonParse,
} from '../lib/validateResult.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Helpers ─────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures = [];

function loadFixture(filename) {
  return readFileSync(join(__dirname, 'fixtures', filename), 'utf-8');
}

function loadJsonFixture(filename) {
  return JSON.parse(loadFixture(filename));
}

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    failures.push({ name, error: err.message });
    console.log(`  ✗ ${name}`);
    console.log(`    → ${err.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label || 'Value'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// ── Test Suite ──────────────────────────────────────────────────────────────

console.log('\n═══════════════════════════════════════════════');
console.log(' LearnFlow AI — Validation Test Suite');
console.log('═══════════════════════════════════════════════\n');

// ── 1. Valid response ───────────────────────────────────────────────────────

console.log('1. Valid Response');
test('Valid response passes validation', () => {
  const data = loadJsonFixture('validResponse.json');
  const result = validateStudyResult(data);
  assert(result.valid === true, `Expected valid=true, got valid=${result.valid}: ${result.error}`);
  assert(result.data !== undefined, 'Expected data to be present');
});

test('Valid response normalizes correctly', () => {
  const data = loadJsonFixture('validResponse.json');
  const validation = validateStudyResult(data);
  assert(validation.valid, 'Precondition: validation should pass');

  const normalized = normalizeStudyResult(validation.data);
  assert(normalized.topic === 'Binary Search', `Topic: expected "Binary Search", got "${normalized.topic}"`);
  assert(normalized.flashcards.length === 5, `Flashcards: expected 5, got ${normalized.flashcards.length}`);
  assert(normalized.quiz.length === 5, `Quiz: expected 5, got ${normalized.quiz.length}`);
  assert(typeof normalized.quiz[0].correctAnswer === 'number', 'correctAnswer should be a number');
});

// ── 2. Malformed JSON ───────────────────────────────────────────────────────

console.log('\n2. Malformed JSON');
test('Malformed JSON fails safeJsonParse', () => {
  const raw = loadFixture('malformedResponse.txt');
  const result = safeJsonParse(raw);
  assert(result.ok === false, 'Expected ok=false for malformed JSON');
  assert(typeof result.error === 'string' && result.error.length > 0, 'Expected error message');
});

test('Empty string fails safeJsonParse', () => {
  const result = safeJsonParse('');
  assert(result.ok === false, 'Expected ok=false for empty string');
});

test('Null fails safeJsonParse', () => {
  const result = safeJsonParse(null);
  assert(result.ok === false, 'Expected ok=false for null');
});

test('Markdown-wrapped JSON is unwrapped', () => {
  const wrapped = '```json\n{"topic":"Test","summary":"S","flashcards":[],"quiz":[]}\n```';
  const result = safeJsonParse(wrapped);
  assert(result.ok === true, `Expected ok=true, got error: ${result.error}`);
  assert(result.data.topic === 'Test', 'Topic should be "Test"');
});

// ── 3. Wrong root structure ─────────────────────────────────────────────────

console.log('\n3. Wrong Root Structure');
test('Object with "cards" instead of "flashcards" fails', () => {
  const data = loadJsonFixture('wrongStructure.json');
  const result = validateStudyResult(data);
  assert(result.valid === false, 'Expected valid=false');
  assert(result.error.toLowerCase().includes('flashcards'), `Error should mention flashcards: ${result.error}`);
});

test('Null input fails validation', () => {
  const result = validateStudyResult(null);
  assert(result.valid === false, 'Expected valid=false for null');
});

test('Array input fails validation', () => {
  const result = validateStudyResult([1, 2, 3]);
  assert(result.valid === false, 'Expected valid=false for array');
});

test('String input fails validation', () => {
  const result = validateStudyResult('hello');
  assert(result.valid === false, 'Expected valid=false for string');
});

test('Number input fails validation', () => {
  const result = validateStudyResult(42);
  assert(result.valid === false, 'Expected valid=false for number');
});

// ── 4. Missing fields ──────────────────────────────────────────────────────

console.log('\n4. Missing Fields');
test('Missing flashcards and quiz fails', () => {
  const data = loadJsonFixture('missingFields.json');
  const result = validateStudyResult(data);
  assert(result.valid === false, 'Expected valid=false');
  assert(
    result.error.toLowerCase().includes('flashcards') || result.error.toLowerCase().includes('quiz'),
    `Error should mention missing field: ${result.error}`
  );
});

test('Missing topic fails', () => {
  const result = validateStudyResult({ summary: 'x', flashcards: [], quiz: [] });
  assert(result.valid === false, 'Expected valid=false for missing topic');
});

test('Missing summary fails', () => {
  const result = validateStudyResult({ topic: 'x', flashcards: [], quiz: [] });
  assert(result.valid === false, 'Expected valid=false for missing summary');
});

// ── 5. Invalid quiz correctAnswer index ─────────────────────────────────────

console.log('\n5. Invalid Quiz Index');
test('correctAnswer=10 with 4 options fails', () => {
  const data = loadJsonFixture('invalidQuizIndex.json');
  const result = validateStudyResult(data);
  assert(result.valid === false, 'Expected valid=false');
  assert(result.error.includes('correctAnswer'), `Error should mention correctAnswer: ${result.error}`);
});

test('correctAnswer=-1 fails', () => {
  const data = loadJsonFixture('validResponse.json');
  // Modify to have invalid index
  const modified = JSON.parse(JSON.stringify(data));
  modified.quiz[0].correctAnswer = -1;
  const result = validateStudyResult(modified);
  assert(result.valid === false, 'Expected valid=false for negative index');
});

test('correctAnswer=4 with 4 options fails', () => {
  const data = loadJsonFixture('validResponse.json');
  const modified = JSON.parse(JSON.stringify(data));
  modified.quiz[0].correctAnswer = 4;
  const result = validateStudyResult(modified);
  assert(result.valid === false, 'Expected valid=false for index=4');
});

test('correctAnswer as string fails', () => {
  const data = loadJsonFixture('validResponse.json');
  const modified = JSON.parse(JSON.stringify(data));
  modified.quiz[0].correctAnswer = "1";
  const result = validateStudyResult(modified);
  assert(result.valid === false, 'Expected valid=false for string correctAnswer');
});

test('correctAnswer as float fails', () => {
  const data = loadJsonFixture('validResponse.json');
  const modified = JSON.parse(JSON.stringify(data));
  modified.quiz[0].correctAnswer = 1.5;
  const result = validateStudyResult(modified);
  assert(result.valid === false, 'Expected valid=false for float correctAnswer');
});

// ── 6. Empty values ────────────────────────────────────────────────────────

console.log('\n6. Empty Values');
test('All empty strings fails', () => {
  const data = loadJsonFixture('emptyValues.json');
  const result = validateStudyResult(data);
  assert(result.valid === false, 'Expected valid=false for empty values');
});

test('Empty flashcard question fails', () => {
  const data = loadJsonFixture('validResponse.json');
  const modified = JSON.parse(JSON.stringify(data));
  modified.flashcards[0].question = '';
  const result = validateStudyResult(modified);
  assert(result.valid === false, 'Expected valid=false for empty question');
});

test('Null flashcard answer fails', () => {
  const data = loadJsonFixture('validResponse.json');
  const modified = JSON.parse(JSON.stringify(data));
  modified.flashcards[0].answer = null;
  const result = validateStudyResult(modified);
  assert(result.valid === false, 'Expected valid=false for null answer');
});

test('Empty quiz option fails', () => {
  const data = loadJsonFixture('validResponse.json');
  const modified = JSON.parse(JSON.stringify(data));
  modified.quiz[0].options[2] = '';
  const result = validateStudyResult(modified);
  assert(result.valid === false, 'Expected valid=false for empty option');
});

// ── 7. Duplicate options ───────────────────────────────────────────────────

console.log('\n7. Duplicate Options');
test('Duplicate quiz options fails', () => {
  const data = loadJsonFixture('duplicateOptions.json');
  const result = validateStudyResult(data);
  assert(result.valid === false, 'Expected valid=false for duplicate options');
  assert(result.error.toLowerCase().includes('duplicate'), `Error should mention duplicate: ${result.error}`);
});

test('Case-insensitive duplicates are caught', () => {
  const data = loadJsonFixture('validResponse.json');
  const modified = JSON.parse(JSON.stringify(data));
  modified.quiz[0].options = ['O(n)', 'o(n)', 'O(n log n)', 'O(1)'];
  const result = validateStudyResult(modified);
  assert(result.valid === false, 'Expected valid=false for case-insensitive duplicates');
});

// ── 8. Edge cases ──────────────────────────────────────────────────────────

console.log('\n8. Edge Cases');
test('Empty flashcards array fails', () => {
  const data = loadJsonFixture('validResponse.json');
  const modified = JSON.parse(JSON.stringify(data));
  modified.flashcards = [];
  const result = validateStudyResult(modified);
  assert(result.valid === false, 'Expected valid=false for empty flashcards');
});

test('Empty quiz array fails', () => {
  const data = loadJsonFixture('validResponse.json');
  const modified = JSON.parse(JSON.stringify(data));
  modified.quiz = [];
  const result = validateStudyResult(modified);
  assert(result.valid === false, 'Expected valid=false for empty quiz');
});

test('Quiz question with fewer than 4 options fails', () => {
  const data = loadJsonFixture('validResponse.json');
  const modified = JSON.parse(JSON.stringify(data));
  modified.quiz[0].options = ['A', 'B'];
  const result = validateStudyResult(modified);
  assert(result.valid === false, 'Expected valid=false for < 4 options');
});

test('Quiz question with more than 4 options fails', () => {
  const data = loadJsonFixture('validResponse.json');
  const modified = JSON.parse(JSON.stringify(data));
  modified.quiz[0].options = ['A', 'B', 'C', 'D', 'E'];
  const result = validateStudyResult(modified);
  assert(result.valid === false, 'Expected valid=false for > 4 options');
});

test('Flashcard with non-object entry fails', () => {
  const data = loadJsonFixture('validResponse.json');
  const modified = JSON.parse(JSON.stringify(data));
  modified.flashcards[0] = 'not an object';
  const result = validateStudyResult(modified);
  assert(result.valid === false, 'Expected valid=false for string flashcard');
});

test('Quiz with non-object entry fails', () => {
  const data = loadJsonFixture('validResponse.json');
  const modified = JSON.parse(JSON.stringify(data));
  modified.quiz[0] = null;
  const result = validateStudyResult(modified);
  assert(result.valid === false, 'Expected valid=false for null quiz entry');
});

// ── Summary ────────────────────────────────────────────────────────────────

console.log('\n═══════════════════════════════════════════════');
console.log(` Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log('═══════════════════════════════════════════════');

if (failures.length > 0) {
  console.log('\nFailed tests:');
  failures.forEach((f, i) => {
    console.log(`  ${i + 1}. ${f.name}`);
    console.log(`     ${f.error}`);
  });
}

console.log('');
process.exit(failed > 0 ? 1 : 0);
