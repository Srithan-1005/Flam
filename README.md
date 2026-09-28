# LearnFlow AI

LearnFlow AI is an interactive, AI-powered study assistant that turns notes, articles, and topics into interactive flashcards and quizzes using Google's Gemini AI.

## Features

- **Free-form Input**: Paste any text, notes, or topics.
- **AI-Powered Generation**: Uses Gemini to structure information into educational material.
- **Interactive Flashcards**: Flip cards, mark them for review, and track mastery.
- **Dynamic Quiz**: Take a multiple-choice quiz, see detailed explanations, and retest only the questions you missed.
- **Dark Mode Support**: Automatically respects system preference with a manual toggle.
- **Robust Validation**: Two-layer schema and logical validation ensures UI stability.
- **Error Handling**: Graceful error states for network issues, AI timeouts, and invalid outputs.

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure API Key**:
   Rename `.env.example` to `.env` (or create a `.env` file in the root directory) and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```
   This will start both the Vite frontend and the Express backend concurrently.

## Assignment Requirements Met

- React functional components/hooks (useState, useEffect, useCallback)
- Free-form input via textarea
- Real LLM API integration (Gemini 1.5 Flash)
- Backend API key protection (API key never exposed to client)
- Structured JSON AI output with robust parsing
- Strict schema validation and malformed-output handling
- Interactive UI (Flashcard flips, Quiz state, Progress tracking)
- Stale-request protection (AbortController)
- Mobile responsiveness

## Known Limitations

- **Factual Accuracy**: While the AI is prompted to be factually accurate, the application relies on the underlying LLM's capabilities and does not perform cross-reference verification against a separate truth source.
- **Single Model**: Operates solely on Gemini; no fallback model is implemented.
