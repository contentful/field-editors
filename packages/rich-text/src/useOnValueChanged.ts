import { useCallback, useMemo } from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { toContentfulDocument } from '@contentful/contentful-slatejs-adapter';
import { Document } from '@contentful/rich-text-types';
import { getPlateSelectors } from '@udecode/plate-core';
import debounce from 'lodash/debounce';
import { InlineComment } from 'RichTextEditor';

import schema from './constants/Schema';
import {
  calculateMutations,
  removeCommentDataFromDocument,
  removeInternalMarks,
} from './helpers/removeInternalMarks';
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
  sdk: FieldExtensionSDK & {
    field: {
      comments: {
        get: () => InlineComment[];
        create: () => void;
        update: (commentId: string, comment: InlineComment) => void;
        delete: (commentId: string) => void;
      };
    };
  };
};

export const useOnValueChanged = ({
  editorId,
  handler,
  skip,
  onSkip,
  sdk,
}: OnValueChangedProps) => {
  const onChange = useMemo(
    () =>
      debounce((document: unknown) => {
        const contentfulDocument = toContentfulDocument({ document, schema });

        const { toDelete, toUpdate } = calculateMutations(
          contentfulDocument,
          sdk.field.comments.get()
        );

        toDelete.forEach((commentId) => sdk.field.comments.delete(commentId));
        toUpdate.forEach((data) => sdk.field.comments.update(data.id, data.range));

        const cleanedDocument = removeInternalMarks(
          removeCommentDataFromDocument(contentfulDocument)
        );
        handler?.(cleanedDocument);
      }, 500),
    [handler, sdk]
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
