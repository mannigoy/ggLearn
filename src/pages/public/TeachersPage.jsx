import { useState } from 'react';
import Icon, { IconBubble } from '../../components/ui/Icon.jsx';
import { Shapes } from '../../components/ui/Paper.jsx';
import TeacherDashboard from './shared/TeacherDashboard.jsx';

/* ==================== Hero ==================== */
const FACTS = [
  { icon: 'users', tone: 'sky', label: 'Grades', value: 'K–5' },
  { icon: 'book', tone: 'sun', label: 'Courses', value: '3 to start' },
  { icon: 'trophy', tone: 'mint', label: 'Pilot', value: '1 free term' }
];

function TeachersHero({ go }) {
  return (
    <section id="top" className="hero" aria-labelledby="t-hero-title">
      <Shapes set="hero" />
      <IconBubble name="chart" tone="sky" size={44} />
      <h1 id="t-hero-title">Science class, ready by Monday</h1>
      <p className="hero-lead">Build a course once, assign it to your class, and watch progress arrive on one screen.</p>
      <ul className="facts">
        {FACTS.map((f) => (
          <li key={f.label}><IconBubble name={f.icon} tone={f.tone} size={26} /><span>{f.label}<b>{f.value}</b></span></li>
        ))}
      </ul>
      <div className="cta-row">
        <a className="btn big" href="#pilot">Start a free pilot</a>
        <button type="button" className="btn big plain" onClick={() => go('home')}>I’m a parent</button>
      </div>
    </section>
  );
}

/* ==================== How a course comes together ==================== */
const STEPS = [
  { icon: 'pencil', tone: 'sky', name: 'Plan the unit', time: '25 min', text: 'Pick a grade and a unit, then put lessons in your teaching order.' },
  { icon: 'flask', tone: 'sun', name: 'Add experiments', time: 'required', text: 'Materials, numbered steps and a safety note. Publishing waits until all three are in.' },
  { icon: 'users', tone: 'mint', name: 'Assign it', time: '1 click', text: 'Push it to a class. Progress arrives as students work.' }
];

function TeacherHowItWorks() {
  return (
    <section id="how-it-works" className="section" aria-labelledby="t-how">
      <div className="section-head" data-reveal>
        <h2 id="t-how">How a course comes together</h2>
        <p>One afternoon from blank page to a unit your class can run.</p>
      </div>
      <ol className="steps">
        {STEPS.map((s) => (
          <li key={s.name} className={`step ${s.tone}`} data-reveal>
            <IconBubble name={s.icon} tone={s.tone} size={30} />
            <h3>{s.name}</h3>
            <p>{s.text}</p>
            <span className="chip"><Icon name="clock" size={18} />{s.time}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ==================== Courses ==================== */
const COURSES = [
  { icon: 'leaf', tone: 'mint', name: 'Living Things', grade: 'Grade 3', meta: '5 units · 27 lessons', topics: ['What living things need', 'Plant parts and their jobs', 'Life cycles', 'Traits and families', 'Living together'] },
  { icon: 'bolt', tone: 'coral', name: 'Matter and Energy', grade: 'Grade 4', meta: '4 units · 22 lessons', topics: ['States of matter', 'Light and shadow', 'Simple machines', 'Energy on the move'] },
  { icon: 'globe', tone: 'sky', name: 'Earth and Space', grade: 'Grade 5', meta: '5 units · 24 lessons', topics: ['The water cycle', 'Day and night', 'Rocks and soil', 'Weather and climate', 'Renewable energy'] }
];

function Courses() {
  return (
    <section id="courses" className="section" aria-labelledby="t-courses">
      <div className="section-head" data-reveal>
        <h2 id="t-courses">Courses to start from</h2>
        <p>Duplicate one and it’s yours: change the order, swap an experiment, add your own quiz.</p>
      </div>
      <ul className="trio">
        {COURSES.map((c) => (
          <li key={c.name} className={`trio-card ${c.tone}`} data-reveal>
            <IconBubble name={c.icon} tone={c.tone} size={30} />
            <span className="chip sun">{c.grade}</span>
            <h3>{c.name}</h3>
            <p className="muted">{c.meta}</p>
            <ul className="ticks">{c.topics.map((t) => <li key={t}><Icon name="check" size={20} strokeWidth={3} />{t}</li>)}</ul>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ==================== Dashboard ==================== */
function Dashboard() {
  return (
    <section id="dashboard" className="section" aria-labelledby="t-dash">
      <div className="section-head" data-reveal>
        <h2 id="t-dash">What Monday morning looks like</h2>
        <p>Who finished, who is on track, and which step needs a reteach, before the first bell.</p>
      </div>
      <div className="dash-ui" data-reveal><TeacherDashboard /></div>
    </section>
  );
}

/* ==================== Pilot ==================== */
const PILOT = ['A free term for every teacher', 'Roster import from a spreadsheet', 'Two hours of live training', 'A real person on support'];

function Pilot() {
  return (
    <section id="pilot" className="section" aria-labelledby="t-pilot">
      <div className="start" data-reveal>
        <Shapes set="start" />
        <h2 id="t-pilot">Run a pilot this term</h2>
        <p>Pick one unit and one class. If it isn’t saving you time, delete it and walk away.</p>
        <ul className="ticks inline">{PILOT.map((p) => <li key={p}><Icon name="check" size={20} strokeWidth={3} />{p}</li>)}</ul>
        <div className="cta-row">
          <a className="btn big ink" href="mailto:schools@gglearn.example?subject=Classroom%20pilot"><Icon name="mail" size={22} />Email us to start</a>
        </div>
      </div>
    </section>
  );
}

/* ==================== FAQ ==================== */
const FAQ = [
  { q: 'What do students need to run a lesson?', a: 'One device per pair of students is enough, and a phone works for homework. Lessons download ahead of time, so a slow classroom connection does not stop the class.' },
  { q: 'What happens to our student data?', a: 'Rosters come from you and stay in your school’s workspace. There are no ads and no student chat. You can export or delete everything at any time.' },
  { q: 'Can we edit the courses you provide?', a: 'Yes. Duplicate a course and it becomes yours: reorder lessons, swap an experiment, or add your own quiz. The safety note stays required either way.' },
  { q: 'How much does it cost after the pilot?', a: 'Per-teacher pricing with a school-wide option. No per-student fee, and no charge for students who share a device.' }
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="section" aria-labelledby="t-faq">
      <div className="section-head" data-reveal><h2 id="t-faq">Questions teachers ask</h2></div>
      <ul className="faq-list">
        {FAQ.map((item, i) => {
          const on = open === i;
          return (
            <li key={item.q}>
              <h3>
                <button type="button" className="faq-q" aria-expanded={on} aria-controls={`faq-panel-${i}`} onClick={() => setOpen(on ? -1 : i)}>
                  {item.q}<span className="faq-plus" aria-hidden="true">+</span>
                </button>
              </h3>
              <div id={`faq-panel-${i}`} hidden={!on}><p>{item.a}</p></div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function TeachersPage({ go }) {
  return (
    <>
      <TeachersHero go={go} />
      <TeacherHowItWorks />
      <Courses />
      <Dashboard />
      <Pilot />
      <Faq />
    </>
  );
}
