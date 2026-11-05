import { ROLES } from '../../constants/index.js';
import AppHeader from './AppHeader.jsx';

/** Signed-in frame: the top bar, a centred row of notebook tabs, and one centred column. */
export default function AppShell({ user, view, go, pendingCount = 0, onLogout, children }) {
  const items = [
    { name: 'home', label: 'My notebook' },
    { name: 'courses', label: 'Courses', also: ['course', 'lesson', 'quiz'] },
    user.role === ROLES.STUDENT && { name: 'badges', label: 'Badges' },
    user.role === ROLES.ADMIN && { name: 'admin', label: 'Users', badge: pendingCount },
    { name: 'password', label: 'Password' }
  ].filter(Boolean);

  return (
    <div className="app-shell">
      <a className="skip" href="#main">Skip to main content</a>
      <AppHeader user={user} onLogout={onLogout} />
      <nav className="shell-nav" aria-label="Notebook">
        {items.map((item) => (
          <button
            key={item.name}
            type="button"
            aria-current={view.name === item.name || item.also?.includes(view.name) ? 'page' : undefined}
            onClick={() => go({ name: item.name })}
          >
            {item.label}
            {item.badge > 0 && <span className="chip"><span className="sr-only">, </span>{item.badge}<span className="sr-only"> waiting</span></span>}
          </button>
        ))}
      </nav>
      <main id="main" className="wrap">{children}</main>
    </div>
  );
}
