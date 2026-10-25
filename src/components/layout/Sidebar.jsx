import { ROLES } from '../../constants/index.js';

export default function Sidebar({ user, view, go, pendingCount = 0 }) {
  const items = [
    { name: 'home', icon: '⌂', label: 'Overview' },
    user.role === ROLES.ADMIN && { name: 'admin', icon: '☺', label: 'Users', badge: pendingCount },
    { name: 'password', icon: '⚿', label: 'Change password' }
  ].filter(Boolean);

  return (
    <aside className="sidebar">
      <div className="sidebar-heading">Your notebook</div>
      <div className="progress-label"><span>Learning path</span><strong>1 of 4</strong></div>
      <div className="progress-track"><span /></div>
      <nav className="side-nav" aria-label="Notebook navigation">
        {items.map((item) => (
          <button
            key={item.name}
            type="button"
            className={view.name === item.name ? 'active' : ''}
            aria-current={view.name === item.name ? 'page' : undefined}
            onClick={() => go({ name: item.name })}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span> {item.label}
            {item.badge > 0 && <span className="chip tint-sun nav-badge"><span className="sr-only">, </span>{item.badge}<span className="sr-only"> waiting</span></span>}
          </button>
        ))}
      </nav>
      <div className="sidebar-meta">
        <div><span>Target grade</span><strong>K–5</strong></div>
        <div><span>Estimated time</span><strong>15 min</strong></div>
      </div>
      <div className="sidebar-note"><span aria-hidden="true">🍃</span> Small steps grow big ideas.</div>
    </aside>
  );
}
