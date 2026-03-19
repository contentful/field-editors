import getSlug from 'speakingurl';

const DEFAULT_SLUG_MAX_LENGTH = 75;

const languages = [
  'ar',
  'az',
  'cs',
  'de',
  'dv',
  'en',
  'es',
  'fa',
  'fi',
  'fr',
  'ge',
  'gr',
  'hu',
  'it',
  'lt',
  'lv',
  'my',
  'mk',
  'nl',
  'pl',
  'pt',
  'ro',
  'ru',
  'sk',
  'sr',
  'tr',
  'uk',
  'vn',
];

/**
 * Extracts the first two lowercased characters from the locale,
 * and returns the supported language prefix.
 */
function supportedLanguage(locale: string) {
  const prefix = locale.slice(0, 2).toLowerCase();
  return languages[languages.indexOf(prefix)];
}

/**
 * Returns the slug for a given string and locale.
 * If the locale belongs to a language supported by SpeakingURL, it
 * is used as the symbol language. Otherwise, the symbol language
 * is english.
 *
 * By default slug suggestions are limited to 75 characters.
 * Consumers can override that limit via maxLength.
 *
 * @param {string} text To be turned into a slug.
 * @param {string?} locale
 * @param {number?} maxLength
 * @returns {string} Slug for provided text.
 */
export function slugify(text: string, locale = 'en', maxLength = DEFAULT_SLUG_MAX_LENGTH) {
  return getSlug(text, {
    separator: '-',
    lang: supportedLanguage(locale) || 'en',
    truncate: maxLength + 1,
    custom: {
      "'": '',
      '`': '',
      '’': '',
      '‘': '',
    },
  });
}
