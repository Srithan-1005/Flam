import { useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import StudySession from './components/StudySession';
import { useStudySession, STATUS } from './hooks/useStudySession';

export default function App() {
  const session = useStudySession();
  const hiwRef = useRef(null);
  const lastInputRef = useRef('');

  const handleGenerate = (input) => {
    lastInputRef.current = input;
    session.generate(input);
  };

  const handleRetry = () => {
    if (lastInputRef.current) {
      session.generate(lastInputRef.current);
    }
  };

  const scrollToHIW = () => {
    hiwRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app">
      <Header onScrollToHowItWorks={scrollToHIW} />

      <main className="main">
        {session.status === STATUS.EMPTY && (
          <>
            <Hero
              onGenerate={handleGenerate}
              isLoading={false}
            />
            <HowItWorks ref={hiwRef} />
          </>
        )}

        {session.status === STATUS.LOADING && (
          <div className="container">
            <LoadingState />
          </div>
        )}

        {session.status === STATUS.ERROR && (
          <div className="container">
            <ErrorState
              message={session.error}
              onRetry={handleRetry}
            />
          </div>
        )}

        {session.status === STATUS.SUCCESS && (
          <div className="container">
            <StudySession session={session} />
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Built with React, Express & Gemini AI — LearnFlow AI</p>
      </footer>
    </div>
  );
}
