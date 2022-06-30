import { useCallback, useMemo } from 'react';

import { toContentfulDocument } from '@contentful/contentful-slatejs-adapter';
import { Document } from '@contentful/rich-text-types';
import { getPlateSelectors } from '@udecode/plate-core';
import debounce from 'lodash/debounce';
import { Operation } from 'slate';

import schema from './constants/Schema';
import { COMMAND_PROMPT } from './plugins/CommandPalette/constants';

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

const removeInternalMarks = (document: Record<string, unknown>) => {
  return {
    ...document,
    content: (document.content as Record<string, unknown>[]).map((node) => {
      if (node.nodeType === 'text') {
        node.marks = (node.marks as Record<string, unknown>[]).filter(
          (mark) => mark.type !== COMMAND_PROMPT
        );
        return node;
      }
      return removeInternalMarks(node);
    }),
  };
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
