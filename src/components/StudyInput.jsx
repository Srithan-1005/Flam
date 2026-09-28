import { useState } from 'react';
import { Send, Zap } from 'lucide-react';
import { MIN_INPUT_LENGTH, MAX_INPUT_LENGTH, EXAMPLE_PROMPTS } from '../lib/constants';

export default function StudyInput({ onGenerate, isLoading }) {
  const [input, setInput] = useState('');

  const trimmed = input.trim();
  const charCount = trimmed.length;
  const tooShort = charCount > 0 && charCount < MIN_INPUT_LENGTH;
  const canGenerate = charCount >= MIN_INPUT_LENGTH && !isLoading;

  function handleSubmit(e) {
    e.preventDefault();
    if (canGenerate) onGenerate(trimmed);
  }

  return (
    <form className="study-input" onSubmit={handleSubmit}>
      <div className="study-input-card">
        <textarea
          className="study-textarea"
          placeholder="Paste your notes, topic, or study material here..."
          value={input}
          onChange={(e) => {
            if (e.target.value.length <= MAX_INPUT_LENGTH) {
              setInput(e.target.value);
            }
          }}
          rows={6}
          aria-label="Study material input"
        />

        <div className="study-input-footer">
          <span className={`char-count ${tooShort ? 'char-count--warning' : ''}`}>
            {charCount.toLocaleString()} / {MAX_INPUT_LENGTH.toLocaleString()}
          </span>

          <button
            type="submit"
            className="btn btn-primary btn-generate"
            disabled={!canGenerate}
          >
            <Send size={16} />
            <span>Generate Study Set</span>
          </button>
        </div>

        {tooShort && (
          <p className="input-hint">
            Add a little more content so the AI can create useful study material.
          </p>
        )}
      </div>

      <div className="example-prompts">
        <span className="example-label">
          <Zap size={14} />
          Try an example:
        </span>
        <div className="example-chips">
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="chip"
              onClick={() => setInput(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
