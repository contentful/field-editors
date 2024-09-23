/* eslint-disable @typescript-eslint/no-explicit-any */
import { toContentfulDocument } from '@contentful/contentful-slatejs-adapter';
import { Document } from '@contentful/rich-text-types';
import debounce from 'lodash/debounce';

import schema from '../constants/Schema';
import { removeInternalMarks } from './removeInternalMarks';

export const createOnChangeCallback = (handler?: (value: Document) => void) =>
  debounce((document: unknown) => {
    const doc = removeInternalMarks(
      toContentfulDocument({
        document: document as any,
        schema: schema,
      }) as any
    );

    const cleanedDocument = removeInternalMarks(doc as Record<string, any>);
    handler?.(cleanedDocument);
  }, 500);
