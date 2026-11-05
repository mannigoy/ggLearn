import { useState } from 'react';
import Field from '../../components/ui/Field.jsx';
import { TOPICS } from '../../constants/index.js';
import { validateLesson } from '../../utils/validate.js';

/** Create or edit a lesson. `onSave` gets { title, topic, content }. */
export default function LessonForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    topic: initial?.topic ?? '',
    content: initial?.content ?? ''
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const found = validateLesson(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await onSave({ title: form.title.trim(), topic: form.topic, content: form.content.trim() });
    } catch (err) {
      const fields = err.fields ?? {};
      setErrors(Object.keys(fields).length ? fields : { form: err.message });
      setBusy(false);
    }
  };

  return (
    <form className="card" onSubmit={submit} noValidate aria-labelledby="lesson-form-title">
      <h2 id="lesson-form-title">{initial ? 'Edit lesson' : 'New lesson'}</h2>
      {errors.form && <p className="alert" role="alert">{errors.form}</p>}
      <Field id="lesson-title" label="Title" error={errors.title}>
        <input id="lesson-title" value={form.title} onChange={set('title')} maxLength={120} />
      </Field>
      <Field id="lesson-topic" label="Topic" error={errors.topic}>
        <select id="lesson-topic" value={form.topic} onChange={set('topic')}>
          <option value="">Pick a topic</option>
          {Object.entries(TOPICS).map(([key, name]) => <option key={key} value={key}>{name}</option>)}
        </select>
      </Field>
      <Field id="lesson-content" label="Content" error={errors.content}>
        <textarea id="lesson-content" rows={8} value={form.content} onChange={set('content')} maxLength={20000} />
      </Field>
      <div className="form-actions">
        <button type="submit" className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save lesson'}</button>
        <button type="button" className="btn plain" onClick={onCancel} disabled={busy}>Cancel</button>
      </div>
    </form>
  );
}
