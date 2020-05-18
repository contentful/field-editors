import * as React from 'react';
import produce from 'immer';
import { Action, ActionTypes, FieldType, FieldGroupType, AppState } from './types';

const createId = (): string => {
  const c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return [...Array(5)].map(() => c[~~(Math.random() * c.length)]).join('');
};

const moveFieldGroup = (fieldGroups: FieldGroupType[], id: string, move: number) => {
  const currentIndex = fieldGroups.findIndex((fieldGroup) => fieldGroup.id === id);
  const movedElement = fieldGroups.splice(currentIndex, 1)[0];
  fieldGroups.splice(currentIndex + move, 0, movedElement);
  return fieldGroups;
};

const reducer: React.Reducer<AppState, Action> = (state, action) => {
  switch (action.type) {
    case ActionTypes.CREATE_FIELD_GROUP:
      state.fieldGroups.push({ name: '', fields: [], id: createId() });
      return state;

    case ActionTypes.DELETE_FIELD_GROUP:
      state.fieldGroups = state.fieldGroups.filter(
        (fieldGroup: FieldGroupType) => fieldGroup.id !== action.groupId
      );
      return state;

    case ActionTypes.RENAME_FIELD_GROUP:
      state.fieldGroups = state.fieldGroups.map((fieldGroup: FieldGroupType) => {
        if (fieldGroup.id === action.groupId) {
          fieldGroup.name = action.name;
        }
        return fieldGroup;
      });
      return state;

    case ActionTypes.ADD_FIELD_TO_GROUP:
      state.fieldGroups = state.fieldGroups.map((fieldGroup: FieldGroupType) => {
        if (fieldGroup.id === action.groupId) {
          fieldGroup.fields.push({ name: action.fieldName, id: action.fieldKey });
        }
        return fieldGroup;
      });
      return state;

    case ActionTypes.REMOVE_FIELD_FROM_GROUP:
      state.fieldGroups = state.fieldGroups.map((fieldGroup: FieldGroupType) => {
        if (fieldGroup.id === action.groupId) {
          fieldGroup.fields = fieldGroup.fields.filter(({ id }) => id !== action.fieldKey);
        }
        return fieldGroup;
      });
      return state;

    case ActionTypes.MOVE_FIELD_GROUP_UP:
      state.fieldGroups = moveFieldGroup(state.fieldGroups, action.groupId, -1);
      return state;

    case ActionTypes.MOVE_FIELD_GROUP_DOWN:
      state.fieldGroups = moveFieldGroup(state.fieldGroups, action.groupId, +1);
      return state;

    case ActionTypes.MOVE_FIELD_IN_GROUP:
      state.fieldGroups = state.fieldGroups.map((fieldGroup) => {
        if (fieldGroup.id === action.groupId) {
          const movedElement = fieldGroup.fields.splice(action.oldIndex, 1)[0];
          fieldGroup.fields.splice(action.newIndex, 0, movedElement);
        }

        return fieldGroup;
      });
  }

  return state;
};

export const useAppState = (
  fields: FieldType[],
  storageId: string,
  updatedAt: string | undefined
): [React.ReducerState<React.Reducer<AppState, Action>>, React.Dispatch<Action>] => {
  const defaultState = {
    fields,
    updatedAt,
    fieldGroups: [],
  };

  const [state, dispatch] = React.useReducer(produce(reducer), defaultState, (state) => {
    const stored = localStorage.getItem(storageId);

    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.updatedAt === updatedAt) {
        return parsed;
      } else {
        // if the stored updatedAt state does not match the current one from SDK,
        // then we remove any fields from fieldGroups that have been removed
        const fieldGroups = parsed.fieldGroups.map((fg: FieldGroupType) => ({
          ...fg,
          fields: fg.fields.filter((field: FieldType) => {
            return fields.some(({ id }) => id === field.id);
          }),
        }));
        return { updatedAt, fields: state.fields, fieldGroups };
      }
    }

    return state;
  });

  // On each state change save the new state in local storage
  React.useEffect(() => {
    localStorage.setItem(storageId, JSON.stringify(state));
  }, [state, storageId]);

  return [state, dispatch];
};
