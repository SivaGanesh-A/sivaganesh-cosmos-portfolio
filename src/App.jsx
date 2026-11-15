import { lazy, Suspense, useCallback, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { Nav, Rail } from './components/Nav.jsx';
import Chat from './components/Chat.jsx';
import { Hero, About, Skills, Projects, Journey, Credentials, Contact } from './sections/Sections.jsx';
import { scrollState } from './lib/store.js';

// three.js is split into its own chunk so text paints before the universe loads.
const Universe = lazy(() => import('./scene/Universe.jsx'));

export default function App() {
  const lenis = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const onScroll = () => (scrollState.y = window.scrollY);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    let raf;
    if (!reduce) {
      lenis.current = new Lenis({ lerp: 0.085, smoothWheel: true });
      const loop = (t) => {
        lenis.current.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
      lenis.current?.destroy();
    };
  }, []);

  const jump = useCallback((hash) => {
    const el = document.querySelector(hash);
    if (!el) return;
    if (lenis.current) lenis.current.scrollTo(el, { duration: 2.2 });
    else el.scrollIntoView();
  }, []);

  // Make in-page links fly smoothly too.
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || e.defaultPrevented) return;
      e.preventDefault();
      jump(a.getAttribute('href'));
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [jump]);

  return (
    <>
      <Suspense fallback={<div className="universe universe-fallback" />}>
        <Universe />
      </Suspense>
      <a className="skip" href="#about">Skip to content</a>
      <Nav />
      <Rail onJump={jump} />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Journey />
        <Credentials />
        <Contact />
      </main>
      <Chat />
    </>
  );
}
