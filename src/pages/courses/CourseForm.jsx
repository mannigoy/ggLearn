import { useState } from 'react';
import Field from '../../components/ui/Field.jsx';
import { GRADES, TOPICS } from '../../constants/index.js';
import { validateCourse } from '../../utils/validate.js';
import { serverErrors } from '../../utils/formErrors.js';

/**
 * Create or edit a course. `teachers` is given for admins, who can pick the owner.
 * `teachersLoading` and `teachersError` describe loading that list.
 */
export default function CourseForm({ initial, teachers, teachersLoading = false, teachersError = '', onSave, onCancel }) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    gradeLevel: initial?.gradeLevel ?? '',
    topic: initial?.topic ?? '',
    teacherUid: ''
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  // The current owner is always pickable, even if they are not in the loaded list.
  const owner = initial?.teacherUid && !(teachers ?? []).some((t) => t.uid === initial.teacherUid)
    ? { uid: initial.teacherUid, name: initial.teacherName || 'Current teacher' }
    : null;
  const teacherOptions = owner ? [owner, ...(teachers ?? [])] : (teachers ?? []);

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
      setErrors(serverErrors(err, ['title', 'gradeLevel', 'topic', 'teacherUid']));
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
          <select id="course-teacher" value={form.teacherUid} onChange={set('teacherUid')} disabled={teachersLoading}>
            <option value="">{initial ? `Keep current teacher (${initial.teacherName || 'unknown'})` : 'Me'}</option>
            {teacherOptions.map((t) => <option key={t.uid} value={t.uid}>{t.name}</option>)}
          </select>
        </Field>
      )}
      {teachers && teachersError && (
        <p className="alert" role="alert">Couldn’t load the teachers list. {teachersError}</p>
      )}
      <div className="form-actions">
        <button type="submit" className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save course'}</button>
        <button type="button" className="btn plain" onClick={onCancel} disabled={busy}>Cancel</button>
      </div>
    </form>
  );
}
