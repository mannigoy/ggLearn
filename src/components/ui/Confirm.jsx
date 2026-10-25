import { useState } from 'react';

export default function Confirm({ label, onYes }) {
  const [on, setOn] = useState(false);

  if (!on) {
    return <button className="btn small plain" onClick={() => setOn(true)}>{label}</button>;
  }
  return (
    <span>
      Sure?{' '}
      <button className="btn small red" onClick={onYes}>Yes</button>{' '}
      <button className="btn small plain" onClick={() => setOn(false)}>No</button>
    </span>
  );
}