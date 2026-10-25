import { useRef } from 'react';
import TeacherDashboard from './shared/TeacherDashboard.jsx';
import {
  ArrowRightIcon, AtomIcon, ChartIcon, CheckIcon, ClockIcon, FireIcon, FlaskIcon, LayersIcon,
  MailIcon, ShieldCheckIcon, SparklesIcon, StarIcon, TrophyIcon, UsersIcon
} from '../../components/icons/icons.jsx';
import { QuoteCard, SectionHead, Tick } from './shared/bits.jsx';

/* ==================== 1. HERO ==================== */
function LessonPreview() {
  return (
    <div className="preview">
      <div className="card notebook">
        <div className="row top-row">
          <div className="media">
            <span className="icon-badge tint-sky"><FlaskIcon /></span>
            <div>
              <p className="eyebrow">Grade 3 · Life Science</p>
              <h3>Why does bread rise?</h3>
            </div>
          </div>
          <span className="chip tint-sun">
            <FireIcon size={14} /><span><span className="sr-only">Current streak: </span>12 days</span>
          </span>
        </div>

        <ul className="chips">
          <li className="chip tint-butter"><ClockIcon size={14} />4 min lesson</li>
          <li className="chip tint-butter"><FlaskIcon size={14} />20 min experiment</li>
          <li className="chip tint-butter"><SparklesIcon size={14} />5 quiz questions</li>
        </ul>

        <div className="panel tint-sky">
          <p className="eyebrow">Materials</p>
          <ul className="check-list">
            {['1 packet yeast', '½ cup warm water', '1 tbsp sugar + 3 drops dish soap'].map((m) => (
              <li key={m}><Tick />{m}</li>
            ))}
          </ul>
        </div>

        <p className="alert">
          <ShieldCheckIcon size={20} />
          <span><b>Safety note:</b> grown-up helper recommended. Wash hands after handling yeast, and do not taste the experiment.</span>
        </p>

        <div className="progress-row">
          <span>Experiment · Step 2 of 4</span><b>Quiz unlocks after</b>
        </div>
        <div className="bar" role="progressbar" aria-valuenow={50} aria-valuemin={0} aria-valuemax={100} aria-label="Lesson progress: step 2 of 4">
          <i style={{ width: '50%' }} />
        </div>

        <ul className="chips">
          <li className="chip tint-sun"><StarIcon size={14} />Bubble Builder</li>
          <li className="chip tint-leaf"><StarIcon size={14} />Hypothesis Hero</li>
          <li className="chip tint-lav"><StarIcon size={14} />Quiz Whiz</li>
        </ul>
      </div>
      <p className="chip tint-leaf float-chip a"><CheckIcon size={14} strokeWidth="3" />Quiz score 5/5</p>
      <p className="chip tint-sun float-chip b"><StarIcon size={14} />New badge: Bubble Master</p>
    </div>
  );
}

function Hero({ go, auth }) {
  return (
    <section id="top" className="container mk-hero">
      <div>
        <p className="chip tint-butter"><SparklesIcon size={14} />Grades K–5 · Standards-aligned · Safety-reviewed</p>
        <h1 className="display">Science they can <mark>do</mark>, not just watch.</h1>
        <p className="lead">
          GG Learn turns elementary science into bite-sized lessons, real kitchen-counter experiments,
          and quick quizzes, so kids build the habit of asking <b>“why?”</b> and keep coming back for more.
        </p>
        <div className="cta-row">
          <button className="btn lg" onClick={() => auth('register')}>Get started free <ArrowRightIcon size={18} /></button>
          <button className="btn lg plain" onClick={() => go('teachers')}>For teachers</button>
        </div>
        <ul className="trust-line">
          {['Free for families', 'No credit card', 'Classroom pilot available'].map((t) => (
            <li key={t}><Tick />{t}</li>
          ))}
        </ul>
      </div>
      <LessonPreview />
    </section>
  );
}

/* ==================== 2. VALUE PROPS ==================== */
const CARDS = [
  { Icon: FlaskIcon, tone: 'tint-peach', title: 'Real experiments, safety built in', link: 'How we review safety', href: '#safety',
    body: 'Every experiment ships with a materials list, numbered steps, and a plain-language safety note, reviewed by science educators before it reaches a classroom.' },
  { Icon: LayersIcon, tone: 'tint-leaf', title: 'Bite-sized lessons by grade', link: 'Browse the curriculum', page: 'teachers',
    body: 'Four-minute lessons mapped to K–5 science standards. Pick a grade and a topic and get exactly one clear idea to explore today.' },
  { Icon: TrophyIcon, tone: 'tint-sun', title: 'Badges and streaks that stick', link: 'See how rewards work', href: '#how-it-works',
    body: 'Small wins get celebrated out loud: a badge for a finished experiment, a streak for showing up all week. Motivation without the pressure.' },
  { Icon: ChartIcon, tone: 'tint-sky', title: 'Teacher dashboards', link: 'Teacher dashboard tour', page: 'teachers',
    body: 'See who is on track, who is stuck, and which step needs reteaching, per student and per lesson, without exporting a spreadsheet.' }
];

