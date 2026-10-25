import { CheckIcon, StarIcon } from '../../../components/icons/icons.jsx';

/** Small leaf-green check circle used in every list. */
export const Tick = ({ tone = '' }) => (
  <span className={`tick ${tone}`} aria-hidden="true">
    <CheckIcon size={12} strokeWidth="3" />
  </span>
);

export const SectionHead = ({ eyebrow, id, title, sub }) => (
  <div className="section-head">
    {eyebrow && <p className="eyebrow">{eyebrow}</p>}
    <h2 id={id}>{title}</h2>
    {sub && <p className="lead">{sub}</p>}
  </div>
);

export const Stars = () => (
  <p className="stars">
    <span className="sr-only">Rated 5 out of 5 stars</span>
    {[0, 1, 2, 3, 4].map((i) => <StarIcon key={i} size={16} />)}
  </p>
);

export const QuoteCard = ({ q }) => (
  <li className="card quote">
    <Stars />
    <blockquote>“{q.quote}”</blockquote>
    <div className="who">
      <span className={`avatar ${q.tone}`} aria-hidden="true">{q.initials}</span>
      <span><b>{q.name}</b><small>{q.role}</small></span>
    </div>
  </li>
);
