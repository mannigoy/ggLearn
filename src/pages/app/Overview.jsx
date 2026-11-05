import Icon, { IconBubble } from '../../components/ui/Icon.jsx';
import { Mascot } from '../../components/ui/Paper.jsx';
import { ROLE_LABELS, ROLES } from '../../constants/index.js';

// Experiments that need nothing beyond water, jars, tape and paper.
const TRY_NOW = [
  { name: 'Fingerprint detectives', time: '15 min', icon: 'sparkle', tone: 'sky' },
  { name: 'Sink or float?', time: '15 min', icon: 'drop', tone: 'mint' },
  { name: 'The shadow clock', time: 'All day', icon: 'clock', tone: 'sun' }
];
const BADGES = [
  { name: 'First experiment', icon: 'flask', tone: 'sky' },
  { name: 'Quiz whiz', icon: 'star', tone: 'sun' },
  { name: 'Three in a row', icon: 'trophy', tone: 'mint' }
];

export default function Overview({ user, pendingCount, go }) {
  return (
    <>
      <div className="overview-hero">
        <Mascot size={120} />
        <h1>Hi, {user.name}!</h1>
        <p className="muted">Signed in as {ROLE_LABELS[user.role] ?? user.role} · {user.email}</p>
      </div>

      {user.role === ROLES.PENDING_TEACHER && (
        <p className="alert" role="status">
          Your teacher account is waiting for an admin to approve it. You’ll get teacher tools as soon as it’s approved. This page updates by itself.
        </p>
      )}
      {user.role === ROLES.ADMIN && pendingCount > 0 && (
        <div className="alert">
          <span className="grow">{pendingCount} teacher {pendingCount === 1 ? 'request is' : 'requests are'} waiting for approval.</span>
          <button type="button" className="btn small" onClick={() => go({ name: 'admin' })}>Review requests</button>
        </div>
      )}

      <p className="overview-cta">
        <button type="button" className="btn big" onClick={() => go({ name: 'courses' })}>Go to my courses</button>
      </p>

      <section className="card overview-progress" aria-labelledby="ov-progress">
        <h2 id="ov-progress">Your progress</h2>
        <p>
          <span>0 of 3 experiments tried</span>
          <span className="stars" aria-label="0 of 3 stars">{[0, 1, 2].map((n) => <Icon key={n} name="star" size={26} className="off" />)}</span>
        </p>
        <div className="progress" role="progressbar" aria-valuenow={0} aria-valuemin={0} aria-valuemax={3} aria-label="Experiments tried"><i style={{ width: '0%' }} /></div>
        <ul className="badge-row" aria-label="Badges to unlock">
          {BADGES.map((b) => (
            <li key={b.name} className="badge locked">
              <IconBubble name="lock" tone={b.tone} size={30} />
              {b.name}
            </li>
          ))}
        </ul>
      </section>

      <section className="card" aria-labelledby="ov-try">
        <h2 id="ov-try">Try one today, no shopping needed</h2>
        <ul className="plain-list">
          {TRY_NOW.map((x) => (
            <li key={x.name} className="item">
              <IconBubble name={x.icon} tone={x.tone} size={24} />
              <b className="grow">{x.name}</b>
              <span className="chip sun"><Icon name="clock" size={16} />{x.time}</span>
            </li>
          ))}
        </ul>
        <p className="muted" style={{ marginTop: 16 }}>Your teacher’s lessons will show up here soon.</p>
      </section>
    </>
  );
}
