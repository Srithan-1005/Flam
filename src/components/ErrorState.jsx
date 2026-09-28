import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, WifiOff, Clock, ShieldAlert, ServerCrash } from 'lucide-react';

/**
 * Map error messages to icons for better visual communication.
 * Matches against keywords in the error message.
 */
function getErrorIcon(message) {
  const msg = (message || '').toLowerCase();

  if (msg.includes('network') || msg.includes('internet') || msg.includes('offline')) {
    return <WifiOff size={32} />;
  }
  if (msg.includes('timeout') || msg.includes('timed out') || msg.includes('too long')) {
    return <Clock size={32} />;
  }
  if (msg.includes('too many') || msg.includes('rate limit') || msg.includes('wait')) {
    return <Clock size={32} />;
  }
  if (msg.includes('configured') || msg.includes('api key') || msg.includes('config')) {
    return <ShieldAlert size={32} />;
  }
  if (msg.includes('server') || msg.includes('500')) {
    return <ServerCrash size={32} />;
  }

  return <AlertTriangle size={32} />;
}

/**
 * Pick a helpful subtitle based on the error type.
 */
function getErrorTitle(message) {
  const msg = (message || '').toLowerCase();

  if (msg.includes('network') || msg.includes('internet')) {
    return 'Connection problem';
  }
  if (msg.includes('timeout') || msg.includes('timed out')) {
    return 'Request timed out';
  }
  if (msg.includes('too many') || msg.includes('rate limit')) {
    return 'Slow down';
  }
  if (msg.includes('unexpected response') || msg.includes('invalid')) {
    return 'AI response issue';
  }
  if (msg.includes('configured') || msg.includes('api key')) {
    return 'Configuration error';
  }

  return 'Unable to create your study set';
}

export default function ErrorState({ message, onRetry }) {
  const icon = getErrorIcon(message);
  const title = getErrorTitle(message);

  return (
    <motion.div
      className="error-state"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="error-icon-wrap">
        {icon}
      </div>

      <h2 className="error-title">{title}</h2>

      <p className="error-message">
        {message || "The AI returned data we couldn't safely use. Please try again."}
      </p>

      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          <RefreshCw size={16} />
          <span>Try Again</span>
        </button>
      )}
    </motion.div>
  );
}
