import { Sparkles } from 'lucide-react';
import StudyInput from './StudyInput';

export default function Hero({ onGenerate, isLoading }) {
  return (
    <section className="hero">
      <div className="hero-badge">
        <Sparkles size={14} />
        <span>AI-powered studying</span>
      </div>

      <h1 className="hero-title">
        Learn smarter.<br />
        <span className="hero-title-accent">Not harder.</span>
      </h1>

      <p className="hero-subtitle">
        Paste your notes or any topic and let AI turn them into
        flashcards and an interactive quiz in seconds.
      </p>

      <StudyInput onGenerate={onGenerate} isLoading={isLoading} />
    </section>
  );
}
