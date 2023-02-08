import { useCallback, useMemo } from 'react';

import { toContentfulDocument } from '@contentful/contentful-slatejs-adapter';
import { Document } from '@contentful/rich-text-types';
import debounce from 'lodash/debounce';

import schema from './constants/Schema';
import { removeInternalMarks } from './helpers/removeInternalMarks';
import { usePlateSelectors } from './internal/hooks';
import { Operation, Value } from './internal/types';

/**
 * Returns whether a given operation is relevant enough to trigger a save.
 */
const isRelevantOperation = (op: Operation) => {
  if (op.type === 'set_selection') {
    return false;
  }

  return true;
};

export type OnValueChangedProps = {
  editorId: string;
  handler?: (value: Document) => unknown;
  skip?: boolean;
  onSkip?: VoidFunction;
};

export const useOnValueChanged = ({ editorId, handler, skip, onSkip }: OnValueChangedProps) => {
  const onChange = useMemo(
    () =>
      debounce((document: unknown) => {
        const contentfulDocument = toContentfulDocument({ document, schema });
        const cleanedDocument = removeInternalMarks(contentfulDocument);
        handler?.(cleanedDocument);
      }, 500),
    [handler]
  );

  const editor = usePlateSelectors(editorId).editor();

  return useCallback(
    (value: Value) => {
      if (!editor) {
        throw new Error(
          'Editor change callback called but editor not defined. Editor id: ' + editorId
        );
      }
      const operations = editor?.operations.filter(isRelevantOperation);

      if (operations.length > 0) {
        if (skip) {
          onSkip?.();
          return;
        }
        onChange(value);
      }
    },
    [editorId, onChange, skip, onSkip, editor]
  );
};
