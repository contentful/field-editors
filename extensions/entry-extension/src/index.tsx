import * as React from 'react';
import { render } from 'react-dom';
import {
  DisplayText,
  Form,
  TextLink,
  Modal,
  Button,
  Dropdown,
  DropdownList,
  DropdownListItem,
} from '@contentful/forma-36-react-components';
import { init, locations, EditorExtensionSDK } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import './index.css';

import { Field } from './Field';

interface AppProps {
  sdk: EditorExtensionSDK;
}

interface FieldGroup {
  name: string;
  fields: FieldKey[];
}

type FieldKey = string;

const AppContext = React.createContext<{ state: AppState; dispatch: any }>(undefined!);
// non null statement here is to avoid having to continually assert context
// throughout the code


interface AppState {
  fields: FieldKey[];
  fieldGroups: FieldGroup[];
}

enum ActionTypes {
  CREATE_FIELD_GROUP,
  DELETE_FIELD_GROUP,
  RENAME_FIELD_GROUP,

  ADD_FIELD_TO_GROUP,
}
type Action =
  | { type: ActionTypes.CREATE_FIELD_GROUP }
  | { type: ActionTypes.DELETE_FIELD_GROUP; index: number }
  | { type: ActionTypes.RENAME_FIELD_GROUP; index: number; name: string }
  | { type: ActionTypes.ADD_FIELD_TO_GROUP; index: number; fieldKey: FieldKey };

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

const reducer = (state: AppState, action: Action): AppState => {
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

// UTILS
const findUnassignedFields = (appState: AppState): FieldKey[] => {
  const assignedFields = appState.fieldGroups
    .flatMap((fg: FieldGroup) => fg.fields)
    .reduce((acc, field: FieldKey) => {
      acc[field] = true;
      return acc;
    }, {});

  console.log(assignedFields);
  return appState.fields.filter(f => !assignedFields[f]);
};

export const App: React.FunctionComponent<AppProps> = (props: AppProps) => {
  const { fields } = props.sdk.entry;

  const [state, dispatch] = React.useReducer(reducer, initialState(Object.keys(fields)));
  console.log(state);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <Form className="f36-margin--l">
        <DisplayText testId="title">Entry extension demo</DisplayText>
        {findUnassignedFields(state).map(k => (
          <Field key={k} field={fields[k]} locales={props.sdk.locales} />
        ))}
        <TextLink onClick={() => setDialogOpen(true)}>Edit field groups</TextLink>
      </Form>
      <Modal isShown={dialogOpen} onClose={() => setDialogOpen(false)}>
        {() => (
          <FieldGroupEditor
            addGroup={() => dispatch({ type: ActionTypes.CREATE_FIELD_GROUP })}
            sdk={props.sdk}
            fieldGroups={state.fieldGroups}
          />
        )}
      </Modal>
    </AppContext.Provider>
  );
};


// -----------------
// THE EDITOR DIALOGUE
// -----------------
interface FieldGroupEditorProps {
  sdk: EditorExtensionSDK;
  fieldGroups: FieldGroup[];
  addGroup: () => void;
  // fields
}

class FieldGroupEditor extends React.Component<FieldGroupEditorProps> {
  render() {
    const { fieldGroups } = this.props;

    return (
      <Modal.Content>
        <p> group fields to seperate concerns in the entry editor</p>
        <Button onClick={this.props.addGroup}>Add Group</Button>
        <Button>save</Button>
        {fieldGroups.map(({ name, fields }, index) => (
          <FieldGroup name={name} fields={fields} index={index} />
        ))}
      </Modal.Content>
    );
  }
}

interface FieldGroupProps extends FieldGroup {
  index: number;
}

const FieldGroup: React.FC<FieldGroupProps> = ({ name, fields, index }: FieldGroupProps) => {
  const { state, dispatch } = React.useContext(AppContext);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  return (
    <div>
      <input
        value={name}
        onChange={e =>
          dispatch({
            type: ActionTypes.RENAME_FIELD_GROUP,
            index,
            name: e.target.value,
          })
        }
      />
      <button onClick={() => dispatch({ type: ActionTypes.DELETE_FIELD_GROUP, index })}>
        delete group
      </button>
      <h3>Fields</h3>
      <div>select a field to add</div>
      <Dropdown
        isOpen={dropdownOpen}
        onClose={() => setDropdownOpen(false)}
        toggleElement={
          <Button
            size="small"
            buttonType="muted"
            onClick={() => setDropdownOpen(true)}
            indicateDropdown>
            Select a field to add
          </Button>
        }>
        <DropdownList>
          {findUnassignedFields(state).map((fieldKey: FieldKey) => (
            <DropdownListItem
              onClick={() => dispatch({ type: ActionTypes.ADD_FIELD_TO_GROUP, index, fieldKey })}
              key={fieldKey}>
              {fieldKey}
            </DropdownListItem>
          ))}
        </DropdownList>
      </Dropdown>
      {fields.map(field => (
        <div>{field}</div>
      ))}
    </div>
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
