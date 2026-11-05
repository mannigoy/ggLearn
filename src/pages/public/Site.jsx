import { useEffect, useState } from 'react';
import { Shapes, Wordmark } from '../../components/ui/Paper.jsx';
import useReveal from '../../hooks/useReveal.js';
import HomePage from './HomePage.jsx';
import TeachersPage from './TeachersPage.jsx';

const FAMILY_NAV = [
  { label: 'How a lesson goes', href: '#how-it-works' },
  { label: 'Experiments', href: '#shelf' },
  { label: 'For grown-ups', href: '#grown-ups' },
  { label: 'For teachers', page: 'teachers' }
];
const TEACHER_NAV = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Courses', href: '#courses' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Questions', href: '#faq' }
];

/** Public site for logged-out visitors: the family home page and the teachers page. */
export default function Site({ page, go, onAuth }) {
  const [open, setOpen] = useState(false);
  const isT = page === 'teachers';
  const nav = isT ? TEACHER_NAV : FAMILY_NAV;
  useReveal([page]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    // The menu is hidden by CSS above 980px; close it so it isn't still open on the way back down.
    const wide = window.matchMedia('(min-width: 981px)');
    const onWide = (e) => e.matches && setOpen(false);
    window.addEventListener('keydown', onKey);
    wide.addEventListener('change', onWide);
    return () => {
      window.removeEventListener('keydown', onKey);
      wide.removeEventListener('change', onWide);
    };
  }, [open]);

  const pick = (item) => (e) => {
    setOpen(false);
    if (item.page) { e.preventDefault(); go(item.page); }
  };
  const primary = isT
    ? <a className="btn small" href="#pilot" onClick={() => setOpen(false)}>Start a pilot</a>
    : <button type="button" className="btn small" onClick={() => onAuth('register')}>Start free</button>;

  return (
    <div className="app-shell">
      <a className="skip" href="#main">Skip to main content</a>

      <header className="top">
        <Wordmark as="a" href="#top" onClick={(e) => { e.preventDefault(); go('home'); window.scrollTo({ top: 0 }); }} aria-label="GG Learn home" />
        <nav aria-label="Main">
          <ul className="top-links">
            {nav.map((item) => (
              <li key={item.label}><a href={item.href || '#top'} onClick={pick(item)}>{item.label}</a></li>
            ))}
          </ul>
        </nav>
        <div className="top-actions">
          <button type="button" className="text-action site-only" onClick={() => onAuth('login')}>Log in</button>
          <span className="site-only">{primary}</span>
          <button type="button" className="menu-btn" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((v) => !v)}>
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </header>

      <div id="mobile-nav" hidden={!open} className="mobile-nav">
        <ul>
          {nav.map((item) => (
            <li key={item.label}><a href={item.href || '#top'} onClick={pick(item)}>{item.label}</a></li>
          ))}
          {isT && <li><button type="button" onClick={() => { setOpen(false); go('home'); }}>For families</button></li>}
        </ul>
        <div className="row">
          <button type="button" className="btn plain small" onClick={() => { setOpen(false); onAuth('login'); }}>Log in</button>
          {primary}
        </div>
      </div>

      <main id="main">
        {isT ? <TeachersPage go={go} auth={onAuth} /> : <HomePage go={go} auth={onAuth} />}
      </main>

      <footer className="site-footer">
        <Shapes set="footer" />
        <Wordmark />
        <p className="footer-line">Keep asking why. Hands-on science for kids in grades K–5.</p>
        <ul className="footer-links">
          <li><a href="mailto:hello@gglearn.example">hello@gglearn.example</a></li>
          <li><button type="button" className="link" onClick={() => go(isT ? 'home' : 'teachers')}>{isT ? 'For families' : 'For teachers'}</button></li>
          <li><button type="button" className="link" onClick={() => onAuth('login')}>Log in</button></li>
          <li><a href="#top">Privacy and safety</a></li>
        </ul>
        <p className="footer-copy">© {new Date().getFullYear()} GG Learn. Made for curious kids everywhere.</p>
      </footer>
    </div>
  );
}
