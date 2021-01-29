import { LocalesAPI } from '@contentful/app-sdk';

function identity<T>(item: T): T {
  return item;
}

type CustomizeMockFn = (fieldApi: LocalesAPI) => LocalesAPI;

export function createFakeLocalesAPI(customizeMock: CustomizeMockFn = identity): LocalesAPI {
  return customizeMock(({
    default: 'en-US',
    available: ['en-US'],
    fallbacks: {
      'en-US': undefined,
    },
    names: {
      'en-US': 'English',
    },
    optional: {
      'en-US': false,
    },
    direction: {
      'en-US': 'ltr',
    },
  } as unknown) as LocalesAPI);
}
