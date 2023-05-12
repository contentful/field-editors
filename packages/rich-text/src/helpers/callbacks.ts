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
        document,
        schema,
      })
    );

    handler?.(doc);
  }, 500);
};
