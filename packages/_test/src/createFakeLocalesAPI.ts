import { LocalesAPI } from '@contentful/app-sdk';

function identity<T>(item: T): T {
  return item;
}

type CustomizeMockFn = (fieldApi: LocalesAPI) => LocalesAPI;

export function createFakeLocalesAPI(customizeMock: CustomizeMockFn = identity): LocalesAPI {
  return customizeMock({
    default: 'en-US',
    available: ['en-US', 'de-DE'],
    fallbacks: {
      'en-US': undefined,
      'de-DE': undefined,
    },
    names: {
      'en-US': 'English',
      'de-DE': 'Deutsch',
    },
    optional: {
      'en-US': false,
      'de-DE': false,
    },
    direction: {
      'en-US': 'ltr',
      'de-DE': 'ltr',
    },
  } as unknown as LocalesAPI);
}
