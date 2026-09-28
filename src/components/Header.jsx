import { useState, useEffect } from 'react';
import { Moon, Sun, BookOpen, Menu, X } from 'lucide-react';

export default function Header({ onScrollToHowItWorks }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <BookOpen size={24} className="header-icon" />
          <span className="header-title">LearnFlow AI</span>
        </div>

        <nav className={`header-nav ${menuOpen ? 'open' : ''}`}>
          <button
            className="nav-link"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setMenuOpen(false);
            }}
          >
            Study
          </button>
          <button
            className="nav-link"
            onClick={() => {
              onScrollToHowItWorks?.();
              setMenuOpen(false);
            }}
          >
            How it works
          </button>
        </nav>

        <div className="header-actions">
          <button
            className="theme-toggle"
            onClick={() => setDark((d) => !d)}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={dark ? 'Light mode' : 'Dark mode'}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            className="mobile-menu-btn"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
