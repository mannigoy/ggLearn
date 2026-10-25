import { useEffect, useState } from 'react';
import { AtomIcon, CloseIcon, MailIcon, MenuIcon } from '../../components/icons/icons.jsx';
import { SOCIAL } from './social.js';
import HomePage from './HomePage.jsx';
import TeachersPage from './TeachersPage.jsx';

const FAMILY_NAV = [
  { label: 'Why GG Learn', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'For teachers', page: 'teachers' },
  { label: 'For parents', href: '#audience', aud: 1 },
  { label: 'Safety', href: '#safety' }
];
const TEACHER_NAV = [
  { label: 'Why it works', href: '#how-it-works' },
  { label: 'Curriculum', href: '#sample-course' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Pilot', href: '#pilot' },
  { label: 'FAQ', href: '#faq' }
];
const COLUMNS = [
  { heading: 'Product', links: ['How it works', 'Value props', 'Badges & streaks', 'Course library', 'What’s new'] },
  { heading: 'For teachers', links: ['Teacher dashboard', 'Author a course', 'Standards alignment', 'Classroom pilot', 'Pricing'] },
  { heading: 'For families', links: ['Parent dashboard', 'Safety review', 'Family plans', 'Ages & grades', 'Gift a course'] },
  { heading: 'Company', links: ['About us', 'Careers', 'Press', 'Privacy', 'Terms'] }
];

/** Public site for logged-out visitors: family home + teachers page. */
export default function Site({ page, go, onAuth }) {
  const [open, setOpen] = useState(false);
  const [aud, setAud] = useState(0);
  const isT = page === 'teachers';
  const nav = isT ? TEACHER_NAV : FAMILY_NAV;

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    // The menu is hidden by CSS above 960px; close it so it isn't still open on the way back down.
    const wide = window.matchMedia('(min-width: 961px)');
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
    if (item.aud !== undefined) setAud(item.aud);
  };
  const pilotOrStart = isT
    ? <a className="btn small" href="#pilot" onClick={() => setOpen(false)}>Start a pilot</a>
    : <button className="btn small" onClick={() => onAuth('register')}>Get started</button>;

  return (
    <div className="app-shell">
      <a className="skip" href="#main">Skip to main content</a>

      <div className="site-head">
        <header className="top">
          <a className="brand" href="#top" onClick={(e) => { e.preventDefault(); go('home'); }}>
            <span className="brand-mark" aria-hidden="true">🌱</span>
            <b>GG Learn</b>
            <span className="top-divider" aria-hidden="true" />
            <span className="section-name">{isT ? 'For teachers' : 'Science notebook'}</span>
          </a>

          <nav className="site-nav" aria-label="Main">
            <ul>{nav.map((item) => (
              <li key={item.label}><a href={item.href || '#top'} onClick={pick(item)}>{item.label}</a></li>
            ))}</ul>
          </nav>

          <div className="top-actions site-actions">
            <button className="text-action" onClick={() => go(isT ? 'home' : 'teachers')}>{isT ? 'For families' : 'For teachers'}</button>
            <button className="text-action" onClick={() => onAuth('login')}>Log in</button>
            {pilotOrStart}
          </div>

          <button className="menu-btn" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((v) => !v)}>
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </header>

        <div id="mobile-nav" hidden={!open} className="mobile-nav">
          <ul>
            {nav.map((item) => (
              <li key={item.label}><a href={item.href || '#top'} onClick={pick(item)}>{item.label}</a></li>
            ))}
            <li><button className="link" onClick={() => { setOpen(false); go(isT ? 'home' : 'teachers'); }}>{isT ? 'For families' : 'For teachers'}</button></li>
          </ul>
          <div className="cta-row">
            <button className="btn plain" onClick={() => { setOpen(false); onAuth('login'); }}>Log in</button>
            {pilotOrStart}
          </div>
        </div>
      </div>

      <main id="main">
        {isT ? <TeachersPage auth={onAuth} /> : <HomePage aud={aud} setAud={setAud} go={go} auth={onAuth} />}
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <p className="brand"><span className="brand-mark" aria-hidden="true">🌱</span><b>GG Learn</b></p>
              <p className="muted">Hands-on science learning for elementary kids, built with teachers, reviewed for safety, and made to be done at home or in a classroom.</p>
              <a className="btn plain small" href="mailto:hello@gglearn.example"><MailIcon size={16} />&nbsp;hello@gglearn.example</a>
              <p className="muted small-print">Mon–Fri · replies within one business day</p>
              <div className="social">
                {SOCIAL.map(({ label, d }) => (
                  <a key={label} href="#top" aria-label={label} className="icon-badge small">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" focusable="false"><path d={d} /></svg>
                  </a>
                ))}
              </div>
            </div>
            <nav aria-label="Footer" className="footer-cols">
              {COLUMNS.map((c) => (
                <div key={c.heading}>
                  <h2>{c.heading}</h2>
                  <ul>{c.links.map((l) => <li key={l}><a href="#top">{l}</a></li>)}</ul>
                </div>
              ))}
            </nav>
          </div>
          <div className="footer-bottom">
            <p className="muted"><AtomIcon size={16} /> © {new Date().getFullYear()} GG Learn. Made for curious kids everywhere.</p>
            <ul>{['Privacy', 'Terms', 'Accessibility', 'Cookie choices'].map((x) => <li key={x}><a href="#top">{x}</a></li>)}</ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
