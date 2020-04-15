import * as React from 'react';
import { render } from 'react-dom';
import { DisplayText, Form, TextLink, Modal } from '@contentful/forma-36-react-components';
import { init, locations, EditorExtensionSDK } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import './index.css';
import { LocalesAPI } from '@contentful/field-editor-shared';

import { Field } from './Field';
import { FieldGroupsEditor } from './FieldGroupsEditor';
import {
  FieldGroup,
  FieldKey,
  ActionTypes,
  findUnassignedFields,
  AppState,
  AppContext,
} from './shared';

interface AppProps {
  sdk: EditorExtensionSDK;
}

const initialState = (fields: string[]): AppState => {
  return {
    fields,
    fieldGroups: [],
  };
};

const deleteFieldGroup = (state: AppState, action: any): AppState => {
  const fieldGroups = state.fieldGroups
    .slice(0, action.index)
    .concat(state.fieldGroups.slice(action.index + 1));
  return { ...state, fieldGroups };
};

type Action =
  | { type: ActionTypes.CREATE_FIELD_GROUP }
  | { type: ActionTypes.DELETE_FIELD_GROUP; index: number }
  | { type: ActionTypes.RENAME_FIELD_GROUP; index: number; name: string }
  | { type: ActionTypes.ADD_FIELD_TO_GROUP; index: number; fieldKey: FieldKey };

type Reducer = (state: AppState, action: Action) => AppState;

const reducer: Reducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.CREATE_FIELD_GROUP:
      return { ...state, fieldGroups: [...state.fieldGroups, { name: '', fields: [] }] };
    case ActionTypes.DELETE_FIELD_GROUP:
      return deleteFieldGroup(state, action);
    case ActionTypes.RENAME_FIELD_GROUP:
      const fieldGroups = [...state.fieldGroups];
      fieldGroups[action.index].name = action.name;
      return { ...state, fieldGroups };
    case ActionTypes.ADD_FIELD_TO_GROUP:
      const newFieldGroups = [...state.fieldGroups];
      newFieldGroups[action.index].fields.push(action.fieldKey);
      return { ...state, fieldGroups: newFieldGroups };
  }
  return { ...state };
};

const useLocalStateReducer = (
  reducer: Reducer,
  defaultState: AppState
): [React.ReducerState<Reducer>, React.Dispatch<Action>] => {
  const [state, dispatch] = React.useReducer(reducer, defaultState, state => {
    const stored = localStorage.getItem('entry-editor-storage');
    if (stored) {
      return JSON.parse(stored);
    } else {
      return state;
    }
  });

  React.useEffect(() => {
    localStorage.setItem('entry-editor-storage', JSON.stringify(state));
  }, [state]);

  return [state, dispatch];
};

export const App: React.FunctionComponent<AppProps> = (props: AppProps) => {
  const { fields } = props.sdk.entry;

  const [state, dispatch] = useLocalStateReducer(reducer, initialState(Object.keys(fields)));
  const [dialogOpen, setDialogOpen] = React.useState(false);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <Form className="f36-margin--l">
        <DisplayText testId="title">Entry extension demo</DisplayText>
        {state.fieldGroups.map(fieldGroup => (
          // name is not a good key - as it is constantly changing...
          <CollapsibleFieldGroup
            key={fieldGroup.name}
            locales={props.sdk.locales}
            fieldGroup={fieldGroup}
            fields={fields}
          />
        ))}
        <h3>unassigned fields</h3>
        {findUnassignedFields(state).map(k => (
          <Field key={k} field={fields[k]} locales={props.sdk.locales} />
        ))}
        <TextLink onClick={() => setDialogOpen(true)}>Edit field groups</TextLink>
      </Form>
      <Modal isShown={dialogOpen} onClose={() => setDialogOpen(false)}>
        {() => (
          <FieldGroupsEditor
            addGroup={() => dispatch({ type: ActionTypes.CREATE_FIELD_GROUP })}
            sdk={props.sdk}
            fieldGroups={state.fieldGroups}
            onClose={() => setDialogOpen(false)}
          />
        )}
      </Modal>
    </AppContext.Provider>
  );
};

interface CollapsibleFieldGroupProps {
  fieldGroup: FieldGroup;
  fields: any;
  locales: LocalesAPI;
}
const CollapsibleFieldGroup: React.FC<CollapsibleFieldGroupProps> = ({
  fieldGroup,
  fields,
  locales,
}: CollapsibleFieldGroupProps) => {
  return (
    <React.Fragment>
      <h3>{fieldGroup.name}</h3>
      {fieldGroup.fields.map((k: FieldKey) => (
        <Field key={k} field={fields[k]} locales={locales} />
      ))}
    </React.Fragment>
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
