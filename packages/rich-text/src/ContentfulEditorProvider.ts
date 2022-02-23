import { createContext, useContext } from 'react';

import { FieldExtensionSDK } from '@contentful/app-sdk';
import { usePlateEditorRef, usePlateEditorState } from '@udecode/plate-core';

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

// This hook re-renders when the value changes
// Use case: Toolbar icons, for example
export function useContentfulEditor() {
  const editorId = useContentfulEditorId();
  const editor = usePlateEditorState<RichTextEditor>(editorId);

  return editor;
}

// This doesn't re-render when the value changes
export function useContentfulEditorRef() {
  const editorId = useContentfulEditorId();
  const editor = usePlateEditorRef<RichTextEditor>(editorId);

  return editor;
}
