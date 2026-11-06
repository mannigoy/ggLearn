import { useState } from 'react';
import Field from '../../components/ui/Field.jsx';
import { GRADES, ROLE_LABELS, ROLES } from '../../constants/index.js';
import { validateUser } from '../../utils/validate.js';
import { serverErrors } from '../../utils/formErrors.js';

// The server creates only these roles; pending teachers come from sign-up.
const CREATE_ROLES = [ROLES.STUDENT, ROLES.TEACHER, ROLES.ADMIN];

/** Add a user (`isNew`) or edit one. When editing, `initial.role` decides which profile fields apply. */
export default function UserForm({ initial, isNew, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    email: initial?.email ?? '',
    password: '',
    role: initial?.role ?? ROLES.STUDENT,
    gradeLevel: initial?.gradeLevel ?? '',
    section: initial?.section ?? '',
    subject: initial?.subject ?? ''
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const isStudent = form.role === ROLES.STUDENT;
  const isTeacher = form.role === ROLES.TEACHER;

  const submit = async (e) => {
    e.preventDefault();
    const found = validateUser(form, { isNew });
    setErrors(found);
    if (Object.keys(found).length) return;
    const body = { name: form.name.trim() };
    if (isNew) {
      body.email = form.email.trim();
      body.password = form.password;
      body.role = form.role;
    }
    if (isStudent) {
      body.gradeLevel = form.gradeLevel;
      body.section = form.section.trim();
    }
    if (isTeacher) body.subject = form.subject.trim();
    // On create, leave empty optional fields out; on edit, '' clears them on the server.
    if (isNew) {
      for (const key of ['gradeLevel', 'section', 'subject']) {
        if (body[key] === '') delete body[key];
      }
    }
    setBusy(true);
    try {
      await onSave(body);
    } catch (err) {
      setErrors(serverErrors(err, ['name', 'email', 'password', 'role', 'gradeLevel', 'section', 'subject']));
      setBusy(false);
    }
  };

  return (
    <form className="card" onSubmit={submit} noValidate aria-labelledby="user-form-title">
      <h2 id="user-form-title">{isNew ? 'Add a user' : 'Edit user'}</h2>
      {errors.form && <p className="alert" role="alert">{errors.form}</p>}
      <Field id="user-name" label="Name" error={errors.name}>
        <input id="user-name" value={form.name} onChange={set('name')} maxLength={80} />
      </Field>
      {isNew && (
        <>
          <Field id="user-email" label="Email" error={errors.email}>
            <input id="user-email" type="email" value={form.email} onChange={set('email')} />
          </Field>
          <Field id="user-password" label="Password" error={errors.password}>
            <input id="user-password" type="password" autoComplete="new-password" value={form.password} onChange={set('password')} />
          </Field>
          <Field id="user-role" label="Role" error={errors.role}>
            <select id="user-role" value={form.role} onChange={set('role')}>
              {CREATE_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </Field>
        </>
      )}
      {isStudent && (
        <>
          <Field id="user-grade" label="Grade" error={errors.gradeLevel}>
            <select id="user-grade" value={form.gradeLevel} onChange={set('gradeLevel')}>
              <option value="">No grade</option>
              {GRADES.map((g) => <option key={g} value={g}>{g === 'K' ? 'Kindergarten' : `Grade ${g}`}</option>)}
            </select>
          </Field>
          <Field id="user-section" label="Section" error={errors.section}>
            <input id="user-section" value={form.section} onChange={set('section')} maxLength={60} />
          </Field>
        </>
      )}
      {isTeacher && (
        <Field id="user-subject" label="Subject" error={errors.subject}>
          <input id="user-subject" value={form.subject} onChange={set('subject')} maxLength={60} />
        </Field>
      )}
      <div className="form-actions">
        <button type="submit" className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save user'}</button>
        <button type="button" className="btn plain" onClick={onCancel} disabled={busy}>Cancel</button>
      </div>
    </form>
  );
}
