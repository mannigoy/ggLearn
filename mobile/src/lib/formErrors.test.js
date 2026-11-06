import { serverErrors } from './formErrors.js';

describe('serverErrors', () => {
  it('keeps field errors the form renders', () => {
    const err = { message: 'Check the form.', fields: { title: 'Too short.', 'materials[0]': 'Bad.' } };
    expect(serverErrors(err, ['title', 'materials'])).toEqual({ title: 'Too short.' });
  });

  it('falls back to the message when no field is rendered', () => {
    const err = { message: 'Check the form.', fields: { 'materials[0]': 'Use 1 to 300 characters.' } };
    expect(serverErrors(err, ['title', 'materials'])).toEqual({ form: 'Check the form.' });
  });

  it('falls back to the message when there are no fields', () => {
    expect(serverErrors(new Error('Nope'), ['title'])).toEqual({ form: 'Nope' });
  });
});
