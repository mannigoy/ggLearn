import { useState } from 'react';
import Field from '../../components/ui/Field.jsx';
import ListEditor from '../../components/ui/ListEditor.jsx';
import { validateExperiment } from '../../utils/validate.js';
import { serverErrors } from '../../utils/formErrors.js';

/** Create or edit an experiment. `onSave` gets { title, materials, steps, safetyNotes }. */
export default function ExperimentForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    materials: initial?.materials ?? [''],
    steps: initial?.steps ?? [''],
    safetyNotes: initial?.safetyNotes ?? ''
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setList = (key) => (items) => setForm((f) => ({ ...f, [key]: items }));

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const found = validateExperiment(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await onSave({
        title: form.title.trim(),
        materials: form.materials.map((m) => m.trim()),
        steps: form.steps.map((s) => s.trim()),
        safetyNotes: form.safetyNotes.trim()
      });
    } catch (err) {
      setErrors(serverErrors(err, ['title', 'materials', 'steps', 'safetyNotes']));
      setBusy(false);
    }
  };

  return (
    <form className="card" onSubmit={submit} noValidate aria-labelledby="experiment-form-title">
      <h3 id="experiment-form-title">{initial ? 'Edit experiment' : 'New experiment'}</h3>
      {errors.form && <p className="alert" role="alert">{errors.form}</p>}
      <Field id="experiment-title" label="Title" error={errors.title}>
        <input id="experiment-title" value={form.title} onChange={set('title')} maxLength={120} />
      </Field>
      <ListEditor
        id="experiment-material"
        label="Material"
        items={form.materials}
        onChange={setList('materials')}
        addLabel="Add material"
      />
      {errors.materials && <p className="err" role="alert">{errors.materials}</p>}
      <ListEditor
        id="experiment-step"
        label="Step"
        items={form.steps}
        onChange={setList('steps')}
        addLabel="Add step"
      />
      {errors.steps && <p className="err" role="alert">{errors.steps}</p>}
      <Field id="experiment-safety" label="Safety notes" error={errors.safetyNotes}>
        <textarea id="experiment-safety" rows={3} value={form.safetyNotes} onChange={set('safetyNotes')} maxLength={1000} />
      </Field>
      <div className="form-actions">
        <button type="submit" className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save experiment'}</button>
        <button type="button" className="btn plain" onClick={onCancel} disabled={busy}>Cancel</button>
      </div>
    </form>
  );
}
