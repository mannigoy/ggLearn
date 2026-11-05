import { useState } from 'react';
import Confirm from '../../components/ui/Confirm.jsx';
import { Empty, ErrorState, Loading } from '../../components/ui/States.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { enroll, listRoster, listStudents, unenroll } from '../../services/enrollmentApi.js';

const day = (iso) => (iso ? new Date(iso).toLocaleDateString() : '');

export default function StudentsTab({ courseId }) {
  const roster = useAsync(() => listRoster(courseId), [courseId]);
  const students = useAsync(() => listStudents(), []);
  const [pick, setPick] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (action) => {
    if (busy) return;
    setMessage('');
    setBusy(true);
    try {
      await action();
      roster.reload();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  const add = () => {
    if (!pick) return;
    run(async () => {
      await enroll(courseId, pick);
      setPick('');
    });
  };

  if (roster.loading) return <section className="card"><Loading label="Loading students…" /></section>;
  if (roster.error) return <section className="card"><ErrorState message={roster.error} onRetry={roster.reload} /></section>;

  const enrolled = new Set(roster.data.map((r) => r.studentUid));
  const available = (students.data ?? []).filter((s) => !enrolled.has(s.uid));

  return (
    <section className="card" aria-label="Students">
      <h2>Students</h2>
      <div className="field">
        <label htmlFor="add-student">Add a student</label>
        <select id="add-student" value={pick} onChange={(e) => setPick(e.target.value)} disabled={busy}>
          <option value="">Pick a student</option>
          {available.map((s) => <option key={s.uid} value={s.uid}>{s.name}</option>)}
        </select>
      </div>
      <button type="button" className="btn small" disabled={busy || !pick} onClick={add}>Add</button>
      {students.error && <p className="alert" role="alert">{students.error}</p>}
      {message && <p className="alert" role="alert">{message}</p>}
      {roster.data.length === 0 ? (
        <Empty title="No students yet">Add a student above.</Empty>
      ) : (
        <ul className="plain-list">
          {roster.data.map((r) => (
            <li key={r.studentUid} className="item">
              <span className="grow">
                <b>{r.studentName}</b>
                <small className="muted">Joined {day(r.enrolledAt)}</small>
              </span>
              <Confirm
                label={<>Remove<span className="sr-only"> {r.studentName}</span></>}
                onYes={() => run(() => unenroll(courseId, r.studentUid))}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
