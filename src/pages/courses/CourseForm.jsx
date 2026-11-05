import { useState } from 'react';
import Field from '../../components/ui/Field.jsx';
import { GRADES, TOPICS } from '../../constants/index.js';
import { validateCourse } from '../../utils/validate.js';

/** Create or edit a course. `teachers` is given for admins, who can pick the owner. */
export default function CourseForm({ initial, teachers, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    gradeLevel: initial?.gradeLevel ?? '',
    topic: initial?.topic ?? '',
    teacherUid: initial?.teacherUid ?? ''
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const found = validateCourse(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    const body = { title: form.title.trim(), gradeLevel: form.gradeLevel, topic: form.topic };
    if (teachers && form.teacherUid) body.teacherUid = form.teacherUid;
    setBusy(true);
    try {
      await onSave(body);
    } catch (err) {
      const fields = err.fields ?? {};
      setErrors(Object.keys(fields).length ? fields : { form: err.message });
      setBusy(false);
    }
  };

  return (
    <form className="card" onSubmit={submit} noValidate aria-labelledby="course-form-title">
      <h2 id="course-form-title">{initial ? 'Edit course' : 'New course'}</h2>
      {errors.form && <p className="alert" role="alert">{errors.form}</p>}
      <Field id="course-title" label="Title" error={errors.title}>
        <input id="course-title" value={form.title} onChange={set('title')} maxLength={120} />
      </Field>
      <Field id="course-grade" label="Grade" error={errors.gradeLevel}>
        <select id="course-grade" value={form.gradeLevel} onChange={set('gradeLevel')}>
          <option value="">Pick a grade</option>
          {GRADES.map((g) => <option key={g} value={g}>{g === 'K' ? 'Kindergarten' : `Grade ${g}`}</option>)}
        </select>
      </Field>
      <Field id="course-topic" label="Topic" error={errors.topic}>
        <select id="course-topic" value={form.topic} onChange={set('topic')}>
          <option value="">Pick a topic</option>
          {Object.entries(TOPICS).map(([key, name]) => <option key={key} value={key}>{name}</option>)}
        </select>
      </Field>
      {teachers && (
        <Field id="course-teacher" label="Teacher" error={errors.teacherUid}>
          <select id="course-teacher" value={form.teacherUid} onChange={set('teacherUid')}>
            <option value="">Me</option>
            {teachers.map((t) => <option key={t.uid} value={t.uid}>{t.name}</option>)}
          </select>
        </Field>
      )}
      <div className="form-actions">
        <button type="submit" className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save course'}</button>
        <button type="button" className="btn plain" onClick={onCancel} disabled={busy}>Cancel</button>
      </div>
    </form>
  );
}
