import { useMemo } from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { toSlatejsDocument } from '@contentful/contentful-slatejs-adapter';
import { EMPTY_DOCUMENT, Document } from '@contentful/rich-text-types';
import { createPlateEditor } from '@udecode/plate-core';
import noop from 'lodash/noop';
import { Transforms } from 'slate';

import schema from './constants/Schema';
import { disableCorePlugins, getPlugins } from './plugins';
import { RichTextTrackingActionHandler } from './plugins/Tracking';

export type NormalizedSlateValueProps = {
  id: string;
  sdk: FieldExtensionSDK;
  incomingDoc: any;
  onAction?: RichTextTrackingActionHandler;
};

/**
 * For legacy reasons, a document may not have any content at all
 * e.g:
 *
 * {nodeType: document, data: {}, content: []}
 *
 * Rendering such document will break the Slate editor
 */
const hasContent = (doc?: Document) => {
  if (!doc) {
    return false;
  }

  return doc.content.length > 0;
};

export const useNormalizedSlateEditor = ({
  id,
  sdk,
  incomingDoc,
  onAction,
}: NormalizedSlateValueProps) => {
  const plugins = useMemo(() => {
    return getPlugins(sdk, onAction ?? noop);
  }, [sdk, onAction]);

  return useMemo(() => {
    const editor = createPlateEditor({
      id,
      plugins,
      disableCorePlugins,
    });

    const doc = toSlatejsDocument({
      document: hasContent(incomingDoc) ? incomingDoc : EMPTY_DOCUMENT,
      schema,
    });

    // Sets editor value & kicks normalization
    Transforms.insertNodes(editor, doc);

    return editor;
  }, [id, plugins, incomingDoc]);
};
