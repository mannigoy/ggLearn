export function Loading({ label = 'Loading…' }) {
  return <p className="muted" role="status">{label}</p>;
}

export function Empty({ title, children }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {children && <div className="muted">{children}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="alert" role="alert">
      <span className="grow">{message}</span>
      {onRetry && <button type="button" className="btn small" onClick={onRetry}>Try again</button>}
    </div>
  );
}
