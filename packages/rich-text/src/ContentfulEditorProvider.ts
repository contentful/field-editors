import constate from 'constate';
import { usePlateEditorRef } from '@udecode/plate';
import { FieldExtensionSDK } from '@contentful/app-sdk';

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
  const editor = usePlateEditorRef(editorId);

  return editor;
}

export const [ContentfulEditorProvider, useContentfulEditor] = constate(useContentfulEditorHook);
