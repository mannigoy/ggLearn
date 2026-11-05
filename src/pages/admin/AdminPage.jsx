import { useState } from 'react';
import Confirm from '../../components/ui/Confirm.jsx';
import { ROLE_LABELS, ROLES } from '../../constants/index.js';
import { setUserRole } from '../../services/userService.js';

const joined = (createdAt) => createdAt?.toDate?.().toLocaleDateString() ?? '—';

function UserRow({ person, isSelf, onSave }) {
  const [draft, setDraft] = useState(person.role);
  const [prevRole, setPrevRole] = useState(person.role);
  // Reset the dropdown when the saved role changes (e.g. another admin edited it).
  if (person.role !== prevRole) {
    setPrevRole(person.role);
    setDraft(person.role);
  }

  return (
    <li className="item admin-user">
      <div className="grow">
        <b>{person.name}</b>{isSelf && <span className="chip tint-butter">You</span>}
        <small className="muted">{person.email} · joined {joined(person.createdAt)}</small>
      </div>
      <div className="admin-role">
        <label className="sr-only" htmlFor={`role-${person.uid}`}>Role for {person.name}</label>
        <select
          id={`role-${person.uid}`}
          value={draft}
          disabled={isSelf}
          title={isSelf ? 'You can’t change your own role.' : undefined}
          onChange={(e) => setDraft(e.target.value)}
        >
          {Object.values(ROLES).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
        {draft !== person.role && <Confirm label="Save" onYes={() => onSave(person, draft)} />}
      </div>
    </li>
  );
}

export default function AdminPage({ user, users, loadError }) {
  const [saveError, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const error = saveError || loadError;

  const save = async (person, role) => {
    setNotice('');
    setError('');
    try {
      await setUserRole(person.uid, role, user.uid);
      setNotice(`${person.name} is now ${ROLE_LABELS[role].toLowerCase()}.`);
    } catch (err) {
      console.error('[GG] set role', err);
      setError(err?.code === 'permission-denied'
        ? 'That change was blocked. Admins can’t change their own role.'
        : 'Couldn’t save that change. Try again.');
    }
  };

  if (error && !users) return <><h1>Users</h1><p className="alert" role="alert">{error}</p></>;
  if (!users) return <><h1>Users</h1><p className="muted" role="status">Loading users…</p></>;

  const pending = users.filter((u) => u.role === ROLES.PENDING_TEACHER);
  const term = search.trim().toLowerCase();
  const shown = users.filter((u) => (roleFilter === 'all' || u.role === roleFilter)
    && (!term || u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term)));

  return (
    <>
      <h1>Users</h1>
      {error && <p className="alert" role="alert">{error}</p>}
      {notice && <p className="alert" role="status">{notice}</p>}

      <section className="card notebook" aria-labelledby="pending-title">
        <h2 id="pending-title">Teacher requests {pending.length > 0 && <span className="chip tint-sun">{pending.length}</span>}</h2>
        {pending.length === 0 ? (
          <p className="muted">No one is waiting for approval.</p>
        ) : (
          <ul className="plain-list">
            {pending.map((p) => (
              <li key={p.uid} className="item">
                <div className="grow">
                  <b>{p.name}</b>
                  <small className="muted">{p.email} · joined {joined(p.createdAt)}</small>
                </div>
                <div className="admin-role">
                  <button type="button" className="btn small green" onClick={() => save(p, ROLES.TEACHER)}>Approve</button>
                  <Confirm label="Decline" onYes={() => save(p, ROLES.STUDENT)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card" aria-labelledby="all-title">
        <h2 id="all-title">All users <span className="muted">({users.length})</span></h2>
        <div className="admin-filters">
          <div className="field">
            <label htmlFor="user-search">Search</label>
            <input id="user-search" type="search" placeholder="Name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="user-role-filter">Role</label>
            <select id="user-role-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All roles</option>
              {Object.values(ROLES).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </div>
        </div>
        {shown.length === 0 ? (
          <p className="muted">No users match.</p>
        ) : (
          <ul className="plain-list">
            {shown.map((p) => <UserRow key={p.uid} person={p} isSelf={p.uid === user.uid} onSave={save} />)}
          </ul>
        )}
      </section>
    </>
  );
}
