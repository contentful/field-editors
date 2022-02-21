import { createContext, useContext } from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { usePlateEditorState } from '@udecode/plate-core';

import { RichTextEditor } from './types';

export function getContentfulEditorId(sdk: FieldExtensionSDK) {
  const { entry, field } = sdk;
  const sys = entry.getSys();

  return `rich-text-editor-${sys.id}-${field.id}-${field.locale}`;
}

export const editorContext = createContext('');

export const ContentfulEditorIdProvider = editorContext.Provider;

export function useContentfulEditorId() {
  const id = useContext(editorContext);
  if (!id) {
    throw new Error(
      'could not find editor id. Please ensure the component is wrapped in <ContentfulEditorIdProvider> '
    );
  }

  return id;
}

export function useContentfulEditor() {
  const editorId = useContentfulEditorId();
  const editor = usePlateEditorState(editorId);

  return editor;
}
