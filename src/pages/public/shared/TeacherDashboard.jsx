/** Mini class-progress dashboard (CSS + inline SVG only). */
const ROWS = [
  { name: 'Ava R.', pct: 100, chip: 'Completed', tone: 'tint-leaf' },
  { name: 'Noah K.', pct: 72, chip: 'On track', tone: 'tint-sky' },
  { name: 'Mia S.', pct: 34, chip: 'Needs a reteach', tone: 'tint-peach' }
];

export default function TeacherDashboard() {
  const ring = 2 * Math.PI * 34;
  return (
    <div className="card notebook">
      <div className="dash-head">
        <div className="ring">
          <svg viewBox="0 0 80 80" width="96" height="96" aria-hidden="true" focusable="false">
            <circle cx="40" cy="40" r="34" fill="none" stroke="var(--leaf-soft)" strokeWidth="9" />
            <circle
              cx="40" cy="40" r="34" fill="none" stroke="var(--leaf)" strokeWidth="9"
              strokeLinecap="round" strokeDasharray={ring} strokeDashoffset={ring * 0.22}
              transform="rotate(-90 40 40)"
            />
          </svg>
          <span><b>78%</b><small>Class done</small></span>
        </div>
        <div>
          <h3>Grade 3 · Living Things</h3>
          <p className="muted">Week 4 of 8 · 24 students · 6 lessons remaining</p>
        </div>
      </div>
      <ul className="plain-list">
        {ROWS.map((r) => (
          <li key={r.name} className="panel">
            <div className="row">
              <b>{r.name}</b>
              <span className={`chip ${r.tone}`}>{r.chip}</span>
            </div>
            <div
              className="bar" role="progressbar" aria-valuenow={r.pct} aria-valuemin={0}
              aria-valuemax={100} aria-label={`${r.name} progress`}
            >
              <i style={{ width: `${r.pct}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
