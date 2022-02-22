import { useCallback, useMemo } from 'react';

import { toContentfulDocument } from '@contentful/contentful-slatejs-adapter';
import { Document } from '@contentful/rich-text-types';
import { PlateEditor } from '@udecode/plate-core';
import debounce from 'lodash/debounce';
import { Operation } from 'slate';

import schema from './constants/Schema';

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
  editor: PlateEditor;
  handler?: (value: Document) => unknown;
};

export const useOnValueChanged = ({ editor, handler }: OnValueChangedProps) => {
  const onChange = useMemo(
    () =>
      debounce((document: unknown) => {
        handler?.(toContentfulDocument({ document, schema }));
      }, 500),
    [handler]
  );

  return useCallback(
    (value: unknown) => {
      const operations = editor.operations.filter(isRelevantOperation);

      if (operations.length > 0) {
        onChange(value);
      }
    },
    [editor, onChange]
  );
};
