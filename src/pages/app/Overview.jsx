import { ROLE_LABELS, ROLES } from '../../constants/index.js';

export default function Overview({ user, pendingCount, go }) {
  return (
    <>
      <h1>Welcome, {user.name}!</h1>
      {user.role === ROLES.PENDING_TEACHER && (
        <p className="alert" role="status">
          Your teacher account is waiting for an admin to approve it. You’ll get teacher tools as soon as it’s approved. This page updates by itself.
        </p>
      )}
      {user.role === ROLES.ADMIN && pendingCount > 0 && (
        <div className="alert">
          <span className="grow">{pendingCount} teacher {pendingCount === 1 ? 'request is' : 'requests are'} waiting for approval.</span>
          <button type="button" className="btn small" onClick={() => go({ name: 'admin' })}>Review</button>
        </div>
      )}
      <div className="card notebook">
        <p className="muted">Signed in as {ROLE_LABELS[user.role] ?? user.role} · {user.email}</p>
        <p>Lessons are coming soon.</p>
      </div>
    </>
  );
}
