/**
 * Errors to show on a form after the server rejected it. `shown` lists the field keys the form
 * renders. If the server names none of them (for example `materials[0]`), show its message
 * at the top of the form instead of silently dropping it.
 */
export function serverErrors(err, shown) {
  const fields = err?.fields ?? {};
  const keep = Object.fromEntries(Object.entries(fields).filter(([key]) => shown.includes(key)));
  return Object.keys(keep).length ? keep : { form: err?.message || 'Something went wrong. Please try again.' };
}
