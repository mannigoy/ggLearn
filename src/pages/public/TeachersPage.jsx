import { useState } from 'react';
import TeacherDashboard from './shared/TeacherDashboard.jsx';
import { ArrowRightIcon, BookIcon, ChartIcon, FlaskIcon, LayersIcon, ShieldCheckIcon, SparklesIcon, UsersIcon } from '../../components/icons/icons.jsx';
import { QuoteCard, SectionHead, Tick } from './shared/bits.jsx';

/* ==================== 1. TEACHERS HERO ==================== */
function CourseBuilderPreview() {
  const blocks = [
    { kind: 'Lesson', meta: '4 min', Icon: BookIcon, tone: 'tint-leaf' },
    { kind: 'Experiment', meta: '20 min', Icon: FlaskIcon, tone: 'tint-peach' },
    { kind: 'Quiz', meta: '5 items', Icon: SparklesIcon, tone: 'tint-lav' }
  ];
  return (
    <div className="card notebook">
      <div className="row">
        <div>
          <p className="eyebrow">Course builder</p>
          <h3>Grade 3 · Living Things</h3>
        </div>
        <span className="chip tint-butter">Draft</span>
      </div>
      <p><b>Lesson 4: How plants move water</b></p>
      <ul className="plain-list">
        {blocks.map(({ kind, meta, Icon, tone }) => (
          <li key={kind} className="panel media">
            <span className={`icon-badge small ${tone}`}><Icon size={18} /></span>
            <span className="grow"><b>{kind}</b><small>{meta}</small></span>
            <span className="chip">Edit</span>
          </li>
        ))}
      </ul>
      <div className="alert">
        <ShieldCheckIcon size={20} />
        <span><b>Safety note (required)</b><br />Water only. No glasses at the table. Wipe the surface afterwards.</span>
      </div>
      <ul className="chips">
        <li className="chip tint-leaf">3-LS1-2</li>
        <li className="chip tint-leaf">3-5-ETS1-3</li>
        <li className="chip tint-leaf">Safety reviewed ✓</li>
      </ul>
      <div className="cta-row">
        <span className="btn small green">Publish</span>
        <span className="btn small plain">Assign to 2 classes</span>
      </div>
    </div>
  );
}

function TeachersHero() {
  return (
    <section id="top" className="container mk-hero">
      <div>
        <p className="chip tint-butter"><UsersIcon size={14} />For teachers and schools · Grades K–5</p>
        <h1 className="display">Bring real science to class. Skip the prep work.</h1>
        <p className="lead">
          Build a course once (lessons, experiments with safety notes, and quizzes), then assign it to your
          class and watch progress arrive on one screen. Free pilot for one term.
        </p>
        <div className="cta-row">
          <a className="btn lg" href="#pilot">Book a 20-minute demo <ArrowRightIcon size={18} /></a>
          <a className="btn lg plain" href="#sample-course">See a sample course</a>
        </div>
        <ul className="trust-line">
          {['No prep to get started', 'Roster import in minutes', 'Cancel any time'].map((t) => <li key={t}><Tick />{t}</li>)}
        </ul>
      </div>
      <CourseBuilderPreview />
    </section>
  );
}

/* ==================== 2. SCHOOLS + STATS ==================== */
const SCHOOLS = ['Oakridge Elementary', 'Riverbend School', 'Maple Grove K–8', 'Lakeside STEM Academy', 'Fairview Primary'];
const T_STATS = [
  { v: '4 hrs', l: 'saved per week on prep' },
  { v: '320+', l: 'ready-to-use experiments' },
  { v: '1,200+', l: 'classrooms onboard' },
  { v: '2 hrs', l: 'live professional development included' }
];

