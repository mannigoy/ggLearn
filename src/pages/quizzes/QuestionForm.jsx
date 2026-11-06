import { useState } from 'react';
import Field from '../../components/ui/Field.jsx';
import ListEditor from '../../components/ui/ListEditor.jsx';
import { validateQuestion } from '../../utils/validate.js';
import { serverErrors } from '../../utils/formErrors.js';

/** Create or edit a question. `onSave` gets { questionText, choices, correctAnswer }. */
export default function QuestionForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    questionText: initial?.questionText ?? '',
    choices: initial?.choices?.length ? initial.choices : ['', ''],
    correctAnswer: initial?.correctAnswer ?? ''
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const setText = (e) => setForm((f) => ({ ...f, questionText: e.target.value }));
  // Editing or removing the selected choice clears the selection (compared on trimmed text).
  const setChoices = (choices) =>
    setForm((f) => ({
      ...f,
      choices,
      correctAnswer: choices.some((c) => c.trim() === f.correctAnswer) ? f.correctAnswer : ''
    }));
  const options = form.choices.map((c) => c.trim()).filter(Boolean);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const found = validateQuestion(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await onSave({
        questionText: form.questionText.trim(),
        choices: form.choices.map((c) => c.trim()),
        correctAnswer: form.correctAnswer.trim()
      });
    } catch (err) {
      setErrors(serverErrors(err, ['questionText', 'choices', 'correctAnswer']));
      setBusy(false);
    }
  };

  return (
    <form className="card" onSubmit={submit} noValidate aria-labelledby="question-form-title">
      <h3 id="question-form-title">{initial ? 'Edit question' : 'New question'}</h3>
      {errors.form && <p className="alert" role="alert">{errors.form}</p>}
      <Field id="question-text" label="Question" error={errors.questionText}>
        <textarea id="question-text" rows={3} value={form.questionText} onChange={setText} maxLength={500} />
      </Field>
      <ListEditor
        id="question-choice"
        label="Choice"
        items={form.choices}
        onChange={setChoices}
        addLabel="Add choice"
        max={6}
      />
      {errors.choices && <p className="err" role="alert">{errors.choices}</p>}
      <fieldset className="list-editor">
        <legend className="lab">Correct answer</legend>
        {options.length === 0 && <p>Add choices to pick the correct answer.</p>}
        {options.map((text, i) => (
          <label key={i} className="choice-option">
            <input
              type="radio"
              name="question-correct"
              value={text}
              checked={form.correctAnswer === text}
              onChange={() => setForm((f) => ({ ...f, correctAnswer: text }))}
            />
            <span>{text}</span>
          </label>
        ))}
      </fieldset>
      {errors.correctAnswer && <p className="err" role="alert">{errors.correctAnswer}</p>}
      <div className="form-actions">
        <button type="submit" className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save question'}</button>
        <button type="button" className="btn plain" onClick={onCancel} disabled={busy}>Cancel</button>
      </div>
    </form>
  );
}
