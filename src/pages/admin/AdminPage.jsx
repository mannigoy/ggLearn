import { useState } from 'react';
import Confirm from '../../components/ui/Confirm.jsx';
import { Empty, ErrorState, Loading } from '../../components/ui/States.jsx';
import { ROLE_LABELS, ROLES } from '../../constants/index.js';
import { useAsync } from '../../hooks/useAsync.js';
import { createUser, deleteUser, listUsers, setDisabled, setRole, updateUser } from '../../services/adminUserApi.js';
import UserForm from './UserForm.jsx';

const SELF_TITLE = 'You can’t change your own account here.';
const joined = (createdAt) => (createdAt ? new Date(createdAt).toLocaleDateString() : '—');

const FILTERS = [
  { key: 'all', label: 'All', test: () => true },
  { key: 'students', label: 'Students', test: (u) => u.role === ROLES.STUDENT },
  { key: 'teachers', label: 'Teachers', test: (u) => u.role === ROLES.TEACHER },
  { key: 'pending', label: 'Pending', test: (u) => u.role === ROLES.PENDING_TEACHER },
  { key: 'admins', label: 'Admins', test: (u) => u.role === ROLES.ADMIN },
  { key: 'off', label: 'Turned off', test: (u) => u.disabled }
];

function UserRow({ person, isSelf, busy, onEdit, onRole, onToggle, onDelete }) {
  const [draft, setDraft] = useState(person.role);
  const [prevRole, setPrevRole] = useState(person.role);
  // Reset the dropdown when the saved role changes.
  if (person.role !== prevRole) {
    setPrevRole(person.role);
    setDraft(person.role);
  }
  const title = isSelf ? SELF_TITLE : undefined;
  const sr = <span className="sr-only"> {person.name}</span>;

  return (
    <li className="item admin-user">
      <div className="grow">
        <b>{person.name}</b>
        {isSelf && <span className="chip tint-butter">You</span>}
        {person.disabled && <span className="chip coral">Turned off</span>}
        <small className="muted">
          {person.email} · {ROLE_LABELS[person.role] ?? person.role} · joined {joined(person.createdAt)}
        </small>
      </div>
      <div className="admin-role">
        <label className="sr-only" htmlFor={`role-${person.uid}`}>Role for {person.name}</label>
        <select
          id={`role-${person.uid}`}
          value={draft}
          disabled={isSelf || busy}
          title={title}
          onChange={(e) => setDraft(e.target.value)}
        >
          {Object.values(ROLES).map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
        {draft !== person.role && !isSelf && <Confirm label={<>Save<span className="sr-only"> role for {person.name}</span></>} onYes={() => onRole(person, draft)} />}
        {isSelf ? (
          <>
            <button type="button" className="btn small plain" disabled title={title}>Edit{sr}</button>
            <button type="button" className="btn small plain" disabled title={title}>Turn off{sr}</button>
            <button type="button" className="btn small plain" disabled title={title}>Delete{sr}</button>
          </>
        ) : (
          <>
            <button type="button" className="btn small plain" disabled={busy} onClick={() => onEdit(person)}>Edit{sr}</button>
            <Confirm
              label={<>{person.disabled ? 'Turn on' : 'Turn off'}{sr}</>}
              onYes={() => onToggle(person)}
            />
            <Confirm
              label={<>Delete{sr}</>}
              message="This deletes the account and its enrollments. Courses they teach are kept."
              onYes={() => onDelete(person)}
            />
          </>
        )}
      </div>
    </li>
  );
}

export default function AdminPage({ user, onUsersChanged }) {
  const users = useAsync(listUsers, []);
  const [filter, setFilter] = useState('all');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);

  const changed = () => {
    users.reload();
    onUsersChanged?.();
  };

  const run = async (action, message) => {
    if (busy) return;
    setNotice('');
    setActionError('');
    setBusy(true);
    try {
      await action();
      if (message) setNotice(message);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
      changed();
    }
  };

  const add = async (body) => {
    await createUser(body);
    setAdding(false);
    setNotice(`${body.name} was added.`);
    changed();
  };

  const edit = async (body) => {
    await updateUser(editing.uid, body);
    setEditing(null);
    setNotice(`${body.name} was updated.`);
    changed();
  };

  const saveRole = (p, role) =>
    run(() => setRole(p.uid, role), `${p.name} is now ${ROLE_LABELS[role].toLowerCase()}.`);
  const toggle = (p) =>
    run(() => setDisabled(p.uid, !p.disabled), `${p.name} was turned ${p.disabled ? 'on' : 'off'}.`);
  const remove = (p) => run(() => deleteUser(p.uid), `${p.name} was deleted.`);

  if (adding) return <UserForm isNew onSave={add} onCancel={() => setAdding(false)} />;
  if (editing) return <UserForm initial={editing} onSave={edit} onCancel={() => setEditing(null)} />;

  let body;
  if (users.loading) body = <Loading label="Loading users…" />;
  else if (users.error) body = <ErrorState message={users.error} onRetry={users.reload} />;
  else {
    const active = FILTERS.find((f) => f.key === filter);
    const shown = users.data.filter(active.test);
    body = (
      <>
        <div className="filter-chips" role="group" aria-label="Filter users">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`chip filter-chip${filter === f.key ? ' on' : ''}`}
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        {shown.length === 0 ? (
          <Empty title="No users match">Try another filter.</Empty>
        ) : (
          <ul className="plain-list">
            {shown.map((p) => (
              <UserRow
                key={p.uid}
                person={p}
                isSelf={p.uid === user.uid}
                busy={busy}
                onEdit={setEditing}
                onRole={saveRole}
                onToggle={toggle}
                onDelete={remove}
              />
            ))}
          </ul>
        )}
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <h1>Users</h1>
        <button type="button" className="btn" onClick={() => setAdding(true)}>Add a user</button>
      </div>
      {actionError && <p className="alert" role="alert">{actionError}</p>}
      {notice && <p className="alert" role="status">{notice}</p>}
      <section className="card" aria-label="All users">{body}</section>
    </>
  );
}
