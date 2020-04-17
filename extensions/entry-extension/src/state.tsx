import * as React from 'react';
import produce from 'immer';
import { FieldType, FieldGroupType, ActionTypes, AppState } from './shared';

const createId = (): string => {
  const c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return [...Array(5)].map(() => c[~~(Math.random() * c.length)]).join('');
};

type Action =
  | { type: ActionTypes.CREATE_FIELD_GROUP }
  | { type: ActionTypes.DELETE_FIELD_GROUP; groupId: string }
  | { type: ActionTypes.RENAME_FIELD_GROUP; groupId: string; name: string }
  | { type: ActionTypes.ADD_FIELD_TO_GROUP; groupId: string; fieldKey: string; fieldName: string }
  | { type: ActionTypes.REMOVE_FIELD_FROM_GROUP; groupId: string; fieldKey: string }
  | { type: ActionTypes.MOVE_FIELD_GROUP_UP; groupId: string }
  | { type: ActionTypes.MOVE_FIELD_GROUP_DOWN; groupId: string };

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
      const currentIndex = state.fieldGroups.findIndex(({ id }) => id === action.groupId);
      const a = state.fieldGroups[currentIndex];
      const b = state.fieldGroups[currentIndex - 1];
      state.fieldGroups[currentIndex] = { ...b };
      state.fieldGroups[currentIndex - 1] = { ...a };
      return state;

    case ActionTypes.MOVE_FIELD_GROUP_DOWN:
      const currentIndex = state.fieldGroups.findIndex(({ id }) => id === action.groupId);
      const a = state.fieldGroups[currentIndex];
      const b = state.fieldGroups[currentIndex + 1];
      state.fieldGroups[currentIndex] = { ...b };
      state.fieldGroups[currentIndex + 1] = { ...a };
      return state;
  }

  return state;
};

export const useAppState = (
  fields: FieldType[]
): [React.ReducerState<React.Reducer<AppState, Action>>, React.Dispatch<Action>] => {
  const defaultState = {
    fields,
    fieldGroups: [],
  };

  const [state, dispatch] = React.useReducer(produce(reducer), defaultState, state => {
    const stored = localStorage.getItem('entry-editor-storage');

    if (stored) {
      const parsed = JSON.parse(stored);
      console.log(parsed, defaultState);
      if (parsed.fields !== defaultState.fields) {
        // in case the content model has been updated to add new fields
        parsed.fields = [...defaultState.fields];
      }
      return parsed;
    } else {
      return state;
    }
  });


  // On each state change save the new state in local storage
  React.useEffect(() => {
    localStorage.setItem('entry-editor-storage', JSON.stringify(state));
  }, [state]);

  return [state, dispatch];
};
