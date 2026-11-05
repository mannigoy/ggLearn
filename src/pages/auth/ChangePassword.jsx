import { useState } from 'react';
import Field from '../../components/ui/Field.jsx';
import { changePassword, mapAuthError } from '../../services/authService.js';

const EMPTY = { current: '', next: '', confirm: '' };

export default function ChangePassword() {
  const [f, setF] = useState(EMPTY);
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => { setF((p) => ({ ...p, [k]: v })); setDone(false); };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const errors = {};
    if (!f.current) errors.current = 'Enter your current password.';
    if (f.next.length < 6) errors.next = 'Use at least 6 characters.';
    else if (f.next === f.current) errors.next = 'Pick a password you haven’t used here.';
    if (f.confirm !== f.next) errors.confirm = 'Passwords don’t match.';
    setErrs(errors);
    if (Object.keys(errors).length) return;

    setBusy(true);
    try {
      await changePassword(f.current, f.next);
      setF(EMPTY);
      setDone(true);
    } catch (error) {
      console.error('[GG] change password', error);
      // mapAuthError reports a wrong password under `password`; here that's the current one.
      const { password, ...rest } = mapAuthError(error);
      setErrs(password ? { current: 'That isn’t your current password.', ...rest } : rest);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h1>Change password</h1>
      <form className="card" onSubmit={submit} noValidate>
        {errs.form && <p className="err" role="alert">{errs.form}</p>}
        {done && <p className="alert" role="status">Your password was changed.</p>}
        <Field id="cp-current" label="Current password" error={errs.current}>
          <input id="cp-current" type="password" autoComplete="current-password" value={f.current} onChange={(e) => set('current', e.target.value)} />
        </Field>
        <Field id="cp-next" label="New password" error={errs.next}>
          <input id="cp-next" type="password" autoComplete="new-password" value={f.next} onChange={(e) => set('next', e.target.value)} />
        </Field>
        <Field id="cp-confirm" label="Confirm new password" error={errs.confirm}>
          <input id="cp-confirm" type="password" autoComplete="new-password" value={f.confirm} onChange={(e) => set('confirm', e.target.value)} />
        </Field>
        <button type="submit" className="btn green" disabled={busy}>{busy ? 'Saving…' : 'Change password'}</button>
      </form>
    </>
  );
}
