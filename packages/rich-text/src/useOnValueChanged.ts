import { useCallback, useMemo } from 'react';

import { toContentfulDocument } from '@contentful/contentful-slatejs-adapter';
import { Document } from '@contentful/rich-text-types';
import { getPlateSelectors } from '@udecode/plate-core';
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

// todo - refactor this, very dirty
// function cleanData(data, deleteKeys) {
//   if (typeof data != 'object') return;
//   if (!data) return; // null object

//   for (const key in data) {
//     if (deleteKeys.includes(key)) {
//       delete data[key];
//     } else {
//       cleanData(data[key], deleteKeys);
//     }
//   }
// }

// const editor = getPlateSelectors(id).editor();
// if (editor) {
//   removeMark(editor, { key: 'command-prompt' });
// }

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
        handler?.(toContentfulDocument({ document, schema }));
      }, 500),
    [handler]
  );

  return useCallback(
    (value: unknown) => {
      const editor = getPlateSelectors(editorId).editor();
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
    [editorId, onChange, skip, onSkip]
  );
};
