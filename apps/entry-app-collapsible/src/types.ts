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
  fields: FieldType[];
  id: string;
}

export enum ActionTypes {
  CREATE_FIELD_GROUP,
  DELETE_FIELD_GROUP,
  RENAME_FIELD_GROUP,

  ADD_FIELD_TO_GROUP,
  REMOVE_FIELD_FROM_GROUP,
  MOVE_FIELD_GROUP_UP,
  MOVE_FIELD_GROUP_DOWN,
  MOVE_FIELD_IN_GROUP
}

export type Action =
  | { type: ActionTypes.CREATE_FIELD_GROUP }
  | { type: ActionTypes.DELETE_FIELD_GROUP; groupId: string }
  | { type: ActionTypes.RENAME_FIELD_GROUP; groupId: string; name: string }
  | { type: ActionTypes.ADD_FIELD_TO_GROUP; groupId: string; fieldKey: string; fieldName: string }
  | { type: ActionTypes.REMOVE_FIELD_FROM_GROUP; groupId: string; fieldKey: string }
  | { type: ActionTypes.MOVE_FIELD_GROUP_UP; groupId: string }
  | { type: ActionTypes.MOVE_FIELD_GROUP_DOWN; groupId: string }
  | { type: ActionTypes.MOVE_FIELD_IN_GROUP; groupId: string; oldIndex: number; newIndex: number };
