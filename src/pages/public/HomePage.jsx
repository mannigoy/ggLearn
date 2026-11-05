import { useMemo, useState } from 'react';
import Icon, { IconBubble } from '../../components/ui/Icon.jsx';
import { Mascot, Shapes } from '../../components/ui/Paper.jsx';
import { KITCHEN, KITCHEN_LABEL, SHELF, SHELF_COUNT } from './content.js';

/* ==================== Hero ==================== */
const FACTS = [
  { icon: 'book', tone: 'sky', label: 'Lesson', value: '4 min' },
  { icon: 'flask', tone: 'sun', label: 'Experiment', value: '20 min' },
  { icon: 'star', tone: 'mint', label: 'Quiz', value: '5 questions' }
];

function Hero({ go, auth }) {
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <Shapes set="hero" />
      <Mascot size={150} className="hero-mascot" />
      <h1 id="hero-title">Real science at the kitchen table</h1>
      <p className="hero-lead">Four-minute lessons, real experiments with a safety note, and a quick quiz. For kids in grades K–5.</p>
      <ul className="facts">
        {FACTS.map((f) => (
          <li key={f.label}><IconBubble name={f.icon} tone={f.tone} size={26} /><span>{f.label}<b>{f.value}</b></span></li>
        ))}
      </ul>
      <div className="cta-row">
        <button type="button" className="btn big" onClick={() => auth('register')}>Start a free notebook</button>
        <button type="button" className="btn big plain" onClick={() => go('teachers')}>I’m a teacher</button>
      </div>
    </section>
  );
}

/* ==================== How one lesson goes ==================== */
const STEPS = [
  { icon: 'book', tone: 'sky', name: 'Learn', time: '5 min', text: 'Watch a short lesson, then make a guess about what will happen.' },
  { icon: 'flask', tone: 'sun', name: 'Try it', time: '24 min', text: 'Read the safety note with a grown-up, then do the experiment.' },
  { icon: 'star', tone: 'mint', name: 'Check', time: '7 min', text: 'Fill in your notebook page and answer five quick questions.' }
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="section" aria-labelledby="how-title">
      <div className="section-head" data-reveal>
        <h2 id="how-title">How one lesson goes</h2>
        <p>Three steps, the same every time. You always know what comes next.</p>
      </div>
      <ol className="steps">
        {STEPS.map((s, i) => (
          <li key={s.name} className={`step ${s.tone}`} data-reveal>
            <IconBubble name={s.icon} tone={s.tone} size={30} />
            <h3>{s.name}</h3>
            <p>{s.text}</p>
            <span className="chip"><Icon name="clock" size={18} />{s.time}</span>
            <span className="sr-only">Step {i + 1} of 3</span>
          </li>
        ))}
      </ol>
      <div className="reward" data-reveal>
        <div className="reward-bar">
          <p><b>Lesson done!</b><span className="stars" aria-label="3 of 3 stars">{[0, 1, 2].map((n) => <Icon key={n} name="star" size={26} />)}</span></p>
          <div className="progress" role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100} aria-label="Lesson progress"><i style={{ width: '100%' }} /></div>
        </div>
        <div className="reward-badge">
          <IconBubble name="trophy" tone="sun" size={32} />
          <p><b>New badge</b>Bubble Builder</p>
        </div>
      </div>
    </section>
  );
}

