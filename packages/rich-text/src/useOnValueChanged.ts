import { useCallback, useMemo } from 'react';

import { toContentfulDocument } from '@contentful/contentful-slatejs-adapter';
import { Document } from '@contentful/rich-text-types';
import debounce from 'lodash/debounce';

import schema from './constants/Schema';
import { removeInternalMarks } from './helpers/removeInternalMarks';
import { Value } from './internal/types';

export type OnValueChangedProps = {
  editorId: string;
  handler?: (value: Document) => unknown;
  skip?: boolean;
  onSkip?: VoidFunction;
};

export const useOnValueChanged = ({ handler, skip, onSkip }: OnValueChangedProps) => {
  const onChange = useMemo(
    () =>
      debounce((document: unknown) => {
        const contentfulDocument = toContentfulDocument({ document, schema });
        const cleanedDocument = removeInternalMarks(contentfulDocument);
        handler?.(cleanedDocument);
      }, 500),
    [handler]
  );

  return useCallback(
    (value: Value) => {
      if (skip) {
        onSkip?.();
        return;
      }
      onChange(value);
    },
    [onChange, skip, onSkip]
  );
};
