export default function ComingSoon({ title, onBack }) {
  return (
    <section className="card empty">
      <h1>{title}</h1>
      <p className="muted">Coming soon.</p>
      <button type="button" className="btn" onClick={onBack}>Back</button>
    </section>
  );
}
