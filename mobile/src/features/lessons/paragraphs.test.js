import { toParagraphs } from './paragraphs.js';

describe('toParagraphs', () => {
  it('splits on blank lines, normalises line endings and drops empties', () => {
    expect(toParagraphs('One\r\n\r\nTwo\nstill two\n\n\n')).toEqual(['One', 'Two\nstill two']);
  });
  it('returns nothing for blank or missing content', () => {
    expect(toParagraphs('   ')).toEqual([]);
    expect(toParagraphs(undefined)).toEqual([]);
  });
  it('keeps markup as text, never HTML', () => {
    expect(toParagraphs('<b>hi</b>')).toEqual(['<b>hi</b>']);
  });
  it('normalises a CRLF left inside a paragraph', () => {
    expect(toParagraphs('a\r\nb')).toEqual(['a\nb']);
  });
});
