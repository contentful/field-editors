import { toContentfulDocument } from '@contentful/contentful-slatejs-adapter';
import { Document } from '@contentful/rich-text-types';
import equal from 'fast-deep-equal';
import debounce from 'lodash/debounce';

import schema from '../constants/Schema';
import { removeInternalMarks } from './removeInternalMarks';

export const createOnChangeCallback = (handler?: (value: Document) => void) => {
  // Cache previous value to avoid firing the handler unnecessarily
  //
  // Note: We are not using lodash/memoize here to avoid memory leaks
  // due to having an infinite cache while we only care about the last
  // value.
  let cache: unknown = null;

  return debounce((document: unknown) => {
    if (equal(document, cache)) {
      return;
    }

    cache = document;
    const doc = removeInternalMarks(
      toContentfulDocument({
        // eslint-disable-next-line -- parameter type is not exported @typescript-eslint/no-explicit-any
        document: document as any,
        schema: schema,
        // eslint-disable-next-line -- parameter type is not exported @typescript-eslint/no-explicit-any
      }) as any
    );
    // eslint-disable-next-line -- correct parameter type is not defined @typescript-eslint/no-explicit-any
    const cleanedDocument = removeInternalMarks(doc as Record<string, any>);
    handler?.(cleanedDocument);
  }, 500);
};
