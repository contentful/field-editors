import * as React from 'react';
import { render } from 'react-dom';
import { DisplayText, Form, TextLink, Modal } from '@contentful/forma-36-react-components';
import { init, locations, EditorExtensionSDK } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import './index.css';
import produce from 'immer';

import { Field } from './Field';
import { FieldGroupsEditor } from './FieldGroupsEditor';
import { CollapsibleFieldGroup } from './CollapsibleFieldGroup';
import { FieldType, ActionTypes, findUnassignedFields, AppState, AppContext } from './shared';

interface AppProps {
  sdk: EditorExtensionSDK;
}

// ------------
// state management
// ------------
const initialState = (fields: FieldType[]): AppState => {
  return {
    fields,
    fieldGroups: [],
  };
};

type Action =
  | { type: ActionTypes.CREATE_FIELD_GROUP }
  | { type: ActionTypes.DELETE_FIELD_GROUP; index: number }
  | { type: ActionTypes.RENAME_FIELD_GROUP; index: number; name: string }
  | { type: ActionTypes.ADD_FIELD_TO_GROUP; index: number; fieldKey: string };

const reducer: React.Reducer<AppState, Action> = (state, action) => {
  switch (action.type) {
    case ActionTypes.CREATE_FIELD_GROUP:
      state.fieldGroups.push({ name: '', fields: [] });
      return state;
    case ActionTypes.DELETE_FIELD_GROUP:
      state.fieldGroups = state.fieldGroups
        .slice(0, action.index)
        .concat(state.fieldGroups.slice(action.index + 1));
      return state;
    case ActionTypes.RENAME_FIELD_GROUP:
      state.fieldGroups[action.index].name = action.name;
      return state;
    case ActionTypes.ADD_FIELD_TO_GROUP:
      state.fieldGroups[action.index].fields.push(action.fieldKey);
      return state;
  }
  return state;
};

const useLocalStateReducer = (
  reducer: React.Reducer<AppState, Action>,
  defaultState: AppState
): [React.ReducerState<React.Reducer<AppState, Action>>, React.Dispatch<Action>] => {
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

  React.useEffect(() => {
    localStorage.setItem('entry-editor-storage', JSON.stringify(state));
  }, [state]);

  return [state, dispatch];
};

// --------------------
// main application
// --------------------

export const App: React.FunctionComponent<AppProps> = (props: AppProps) => {
  const { fields } = props.sdk.entry;

  const fieldDetails = props.sdk.contentType.fields;

  const [state, dispatch] = useLocalStateReducer(reducer, initialState(fieldDetails));

  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <Form>
        <DisplayText className="f36-margin--l" testId="title">
          Entry extension demo
        </DisplayText>
        {state.fieldGroups.map(fieldGroup => (
          // name is not a good key - as it is constantly changing...
          <CollapsibleFieldGroup
            key={fieldGroup.name}
            locales={props.sdk.locales}
            fieldGroup={fieldGroup}
            fields={fields}
          />
        ))}
        <div className="f36-margin--l">
          <h3>unassigned fields</h3>
          {findUnassignedFields(state).map(({ id }) => (
            <Field key={id} field={fields[id]} locales={props.sdk.locales} />
          ))}
          <TextLink onClick={() => setDialogOpen(true)}>Edit field groups</TextLink>
        </div>
      </Form>
      <Modal isShown={dialogOpen} onClose={() => setDialogOpen(false)}>
        {() => (
          <FieldGroupsEditor
            addGroup={() => dispatch({ type: ActionTypes.CREATE_FIELD_GROUP })}
            fieldGroups={state.fieldGroups}
            onClose={() => setDialogOpen(false)}
          />
        )}
      </Modal>
    </AppContext.Provider>
  );
};

init(sdk => {
  console.log(locations);
  if (sdk.location.is(locations.LOCATION_ENTRY_EDITOR)) {
    render(<App sdk={sdk as EditorExtensionSDK} />, document.getElementById('root'));
  }
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
