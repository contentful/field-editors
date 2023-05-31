import { useCallback, useMemo } from 'react';

import { toContentfulDocument } from '@contentful/contentful-slatejs-adapter';
import { Document } from '@contentful/rich-text-types';
import { getPlateSelectors } from '@udecode/plate-core';
import debounce from 'lodash/debounce';

import schema from './constants/Schema';
import { removeInternalMarks } from './helpers/removeInternalMarks';
import { Operation } from './internal/types';

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

// cases
// 1. The node where the comment was has changed content
// 2. The node where the comment was has the same content but different marks (is this possible?)
// 3. The node where the comment was has changed locations
// 4. The node where the comment was is no longer there (therefore, comment needs to be deleted?)

// possible results
// 1. update "origial text"
// 2. no action since the comment does not care
// 3. update json path
// 4. delete comment (this is a bit harder)

export const useOnValueChanged = ({ editorId, handler, skip, onSkip }: OnValueChangedProps) => {
  const onChange = useMemo(
    () =>
      debounce((document: unknown) => {
        // identify if the comment are still valid

        const contentfulDocument = toContentfulDocument({ document, schema });

        // to ask: should we actually remove the comments here?
        // yes, remove comments here
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
