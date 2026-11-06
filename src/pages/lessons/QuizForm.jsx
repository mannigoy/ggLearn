import { useState } from 'react';
import Field from '../../components/ui/Field.jsx';
import { validateQuiz } from '../../utils/validate.js';
import { serverErrors } from '../../utils/formErrors.js';

/** Create or edit a quiz. `onSave` gets { title, passingScore }. `totalPoints` caps the passing score. */
export default function QuizForm({ initial, totalPoints = 0, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    passingScore: initial?.passingScore ?? 0
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const found = validateQuiz(form, totalPoints);
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await onSave({ title: form.title.trim(), passingScore: Number(form.passingScore) });
    } catch (err) {
      setErrors(serverErrors(err, ['title', 'passingScore']));
      setBusy(false);
    }
  };

  return (
    <form className="card" onSubmit={submit} noValidate aria-labelledby="quiz-form-title">
      <h3 id="quiz-form-title">{initial ? 'Edit quiz' : 'New quiz'}</h3>
      {errors.form && <p className="alert" role="alert">{errors.form}</p>}
      <Field id="quiz-title" label="Title" error={errors.title}>
        <input id="quiz-title" value={form.title} onChange={set('title')} maxLength={120} />
      </Field>
      <Field id="quiz-passing" label="Passing score" error={errors.passingScore}>
        <input
          id="quiz-passing"
          type="number"
          inputMode="numeric"
          min={0}
          max={totalPoints > 0 ? totalPoints : undefined}
          step={1}
          value={form.passingScore}
          onChange={set('passingScore')}
        />
      </Field>
      <div className="form-actions">
        <button type="submit" className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save quiz'}</button>
        <button type="button" className="btn plain" onClick={onCancel} disabled={busy}>Cancel</button>
      </div>
    </form>
  );
}