/* ==================== The experiment shelf, filtered by the kitchen ==================== */
function Shelf() {
  const [have, setHave] = useState(() => new Set(KITCHEN.filter((k) => k.on).map((k) => k.id)));
  const toggle = (id) => setHave((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const ready = useMemo(
    () => SHELF.flatMap((g) => g.items).filter((x) => x.needs.every((n) => have.has(n))).length,
    [have]
  );

  return (
    <section id="shelf" className="section shelf" aria-labelledby="shelf-title">
      <div className="section-head" data-reveal>
        <h2 id="shelf-title">The experiment shelf</h2>
        <p>Tap what you have at home. We’ll show you what you can try today.</p>
      </div>

      <fieldset className="kitchen" data-reveal>
        <legend><IconBubble name="kitchen" tone="sun" size={26} /><span>What’s in your kitchen?</span></legend>
        <ul>
          {KITCHEN.map((k) => (
            <li key={k.id}>
              <button type="button" className="pick" aria-pressed={have.has(k.id)} onClick={() => toggle(k.id)}>
                <span className="pick-tick" aria-hidden="true"><Icon name="check" size={16} strokeWidth={3.2} /></span>{k.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="kitchen-count" aria-live="polite">
          <p><b>You can try {ready} of {SHELF_COUNT}</b> experiments today</p>
          <div className="progress" role="progressbar" aria-valuenow={ready} aria-valuemin={0} aria-valuemax={SHELF_COUNT} aria-label="Experiments ready today">
            <i style={{ width: `${(ready / SHELF_COUNT) * 100}%` }} />
          </div>
          <p className="muted">Water, jars, cups, tape and paper are already counted.</p>
        </div>
      </fieldset>

      {SHELF.map((g) => (
        <div key={g.topic} className="shelf-group">
          <h3 data-reveal><IconBubble name={g.icon} tone={g.tone} size={26} />{g.topic}</h3>
          <ul className="exp-grid">
            {g.items.map((x) => {
              const missing = x.needs.filter((n) => !have.has(n));
              const ok = missing.length === 0;
              return (
                <li key={x.name} className={`exp${ok ? ' ready' : ''}`}>
                  {ok && <span className="exp-ok"><Icon name="check" size={20} strokeWidth={3.2} /><span className="sr-only">Ready today</span></span>}
                  <h4>{x.name}</h4>
                  <p>{x.about}</p>
                  <div className="exp-meta">
                    <span className="chip"><Icon name="clock" size={16} />{x.time}</span>
                    <span className="chip sun">{x.grade}</span>
                  </div>
                  <p className="exp-need">{ok ? 'Ready today!' : `You need ${missing.map((n) => KITCHEN_LABEL[n]).join(', ')}`}</p>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}

/* ==================== For grown-ups ==================== */
const GROWNUPS = [
  { icon: 'shield', tone: 'coral', title: 'Safe by design', items: ['A safety note on every experiment', 'Grown-up helper flagged when needed', 'Kitchen staples, no lab kit'] },
  { icon: 'home', tone: 'sky', title: 'At home', items: ['A weekly summary every Sunday', 'No ads and no open chat, ever', 'Streaks that forgive a missed day'] },
  { icon: 'users', tone: 'mint', title: 'In class', items: ['Build your own course', 'Class progress on one screen', 'Standards codes on every lesson'] }
];

function GrownUps({ go }) {
  return (
    <section id="grown-ups" className="section" aria-labelledby="grownups-title">
      <div className="section-head" data-reveal>
        <h2 id="grownups-title">For grown-ups</h2>
        <p>What parents and teachers want to know before kids start.</p>
      </div>
      <ul className="trio">
        {GROWNUPS.map((g) => (
          <li key={g.title} className={`trio-card ${g.tone}`} data-reveal>
            <IconBubble name={g.icon} tone={g.tone} size={30} />
            <h3>{g.title}</h3>
            <ul className="ticks">
              {g.items.map((t) => <li key={t}><Icon name="check" size={20} strokeWidth={3} />{t}</li>)}
            </ul>
          </li>
        ))}
      </ul>
      <p className="center"><button type="button" className="btn plain" onClick={() => go('teachers')}>See GG Learn for teachers <Icon name="arrow" size={20} /></button></p>
    </section>
  );
}

/* ==================== A letter to the kid ==================== */
function Letter() {
  return (
    <section id="letter" className="section" aria-labelledby="letter-title">
      <article className="letter" data-reveal>
        <h2 id="letter-title">Dear scientist,</h2>
        <p>Every scientist started by asking why. Why does bread puff up? Why does salt melt ice? How does a bean know which way is up?</p>
        <p>You don’t need a lab to find out. A kitchen table, a jar, a spoon and a grown-up who says yes will do.</p>
        <p>Sometimes your guess will be wrong. That’s the best part, because it means you found something new!</p>
        <p className="letter-sign">The GG Learn team</p>
        <a className="btn small" href="mailto:hello@gglearn.example?subject=My%20why%20question"><Icon name="mail" size={20} />Send us your why question</a>
      </article>
    </section>
  );
}

/* ==================== Start ==================== */
function Start({ go, auth }) {
  return (
    <section id="start" className="section" aria-labelledby="start-title">
      <div className="start" data-reveal>
        <Shapes set="start" />
        <h2 id="start-title">Start your notebook</h2>
        <p>Free for families. No credit card. Your first lesson is ready in two minutes.</p>
        <div className="cta-row">
          <button type="button" className="btn big ink" onClick={() => auth('register')}>Create a free account</button>
          <button type="button" className="link" onClick={() => go('teachers')}>Teaching a class? Start a pilot</button>
        </div>
      </div>
    </section>
  );
}

export default function HomePage({ go, auth }) {
  return (
    <>
      <Hero go={go} auth={auth} />
      <HowItWorks />
      <Shelf />
      <GrownUps go={go} />
      <Letter />
      <Start go={go} auth={auth} />
    </>
  );
}
