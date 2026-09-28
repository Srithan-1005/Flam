import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { generateStudySet } from './ai.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50kb' }));

// Simple in-memory rate limiter: max 10 requests per minute per IP
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 10;

function rateLimit(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return next();
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) {
    return res.status(429).json({
      error: 'Too many requests. Please wait a moment and try again.',
    });
  }

  next();
}

app.post('/api/generate', rateLimit, async (req, res) => {
  try {
    const { input } = req.body;

    if (!input || typeof input !== 'string') {
      return res.status(400).json({ error: 'Input is required.' });
    }

    const trimmed = input.trim();

    if (trimmed.length < 20) {
      return res.status(400).json({
        error: 'Input is too short. Please provide at least 20 characters.',
      });
    }

    if (trimmed.length > 10_000) {
      return res.status(400).json({
        error: 'Input is too long. Maximum 10,000 characters.',
      });
    }

    // generateStudySet now handles: AI call → JSON parse → schema validation
    // It throws descriptive errors for each failure mode
    const data = await generateStudySet(trimmed);
    return res.json(data);
  } catch (err) {
    console.error('Generation error:', err.message);

    // Categorize errors for appropriate HTTP status codes
    const msg = err.message || '';

    if (msg.includes('API key') || msg.includes('API_KEY')) {
      return res.status(401).json({
        error: 'The AI service is not properly configured.',
        errorType: 'config',
      });
    }

    if (msg.includes('invalid JSON') || msg.includes('failed validation')) {
      return res.status(502).json({
        error: "Couldn't generate a valid study set. The AI returned an unexpected response. Please try again.",
        errorType: 'ai_invalid',
      });
    }

    if (msg.includes('empty response')) {
      return res.status(502).json({
        error: 'The AI returned an empty response. Please try again.',
        errorType: 'ai_empty',
      });
    }

    if (msg.includes('429') || msg.includes('quota') || msg.includes('rate')) {
      return res.status(429).json({
        error: 'AI rate limit reached. Please wait a moment and try again.',
        errorType: 'rate_limit',
      });
    }

    if (msg.includes('timeout') || msg.includes('ETIMEDOUT') || msg.includes('ECONNABORTED')) {
      return res.status(504).json({
        error: 'The AI took too long to respond. Please try again.',
        errorType: 'timeout',
      });
    }

    // Generic server error — never expose stack traces or API keys
    return res.status(500).json({
      error: 'Failed to generate study set. Please try again.',
      errorType: 'server',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
