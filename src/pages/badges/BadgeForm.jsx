import { useState } from 'react';
import Field from '../../components/ui/Field.jsx';

/** Award a badge to an enrolled student. `onSave` gets { userUid, title }. */
export default function BadgeForm({ roster, onSave }) {
  const [userUid, setUserUid] = useState('');
  const [title, setTitle] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const found = {};
    if (!userUid) found.userUid = 'Pick a student.';
    const clean = title.trim();
    if (clean.length < 2 || clean.length > 120) found.title = 'Use 2 to 120 characters.';
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await onSave({ userUid, title: clean });
      setUserUid('');
      setTitle('');
    } catch (err) {
      const fields = err.fields ?? {};
      setErrors(Object.keys(fields).length ? fields : { form: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate aria-label="Award a badge">
      <h3>Award a badge</h3>
      {errors.form && <p className="alert" role="alert">{errors.form}</p>}
      <Field id="badge-student" label="Student" error={errors.userUid}>
        <select id="badge-student" value={userUid} onChange={(e) => setUserUid(e.target.value)}>
          <option value="">Pick a student</option>
          {roster.map((r) => <option key={r.studentUid} value={r.studentUid}>{r.studentName}</option>)}
        </select>
      </Field>
      <Field id="badge-title" label="Badge title" error={errors.title}>
        <input id="badge-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
      </Field>
      <div className="form-actions">
        <button type="submit" className="btn" disabled={busy}>{busy ? 'Awarding…' : 'Award badge'}</button>
      </div>
    </form>
  );
}
