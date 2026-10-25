import { useRef, useState } from 'react';
import { ALLOW_SELF_REGISTER } from '../../constants/index.js';
import Field from '../../components/ui/Field.jsx';

const ROLES = [
  ['student', '🎒', 'Student'],
  ['teacher', '🍎', 'Teacher']
];
const TABS = ALLOW_SELF_REGISTER
  ? [['login', 'Log in'], ['register', 'Sign up']]
  : [['login', 'Log in']];
const FIELD_KEYS = ['name', 'email', 'password'];

/** Arrow/Home/End keyboard handling shared by the tab list and the role radio group. */
const rovingKeys = (e, items, current, select, refs) => {
  const i = items.indexOf(current);
  const next = {
    ArrowRight: (i + 1) % items.length,
    ArrowDown: (i + 1) % items.length,
    ArrowLeft: (i - 1 + items.length) % items.length,
    ArrowUp: (i - 1 + items.length) % items.length,
    Home: 0,
    End: items.length - 1
  }[e.key];
  if (next === undefined) return;
  e.preventDefault();
  select(items[next]);
  refs.current[next]?.focus();
};

export default function Auth({ onLogin, onRegister, initialTab = 'login', onBack }) {
  const [tab, setTab] = useState(ALLOW_SELF_REGISTER ? initialTab : 'login');
  const [f, setF] = useState({ role: 'student', name: '', email: '', password: '' });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const tabRefs = useRef([]);
  const roleRefs = useRef([]);

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const switchTab = (t) => { setTab(t); setErrs({}); };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const result = tab === 'login' ? await onLogin(f.email.trim(), f.password) : await onRegister(f);
      setErrs(result || {});
    } finally {
      setBusy(false);
    }
  };

  const formError = Object.entries(errs)
    .filter(([key]) => !FIELD_KEYS.includes(key))
    .map(([, message]) => message)
    .join(' ');

  return (
    <div className="auth-shell">
      {onBack && <button type="button" className="link" onClick={onBack}>← Back to site</button>}
      <div className="auth-brand"><span aria-hidden="true">🌱</span> GG Learn</div>
      <div className="hero">
        <div className="hero-sprout" aria-hidden="true">🌿</div>
        <h1>Let's grow curious.</h1>
        <p>A friendly place for big questions and tiny discoveries.</p>
      </div>

      <div className="card">
        <div
          className="tabs"
          role="tablist"
          aria-label="Account"
          onKeyDown={(e) => rovingKeys(e, TABS.map(([id]) => id), tab, switchTab, tabRefs)}
        >
          {TABS.map(([id, label], i) => (
            <button
              key={id}
              ref={(el) => (tabRefs.current[i] = el)}
              type="button"
              className="tab"
              role="tab"
              id={`auth-tab-${id}`}
              aria-selected={tab === id}
              aria-controls="auth-panel"
              tabIndex={tab === id ? 0 : -1}
              onClick={() => switchTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <form id="auth-panel" role="tabpanel" aria-labelledby={`auth-tab-${tab}`} onSubmit={submit} noValidate>
          {formError && <p className="err" role="alert">{formError}</p>}

          {tab === 'register' && (
            <>
              <div className="field">
                <span className="lab" id="rl">I am a…</span>
                <div
                  className="roles"
                  role="radiogroup"
                  aria-labelledby="rl"
                  onKeyDown={(e) => rovingKeys(e, ROLES.map(([value]) => value), f.role, (v) => set('role', v), roleRefs)}
                >
                  {ROLES.map(([value, emoji, label], i) => (
                    <button
                      key={value}
                      ref={(el) => (roleRefs.current[i] = el)}
                      type="button"
                      className="role"
                      role="radio"
                      aria-checked={f.role === value}
                      tabIndex={f.role === value ? 0 : -1}
                      onClick={() => set('role', value)}
                    >
                      <span aria-hidden="true">{emoji}</span>{label}
                    </button>
                  ))}
                </div>
                {f.role === 'teacher' && (
                  <p className="muted small-print role-note">Teacher accounts are checked by an admin first. You can log in right away and get teacher tools once you’re approved.</p>
                )}
              </div>
              <Field id="nm" label="Name" error={errs.name}>
                <input id="nm" type="text" autoComplete="name" value={f.name} onChange={(e) => set('name', e.target.value)} />
              </Field>
            </>
          )}

          <Field id="em" label="Email" error={errs.email}>
            <input id="em" type="email" autoComplete="email" value={f.email} onChange={(e) => set('email', e.target.value)} />
          </Field>
          <Field id="pw" label="Password" error={errs.password}>
            <input
              id="pw"
              type="password"
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              value={f.password}
              onChange={(e) => set('password', e.target.value)}
            />
          </Field>

          <button type="submit" className="btn green" style={{ width: '100%' }} disabled={busy}>
            {busy ? 'Please wait…' : tab === 'login' ? 'Log in' : 'Create my account'}
          </button>
        </form>
      </div>
    </div>
  );
}
