import { motion } from 'framer-motion';

export default function ProgressBar({ current, total, label }) {
  const pct = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <div className="progress-bar-wrap">
      {label && <span className="progress-label">{label}</span>}
      <div className="progress-track">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
