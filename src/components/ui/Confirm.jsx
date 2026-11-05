import { useState } from 'react';

export default function Confirm({ label, onYes }) {
  const [on, setOn] = useState(false);

  if (!on) {
    return <button type="button" className="btn small plain" onClick={() => setOn(true)}>{label}</button>;
  }
  return (
    <span className="confirm">
      Sure?
      <button type="button" className="btn small red" onClick={onYes}>Yes</button>
      <button type="button" className="btn small plain" onClick={() => setOn(false)}>No</button>
    </span>
  );
}
