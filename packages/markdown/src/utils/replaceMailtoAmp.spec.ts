import { replaceMailtoAmp } from './replaceMailtoAmp';

describe('replace inside mailto', () => {
  let str =
    '<a href="mailto:example@example.com?subject=Hello&amp;body=Hello%20world">Send Email</a>';

  test('replace &amp; with &', () => {
    const newStr = replaceMailtoAmp(str);
    expect(newStr).toBe(
      '<a href="mailto:example@example.com?subject=Hello&body=Hello%20world">Send Email</a>'
    );
  });

  test('no replace if not inside mailto', () => {
    str = '<a href="https://example.com?subject=Hello&amp;body=Hello%20world">Visit Website</a>';
    const newStr = replaceMailtoAmp(str);
    expect(newStr).toBe(
      '<a href="https://example.com?subject=Hello&amp;body=Hello%20world">Visit Website</a>'
    );
  });

  test('no replace if no &amp;', () => {
    str = '<a href="mailto:example@example.com?subject=Hello">Send Email</a>';
    const newStr = replaceMailtoAmp(str);
    expect(newStr).toBe('<a href="mailto:example@example.com?subject=Hello">Send Email</a>');
  });
});
