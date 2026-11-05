import { useState } from 'react';
import Confirm from '../../components/ui/Confirm.jsx';
import { Empty, ErrorState, Loading } from '../../components/ui/States.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { awardBadge, listCourseBadges, renameBadge, revokeBadge } from '../../services/badgeApi.js';
import { listRoster } from '../../services/enrollmentApi.js';
import BadgeForm from '../badges/BadgeForm.jsx';

const day = (iso) => (iso ? new Date(iso).toLocaleDateString() : '');

function RenameRow({ badge, onSave, onCancel }) {
  const [title, setTitle] = useState(badge.title);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const clean = title.trim();
    if (clean.length < 2 || clean.length > 120) {
      setError('Use 2 to 120 characters.');
      return;
    }
    setBusy(true);
    try {
      await onSave(clean);
    } catch (err) {
      setError(err.fields?.title ?? err.message);
      setBusy(false);
    }
  };

  return (
    <form className="list-row" onSubmit={submit} noValidate>
      <input aria-label={`New title for ${badge.title}`} value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} />
      <button type="submit" className="btn small" disabled={busy}>
        Save<span className="sr-only"> {badge.title}</span>
      </button>
      <button type="button" className="btn small plain" disabled={busy} onClick={onCancel}>
        Cancel<span className="sr-only"> renaming {badge.title}</span>
      </button>
      {error && <p className="err" role="alert">{error}</p>}
    </form>
  );
}

export default function BadgesTab({ courseId }) {
  const badges = useAsync(() => listCourseBadges(courseId), [courseId]);
  const roster = useAsync(() => listRoster(courseId), [courseId]);
  const [renaming, setRenaming] = useState('');
  const [actionError, setActionError] = useState('');

  const award = async ({ userUid, title }) => {
    await awardBadge({ courseId, userUid, title });
    badges.reload();
  };
  const rename = async (badge, title) => {
    await renameBadge(badge.id, { title });
    setRenaming('');
    badges.reload();
  };
  const revoke = async (badge) => {
    setActionError('');
    try {
      await revokeBadge(badge.id);
      badges.reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  let list;
  if (badges.loading) list = <Loading label="Loading badges…" />;
  else if (badges.error) list = <ErrorState message={badges.error} onRetry={badges.reload} />;
  else if (badges.data.length === 0) list = <Empty title="No badges awarded yet" />;
  else {
    list = (
      <ul className="plain-list">
        {badges.data.map((b) => (
          <li key={b.id} className="item">
            {renaming === b.id ? (
              <RenameRow badge={b} onSave={(title) => rename(b, title)} onCancel={() => setRenaming('')} />
            ) : (
              <>
                <span className="grow">
                  <b>{b.title}</b>
                  <small className="muted">{b.userName} on {day(b.dateEarned)}</small>
                </span>
                <button type="button" className="btn small plain" onClick={() => setRenaming(b.id)}>
                  Rename<span className="sr-only"> {b.title} for {b.userName}</span>
                </button>
                <Confirm label={<>Revoke<span className="sr-only"> {b.title} from {b.userName}</span></>} onYes={() => revoke(b)} />
              </>
            )}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="card" aria-label="Badges">
      <h2>Badges</h2>
      {actionError && <p className="alert" role="alert">{actionError}</p>}
      {list}
      {roster.loading && <Loading label="Loading students…" />}
      {!roster.loading && roster.error && <ErrorState message={roster.error} onRetry={roster.reload} />}
      {!roster.loading && !roster.error && <BadgeForm roster={roster.data} onSave={award} />}
    </section>
  );
}
