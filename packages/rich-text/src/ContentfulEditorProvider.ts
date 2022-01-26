import { FieldExtensionSDK } from '@contentful/app-sdk';
import { usePlateEditorRef } from '@udecode/plate-core';
import constate from 'constate';

export function getContentfulEditorId(sdk: FieldExtensionSDK) {
  const { entry, field } = sdk;
  const sys = entry.getSys();

  return `rich-text-editor-${sys.id}-${field.id}-${field.locale}`;
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
