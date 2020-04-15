import React from 'react';

export interface AppState {
  fields: FieldKey[];
  fieldGroups: FieldGroup[];
}

export type FieldKey = string;

export interface FieldGroup {
  name: string;
  fields: FieldKey[];
}

export enum ActionTypes {
  CREATE_FIELD_GROUP,
  DELETE_FIELD_GROUP,
  RENAME_FIELD_GROUP,

  ADD_FIELD_TO_GROUP
}

export const AppContext = React.createContext<{ state: AppState; dispatch: any }>(undefined!);
// non null statement here is to avoid having to continually assert context
// throughout the code

// UTILS
export const findUnassignedFields = (appState: AppState): FieldKey[] => {
  const assignedFields = appState.fieldGroups
    .flatMap((fg: FieldGroup) => fg.fields)
    .reduce((acc, field: FieldKey) => {
      acc[field] = true;
      return acc;
    }, {});

  console.log(assignedFields);
  return appState.fields.filter(f => !assignedFields[f]);
};
