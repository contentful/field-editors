import { LocalesAPI } from 'contentful-ui-extensions-sdk';

function identity<T>(item: T): T {
  return item;
}

type CustomizeMockFn = (fieldApi: LocalesAPI) => LocalesAPI;

export function createFakeLocalesAPI(customizeMock: CustomizeMockFn = identity): LocalesAPI {
  return customizeMock({
    default: 'en-US',
    available: ['en-US'],
    fallbacks: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      'en-US': undefined
    },
    names: {
      'en-US': 'English'
    },
    optional: {
      'en-US': false
    },
    direction: {
      'en-US': 'ltr'
    }
  });
}
