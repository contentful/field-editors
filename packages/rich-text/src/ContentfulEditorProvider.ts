import constate from 'constate';
import { FieldExtensionSDK } from '@contentful/field-editor-reference/dist/types';
import { useStoreEditorRef } from '@udecode/plate-core';

export function getContentfulEditorId(sdk: FieldExtensionSDK) {
  const { entry, field } = sdk;
  const entryId = entry.getSys().id;

  return `rich-text-editor-${entryId}-${field.id}-${field.locale}`;
}

interface useContentfulEditorHookProps {
  sdk: FieldExtensionSDK;
}

function useContentfulEditorHook({ sdk }: useContentfulEditorHookProps) {
  const editorId = getContentfulEditorId(sdk);
  const editor = useStoreEditorRef(editorId);

  return editor;
}

export const [ContentfulEditorProvider, useContentfulEditor] = constate(useContentfulEditorHook);
