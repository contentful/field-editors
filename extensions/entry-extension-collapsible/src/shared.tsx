import React from 'react';
import { EditorExtensionSDK } from 'contentful-ui-extensions-sdk';
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

export const SDKContext = React.createContext<EditorExtensionSDK>(undefined!);
export const AppContext = React.createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
}>(undefined!);
// non null statement here is to avoid having to continually assert context
// throughout the code
