import { ROLE_LABELS } from '../../constants/index.js';
import { Wordmark } from '../ui/Paper.jsx';

export default function AppHeader({ user, onLogout }) {
  return (
    <header className="top">
      <Wordmark />
      <div className="top-actions">
        <span className="user-greeting">{user.name} · {ROLE_LABELS[user.role] ?? user.role}</span>
        <button type="button" className="btn small plain" onClick={onLogout}>Log out</button>
      </div>
    </header>
  );
}
