import { ROLE_LABELS, ROLES } from '../../constants/index.js';

export default function AppHeader({ user, section, onNewLesson, onLogout }) {
  return (
    <header className="top">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">🌱</span>
        <b>GG Learn</b>
        <span className="top-divider" aria-hidden="true" />
        <span className="section-name">{section}</span>
      </div>
      <div className="top-actions">
        <span className="user-greeting">{user.name} · {ROLE_LABELS[user.role] ?? user.role}</span>
        {user.role === ROLES.TEACHER && onNewLesson && (
          <button type="button" className="btn small" onClick={onNewLesson}>＋ New lesson</button>
        )}
        <button type="button" className="text-action" onClick={onLogout}>Log out</button>
      </div>
    </header>
  );
}
