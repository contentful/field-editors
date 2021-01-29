import React from 'react';
import { Entry } from '@contentful/field-editor-shared';
import { EditorExtensionSDK } from '@contentful/app-sdk';
import { AppState, FieldType, FieldGroupType, Action } from './types';

// UTILS
export const findUnassignedFields = (appState: AppState): FieldType[] => {
  const assignedFields = appState.fieldGroups
    .flatMap((fg: FieldGroupType) => fg.fields)
    .reduce((acc: { [key: string]: boolean }, field: FieldType) => {
      acc[field.id] = true;
      return acc;
    }, {});

  return appState.fields.filter((f) => !assignedFields[f.id]);
};

export const getEntryURL = (entry: Entry) => {
  const entryId = entry.sys.id;
  const spaceId = entry.sys.space.sys.id;

  return `https://app.contentful.com/spaces/${spaceId}/entries/${entryId}`;
};

export const SDKContext = React.createContext<EditorExtensionSDK>(undefined!);
export const AppContext = React.createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
}>(undefined!);
// non null statement here is to avoid having to continually assert context
// throughout the code