function ValueProps({ go }) {
  return (
    <section id="features" aria-labelledby="features-title" className="section">
      <div className="container">
        <SectionHead eyebrow="Why families and classrooms choose it" id="features-title"
          title="Everything a science kid needs. Nothing they don’t." />
        <ul className="grid g4">
          {CARDS.map(({ Icon, tone, title, body, link, href, page }) => (
            <li key={title} className="card">
              <span className={`icon-badge ${tone}`}><Icon /></span>
              <h3>{title}</h3>
              <p>{body}</p>
              {page
                ? <button type="button" className="link" onClick={() => go(page)}>{link} →</button>
                : <a className="link" href={href}>{link} →</a>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ==================== 3. HOW IT WORKS ==================== */
const STEPS = [
  { n: '1', tone: 'tint-sky', title: 'Enroll in a course', chip: 'Course + class code',
    body: 'Choose a grade-level science course and join with a class code, or create a family account and learn together at home.' },
  { n: '2', tone: 'tint-butter', title: 'Learn by doing', chip: 'Lesson · Experiment · Quiz',
    body: 'Work through a short lesson, run the experiment with its safety notes beside you, then take a quick quiz to check what stuck.' },
  { n: '3', tone: 'tint-leaf', title: 'Earn badges, keep streaks', chip: 'Badges · Streaks · Progress',
    body: 'Collect badges for finished experiments and quiz wins, keep a daily streak alive, and watch progress grow on the family dashboard.' }
];

function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="section alt">
      <div className="container">
        <SectionHead eyebrow="How it works" id="how-title" title="Three steps from curious to confident"
          sub="One loop, repeated all year. Kids always know what to do next." />
        <ol className="grid g3 steps">
          {STEPS.map((s) => (
            <li key={s.n} className="card">
              <span className={`step-num ${s.tone}`}>{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              <p className="chip tint-butter"><SparklesIcon size={14} />{s.chip}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ==================== 4. SOCIAL PROOF ==================== */
const STATS = [
  { value: '1,200+', label: 'classrooms' },
  { value: '48,000', label: 'learners' },
  { value: '320+', label: 'safety-reviewed experiments' },
  { value: '4.9/5', label: 'average parent rating' }
];
const TRUST = [
  { Icon: ShieldCheckIcon, tone: 'tint-leaf', title: 'Safety-reviewed', body: 'Every experiment vetted by science educators.' },
  { Icon: CheckIcon, tone: 'tint-sky', title: 'NGSS-aligned', body: 'Maps to K–5 science standards.' },
  { Icon: UsersIcon, tone: 'tint-lav', title: 'No ads. No chat.', body: 'Kid-safe by design, not by policy page.' },
  { Icon: FlaskIcon, tone: 'tint-peach', title: 'Cheap materials', body: 'Most experiments use kitchen staples.' }
];
// Placeholder quotes: swap for real, permissioned testimonials before launch.
const QUOTES = [
  { quote: 'My daughter asks “why?” at dinner now instead of asking for a tablet. That alone was worth signing up.', name: 'Priya R.', role: 'Parent of a 2nd grader', initials: 'PR', tone: 'tint-leaf' },
  { quote: 'One glance tells me which eight kids are stuck on step three. That saved me a whole Friday of reteaching.', name: 'Marcus D.', role: '4th grade teacher', initials: 'MD', tone: 'tint-sky' },
  { quote: 'The safety notes are written for real classrooms, and for real parents doing experiments at 7pm.', name: 'Dr. Alina V.', role: 'Science education specialist', initials: 'AV', tone: 'tint-sun' }
];

function SocialProof() {
  return (
    <section id="safety" aria-labelledby="proof-title" className="section">
      <div className="container">
        <dl className="card notebook stat-grid">
          {STATS.map((s) => (
            <div key={s.label} className="stat">
              <dt className="sr-only">{s.label}</dt>
              <dd><b>{s.value}</b><span>{s.label}</span></dd>
            </div>
          ))}
        </dl>

        <h2 id="proof-title" className="center-title">Trusted by grown-ups, loved by eight-year-olds</h2>
        <ul className="grid g3">{QUOTES.map((q) => <QuoteCard key={q.name} q={q} />)}</ul>

        <ul className="grid g4 trust">
          {TRUST.map(({ Icon, tone, title, body }) => (
            <li key={title} className="panel media">
              <span className={`icon-badge ${tone}`}><Icon size={20} /></span>
              <span><b>{title}</b><small>{body}</small></span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ==================== 5. TEACHERS vs PARENTS ==================== */
function ParentCard() {
  const CHECKS = ['Reviewed by a science educator', 'Grown-up supervision flagged where needed', 'Materials: kitchen staples only'];
  return (
    <div className="stack">
      <div className="card notebook">
        <h3 className="media"><span className="icon-badge tint-leaf"><ShieldCheckIcon size={20} /></span>Safety check: every experiment</h3>
        <ul className="check-list">{CHECKS.map((c) => <li key={c}><Tick />{c}</li>)}</ul>
      </div>
      <div className="card notebook">
        <h3>This week for Sam</h3>
        <dl className="mini-stats">
          {[['4', 'Lessons'], ['1', 'Badge'], ['12', 'Day streak']].map(([v, l]) => (
            <div key={l} className="panel tint-butter"><dt className="sr-only">{l}</dt><dd><b>{v}</b><span>{l}</span></dd></div>
          ))}
        </dl>
        <p className="media"><span className="icon-badge tint-sun small"><StarIcon size={14} /></span>Asked a great question during today’s lesson.</p>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'teachers', label: 'For teachers', heading: 'Walk in with a plan, walk out with data.',
    body: 'Build a course once, assign it to your class, and see exactly where every student is, without a single stack of papers.',
    points: ['Author your own courses: lessons, experiments with safety notes, and quizzes', 'Class dashboard shows per-student progress, quiz scores, and stuck steps', 'Export standards-mapped progress for reporting in one click'],
    cta: 'Get the teacher demo', visual: <TeacherDashboard /> },
  { id: 'parents', label: 'For parents', heading: 'Know exactly what they’re doing, and that it’s safe.',
    body: 'A weekly view of what your child explored, plus safety review on every single experiment before they touch it.',
    points: ['Every experiment carries a materials list and a plain-language safety note', 'Weekly summary: lessons finished, badges earned, streak status', 'No ads, no open chat, no selling personal data. Ever.'],
    cta: 'Start your family account', visual: <ParentCard /> }
];

function AudienceSection({ tab: active, setTab, go, auth }) {
  const refs = useRef([]);
  const onKeyDown = (e) => {
    const keys = {
      ArrowRight: () => (active + 1) % TABS.length,
      ArrowLeft: () => (active - 1 + TABS.length) % TABS.length,
      Home: () => 0,
      End: () => TABS.length - 1
    };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const next = keys[e.key]();
    setTab(next);
    refs.current[next]?.focus();
  };
  const t = TABS[active];

  return (
    <section id="audience" aria-labelledby="audience-title" className="section">
      <div className="container">
        <SectionHead eyebrow="Two audiences, one classroom reality" id="audience-title"
          title="Built for the teacher. Reassuring for the parent." />
        <div className="tabs audience-tabs" role="tablist" aria-label="Choose your role" onKeyDown={onKeyDown}>
          {TABS.map((x, i) => (
            <button key={x.id} ref={(el) => (refs.current[i] = el)} className="tab" role="tab" id={`tab-${x.id}`}
              aria-selected={i === active} aria-controls={i === active ? `panel-${x.id}` : undefined} tabIndex={i === active ? 0 : -1}
              onClick={() => setTab(i)}>{x.label}</button>
          ))}
        </div>

        <div role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} tabIndex={0} className="card notebook split">
          <div>
            <h3 className="big">{t.heading}</h3>
            <p className="lead">{t.body}</p>
            <ul className="check-list">{t.points.map((p) => <li key={p}><Tick />{p}</li>)}</ul>
            <div className="cta-row">
              <button className="btn" onClick={() => (t.id === 'teachers' ? go('teachers') : auth('register'))}>
                {t.cta} <ArrowRightIcon size={16} />
              </button>
              <a className="btn plain" href={t.id === 'teachers' ? '#how-it-works' : '#safety'}>
                {t.id === 'teachers' ? <ChartIcon size={16} /> : <FlaskIcon size={16} />} See what’s inside
              </a>
            </div>
          </div>
          <div>{t.visual}</div>
        </div>

        <ul className="grid g3 trust">
          {[[UsersIcon, 'Siblings and classrooms share one course library'], [MailIcon, 'Human support: a real person replies within one day'], [FireIcon, 'Streaks are encouraged, never punished or lost']].map(([Icon, text]) => (
            <li key={text} className="panel media center-media"><Icon size={20} />{text}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ==================== 6. FINAL CTA ==================== */
function FinalCta({ go, auth }) {
  return (
    <section id="start" aria-labelledby="cta-title" className="section">
      <div className="container">
        <div className="cta-band">
          <AtomIcon size={44} className="icon deco" />
          <p className="chip tint-butter"><SparklesIcon size={14} />Free to start · Takes about two minutes</p>
          <h2 id="cta-title" className="display">Turn every “why?” into a habit.</h2>
          <p className="lead">Create a family account in a couple of minutes, or book a 20-minute classroom demo and see your first course built live.</p>
          <div className="cta-row center">
            <button className="btn lg green" onClick={() => auth('register')}>Get started free <ArrowRightIcon size={18} /></button>
            <button className="btn lg plain" onClick={() => go('teachers')}>For teachers</button>
          </div>
          <ul className="trust-line center">
            {['No credit card', 'Cancel anytime', 'Kid-safe by design'].map((x) => <li key={x}><Tick />{x}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function HomePage({ aud, setAud, go, auth }) {
  return (
    <>
      <Hero go={go} auth={auth} />
      <ValueProps go={go} />
      <HowItWorks />
      <SocialProof />
      <AudienceSection tab={aud} setTab={setAud} go={go} auth={auth} />
      <FinalCta go={go} auth={auth} />
    </>
  );
}
