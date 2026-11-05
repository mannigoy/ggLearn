/** Edits a list of short texts: one input per row, with remove and reorder. Always keeps one row. */
export default function ListEditor({ id, label, items, onChange, addLabel = 'Add another', max = 30 }) {
  const rows = items.length ? items : [''];
  const set = (next) => onChange(next);
  const edit = (i, value) => set(rows.map((item, n) => (n === i ? value : item)));
  const remove = (i) => set(rows.length > 1 ? rows.filter((_, n) => n !== i) : ['']);
  const move = (i, step) => {
    const next = [...rows];
    [next[i], next[i + step]] = [next[i + step], next[i]];
    set(next);
  };

  return (
    <fieldset className="list-editor">
      <legend className="lab">{label}</legend>
      <ul className="plain-list">
        {rows.map((item, i) => (
          <li key={i} className="list-row">
            <input
              id={`${id}-${i}`}
              aria-label={`${label} ${i + 1}`}
              value={item}
              onChange={(e) => edit(i, e.target.value)}
            />
            <button type="button" className="btn small plain" disabled={i === 0} onClick={() => move(i, -1)}>
              Move up<span className="sr-only"> {label} {i + 1}</span>
            </button>
            <button type="button" className="btn small plain" disabled={i === rows.length - 1} onClick={() => move(i, 1)}>
              Move down<span className="sr-only"> {label} {i + 1}</span>
            </button>
            <button type="button" className="btn small red" onClick={() => remove(i)}>
              Remove<span className="sr-only"> {label} {i + 1}</span>
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="btn small plain"
        disabled={rows.length >= max}
        onClick={() => set([...rows, ''])}
      >
        {addLabel}
      </button>
    </fieldset>
  );
}
