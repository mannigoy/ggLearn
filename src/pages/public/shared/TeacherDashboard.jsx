/** A real fragment of the teacher app: class progress for one unit (sample class). */
const ROWS = [
  { name: 'Ava R.', pct: 100, status: 'Finished' },
  { name: 'Leo M.', pct: 92, status: 'On track' },
  { name: 'Sofia P.', pct: 85, status: 'On track' },
  { name: 'Noah K.', pct: 72, status: 'On track' },
  { name: 'Zara T.', pct: 64, status: 'Quiz due Friday' },
  { name: 'Mia S.', pct: 34, status: 'Stuck: cloud jar, step 3' }
];
const AVG = Math.round(ROWS.reduce((n, r) => n + r.pct, 0) / ROWS.length);

export default function TeacherDashboard() {
  const ring = 2 * Math.PI * 34;
  return (
    <div className="ui-panel" data-ui>
      <div className="ui-head">
        <div className="ring">
          <svg viewBox="0 0 80 80" width="96" height="96" aria-hidden="true" focusable="false">
            <circle cx="40" cy="40" r="34" fill="none" stroke="var(--sky-soft)" strokeWidth="9" />
            <circle
              cx="40" cy="40" r="34" fill="none" stroke="var(--mint)" strokeWidth="9" strokeLinecap="round"
              strokeDasharray={ring} strokeDashoffset={ring * (1 - AVG / 100)} transform="rotate(-90 40 40)"
            />
          </svg>
          <span><b>{AVG}%</b>done</span>
        </div>
        <div>
          <h3>Grade 3 · Living Things · Unit 2</h3>
          <p>Week 4 of 8 · sample class of 6 · Mia needs a reteach on step 3</p>
        </div>
      </div>
      <table className="ui-table">
        <thead><tr><th scope="col">Student</th><th scope="col">Progress</th><th scope="col">Status</th></tr></thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.name}>
              <td><b>{r.name}</b></td>
              <td>
                <span className="ui-bar" role="progressbar" aria-valuenow={r.pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${r.name} progress`}>
                  <i style={{ width: `${r.pct}%` }} />
                </span>
                <span className="num">{r.pct}%</span>
              </td>
              <td>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
