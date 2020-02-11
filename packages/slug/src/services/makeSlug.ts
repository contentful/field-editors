import { slugify } from './slugify';

type MakeSlugOptions = {
  locale: string;
  isOptionalLocaleWithFallback: boolean;
  createdAt: string;
};

function formatTwoDigit(num: number) {
  const asString = String(num);
  return asString.length === 1 ? `0${asString}` : asString;
}

export function formatUtcDate(date: Date) {
  const year = date.getFullYear();
  const month = formatTwoDigit(date.getUTCMonth() + 1);
  const day = formatTwoDigit(date.getUTCDate());
  const hour = formatTwoDigit(date.getUTCHours());
  const minutes = formatTwoDigit(date.getUTCMinutes());
  const seconds = formatTwoDigit(date.getUTCSeconds());

  return `${year} ${month} ${day} at ${hour} ${minutes} ${seconds}`;
}

function untitledSlug({ isOptionalLocaleWithFallback, createdAt }: MakeSlugOptions) {
  if (isOptionalLocaleWithFallback) {
    return ''; // Will result in `undefined` slug.
  }

  const createdAtFormatted = formatUtcDate(new Date(createdAt));
  return slugify('Untitled entry ' + createdAtFormatted, 'en-US');
}

export function makeSlug(title: string | null | undefined, options: MakeSlugOptions) {
  return title ? slugify(title, options.locale) : untitledSlug(options);
}
