import React from 'react';

export interface AppState {
  fields: FieldType[];
  fieldGroups: FieldGroupType[];
}

export type FieldId = string;

export interface FieldType {
  name: string;
  id: FieldId;
}

export interface FieldGroupType {
  name: string;
  fields: string[];
}

export enum ActionTypes {
  CREATE_FIELD_GROUP,
  DELETE_FIELD_GROUP,
  RENAME_FIELD_GROUP,

  ADD_FIELD_TO_GROUP,
}

export const AppContext = React.createContext<{ state: AppState; dispatch: any }>(undefined!);
// non null statement here is to avoid having to continually assert context
// throughout the code

// UTILS
export const findUnassignedFields = (appState: AppState): FieldType[] => {
  const assignedFields = appState.fieldGroups
    .flatMap((fg: FieldGroupType) => fg.fields)
    .reduce((acc, field: FieldId) => {
      acc[field] = true;
      return acc;
    }, {});

  console.log(assignedFields);
  console.log(appState.fields)
  console.log(appState.fields.filter(f => !assignedFields[f.id]))
  return appState.fields.filter(f => !assignedFields[f.id]);
};
