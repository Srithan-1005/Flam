import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, BookOpen, BrainCircuit, ListChecks, Sparkles } from 'lucide-react';
import { LOADING_MESSAGES } from '../lib/constants';

export default function LoadingState() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const icons = [BookOpen, BrainCircuit, ListChecks, Sparkles];
  const StepIcon = icons[step];

  return (
    <motion.div
      className="loading-state"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="loading-spinner-ring">
        <Loader2 size={32} className="loading-spinner" />
      </div>

      <h2 className="loading-title">Creating your study session…</h2>

      <div className="loading-steps">
        {LOADING_MESSAGES.map((msg, i) => (
          <motion.div
            key={msg}
            className={`loading-step ${i <= step ? 'loading-step--active' : ''} ${i < step ? 'loading-step--done' : ''}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15, duration: 0.3 }}
          >
            <div className="loading-step-dot" />
            <span>{msg}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
