/** Splits plain lesson text into paragraphs. Never interprets markup. */
export function toParagraphs(content) {
  return String(content ?? '')
    .split(/\r?\n[ \t]*\r?\n/)
    .map((p) => p.replace(/\r\n/g, '\n').trim())
    .filter(Boolean);
}
