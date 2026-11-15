import { useEffect, useState } from 'react';
import { profile } from '../data/profile.js';
import { store } from '../lib/store.js';

const STOPS = [
  { id: 'intro', label: 'Intro' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'credentials', label: 'Credentials' },
  { id: 'contact', label: 'Contact' },
];

export function Nav() {
  return (
    <header className="nav">
      <a href="#intro" className="brand">Sivaganesh</a>
      <nav className="nav-actions" aria-label="Quick actions">
        <a href={profile.resume} download>Resume</a>
        <button onClick={() => store.set({ chatOpen: true })}>Ask my AI</button>
      </nav>
    </header>
  );
}

// Right-hand route map: shows where you are on the journey and jumps between stops.
export function Rail({ onJump }) {
  const [active, setActive] = useState('intro');
  useEffect(() => {
    const els = STOPS.map((s) => document.getElementById(s.id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav className="rail" aria-label="Sections">
      <ol>
        {STOPS.map((s) => (
          <li key={s.id} className={active === s.id ? 'on' : ''}>
            <a
              href={`#${s.id}`}
              aria-current={active === s.id ? 'true' : undefined}
              onClick={(e) => {
                e.preventDefault();
                onJump(`#${s.id}`);
              }}
            >
              <span className="dot" />
              <span className="label">{s.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