function SchoolStrip() {
  return (
    <section aria-label="Schools using GG Learn" className="section alt tight">
      <div className="container">
        <p className="eyebrow center-text">Built with science teachers and used by</p>
        <ul className="school-list">{SCHOOLS.map((s) => <li key={s}>{s}</li>)}</ul>
        <dl className="grid g4">
          {T_STATS.map((s) => (
            <div key={s.l} className="card stat">
              <dt className="sr-only">{s.l}</dt>
              <dd><b>{s.v}</b><span>{s.l}</span></dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ==================== 3. TEACHER VALUE PROPS ==================== */
const T_PROPS = [
  { Icon: LayersIcon, tone: 'tint-leaf', title: 'A whole unit in an afternoon', body: 'Start from a template or your own notes. Lessons, experiments, and quizzes snap together in order, with no formatting and no add-ons.' },
  { Icon: ShieldCheckIcon, tone: 'tint-peach', title: 'Safety is a required field', body: 'Every experiment asks for materials, steps, and a safety note before it can be published. Nothing reaches a kid unfinished.' },
  { Icon: ChartIcon, tone: 'tint-sky', title: 'Progress you can act on', body: 'Per-student completion, quiz scores, and the exact step where a class got stuck, filterable by lesson.' },
  { Icon: BookIcon, tone: 'tint-butter', title: 'Standards mapped by default', body: 'Courses carry NGSS codes from the start, so reporting is a click instead of a Friday-night project.' }
];

function TeacherProps() {
  return (
    <section aria-labelledby="t-props" className="section">
      <div className="container">
        <SectionHead eyebrow="Why teachers switch" id="t-props" title="Less prep. More science. Fewer missing worksheets." />
        <ul className="grid g4">
          {T_PROPS.map(({ Icon, tone, title, body }) => (
            <li key={title} className="card">
              <span className={`icon-badge ${tone}`}><Icon /></span>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ==================== 4. HOW IT WORKS ==================== */
const T_STEPS = [
  { n: '1', tone: 'tint-sky', title: 'Create a course', body: 'Pick a grade and a unit, or start from scratch. Add lessons, experiments, and quizzes in the order you teach them.' },
  { n: '2', tone: 'tint-butter', title: 'Add the experiment', body: 'Type the materials, number the steps, and fill in the safety note. Publishing is blocked until all three are done.' },
  { n: '3', tone: 'tint-leaf', title: 'Assign and watch', body: 'Push it to a class with one click. Completion, scores, and stuck points land on your dashboard as they work.' }
];

function TeacherHowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="t-how" className="section alt">
      <div className="container">
        <SectionHead eyebrow="How it works" id="t-how" title="Three steps, then you are teaching" />
        <ol className="grid g3 steps">
          {T_STEPS.map((s) => (
            <li key={s.n} className="card">
              <span className={`step-num ${s.tone}`}>{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ==================== 5. SAMPLE COURSES ==================== */
const COURSES = [
  { grade: 'Grade 3', name: 'Living Things', units: 5, lessons: 27, topics: ['What living things need', 'Plant parts and jobs', 'Life cycles'] },
  { grade: 'Grade 4', name: 'Matter and Energy', units: 4, lessons: 22, topics: ['States of matter', 'Light and shadow', 'Simple machines'] },
  { grade: 'Grade 5', name: 'Earth and Space', units: 5, lessons: 24, topics: ['Water cycle', 'Day and night', 'Renewable energy'] }
];

function SampleCourse() {
  return (
    <section id="sample-course" aria-labelledby="t-course" className="section">
      <div className="container split">
        <div>
          <p className="eyebrow">Curriculum preview</p>
          <h2 id="t-course">Fork it, or bring your own</h2>
          <p className="lead">Every course is a starting point. Duplicate one, change the order, swap an experiment for your own. It is your unit the moment you edit it.</p>
          <ul className="plain-list">
            {COURSES.map((c) => (
              <li key={c.grade} className="card">
                <div className="chips">
                  <span className="chip tint-leaf">{c.grade}</span>
                  <h3 className="inline">{c.name}</h3>
                  <span className="muted">{c.units} units · {c.lessons} lessons</span>
                </div>
                <ul className="chips">{c.topics.map((t) => <li key={t} className="chip">{t}</li>)}</ul>
              </li>
            ))}
          </ul>
        </div>
        <div id="dashboard">
          <h3 className="center-text">What Monday morning looks like</h3>
          <TeacherDashboard />
        </div>
      </div>
    </section>
  );
}

/* ==================== 6. QUOTES ==================== */
// Placeholder quotes: swap for real, permissioned testimonials before launch.
const T_QUOTES = [
  { quote: 'I built our whole plants unit on a Sunday. By Friday every kid had run an experiment and I had the data already sorted.', name: 'Marcus D.', role: '4th grade teacher, 24 students', initials: 'MD', tone: 'tint-leaf' },
  { quote: 'The safety notes are written the way I would write them. That is the part I was missing everywhere else.', name: 'Elena R.', role: 'Science lead, K–5', initials: 'ER', tone: 'tint-sun' },
  { quote: 'Roster import took four minutes. I had the pilot running before the staff meeting ended.', name: 'Tobias N.', role: 'Instructional coach', initials: 'TN', tone: 'tint-sky' }
];

function TeacherQuotes() {
  return (
    <section aria-labelledby="t-quotes" className="section alt">
      <div className="container">
        <h2 id="t-quotes" className="center-title">Teachers talk about their Friday afternoons</h2>
        <ul className="grid g3">{T_QUOTES.map((q) => <QuoteCard key={q.name} q={q} />)}</ul>
      </div>
    </section>
  );
}

/* ==================== 7. PILOT ==================== */
const PILOT = [
  'One free term for every teacher in the pilot',
  'Roster import from a spreadsheet or SIS',
  'Two hours of live professional development',
  'Standards-mapped progress export',
  'A real person on support chat'
];

function PilotBand() {
  return (
    <section id="pilot" aria-labelledby="t-pilot" className="section">
      <div className="container">
        <div className="cta-band split left">
          <div>
            <h2 id="t-pilot" className="display">Run a pilot this term</h2>
            <p className="lead">Pick one unit and one class, free for the whole term. If it is not saving you time, you delete it and walk away.</p>
            <div className="cta-row">
              <a className="btn lg green" href="mailto:schools@gglearn.example?subject=Classroom%20pilot">Start the pilot <ArrowRightIcon size={18} /></a>
              <a className="btn lg plain" href="#faq">Read the FAQ</a>
            </div>
          </div>
          <ul className="check-list card">{PILOT.map((p) => <li key={p}><Tick />{p}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}

/* ==================== 8. FAQ ==================== */
const FAQ = [
  { q: 'What do students need to run a lesson?', a: 'One device per pair of students is enough, and a phone works fine for homework. Lessons download ahead of time, so a flaky classroom connection does not stop the class.' },
  { q: 'What happens to our student data?', a: 'Rosters come from you and stay in your school’s workspace. There are no ads and no student-facing chat. You can export or delete everything at any time.' },
  { q: 'Can we edit the courses you provide?', a: 'Yes. Duplicate a course and it becomes yours: reorder lessons, swap an experiment, or add your own quiz. The safety note field stays required either way.' },
  { q: 'How much does it cost after the pilot?', a: 'Per-teacher pricing with a school-wide option. No per-student fee, and no charge for students who use a shared device.' }
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" aria-labelledby="t-faq" className="section">
      <div className="container narrow">
        <h2 id="t-faq" className="center-title">Questions teachers actually ask</h2>
        <ul className="plain-list">
          {FAQ.map((item, i) => {
            const on = open === i;
            return (
              <li key={item.q} className="card faq">
                <h3>
                  <button type="button" className="faq-q" aria-expanded={on} aria-controls={`faq-panel-${i}`} onClick={() => setOpen(on ? -1 : i)}>
                    {item.q}<span aria-hidden="true">{on ? '−' : '+'}</span>
                  </button>
                </h3>
                <div id={`faq-panel-${i}`} hidden={!on}><p>{item.a}</p></div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default function TeacherPage() {
  return (
    <>
      <TeachersHero />
      <SchoolStrip />
      <TeacherProps />
      <TeacherHowItWorks />
      <SampleCourse />
      <TeacherQuotes />
      <PilotBand />
      <Faq />
    </>
  );
}
