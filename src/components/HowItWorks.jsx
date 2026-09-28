import { Clipboard, BrainCircuit, Layers, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { forwardRef } from 'react';

const steps = [
  { icon: Clipboard, title: 'Paste your material', desc: 'Notes, topics, articles — anything you want to learn.' },
  { icon: BrainCircuit, title: 'AI structures your knowledge', desc: 'Gemini analyzes content and creates study material.' },
  { icon: Layers, title: 'Study with flashcards', desc: 'Flip through cards, mark what you know and what needs review.' },
  { icon: Target, title: 'Test yourself', desc: 'Take a quiz, review mistakes, and retest weak areas.' },
];

const HowItWorks = forwardRef(function HowItWorks(_, ref) {
  return (
    <section className="how-it-works" ref={ref}>
      <h2 className="section-title">How LearnFlow works</h2>
      <div className="hiw-grid">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            className="hiw-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <div className="hiw-number">0{i + 1}</div>
            <div className="hiw-icon">
              <step.icon size={24} />
            </div>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
});

export default HowItWorks;
