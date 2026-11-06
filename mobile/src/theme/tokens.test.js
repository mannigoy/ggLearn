import { tokens } from './tokens';

it('uses the style guide colours', () => {
  expect(tokens.colors).toMatchObject({ sky: '#3BA4F5', sun: '#FFC83D', mint: '#2FC69A', coral: '#FF7466', bg: '#FFFAF3', text: '#1D2B4F' });
});

it('keeps touch targets at 48', () => expect(tokens.minTouch).toBe(48));
