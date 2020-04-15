import * as React from 'react';
import { render } from 'react-dom';
import { DisplayText, Form, TextLink, Modal, Button } from '@contentful/forma-36-react-components';
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

const AppContext = React.createContext<{ state: AppState; dispatch: any } | undefined>(undefined);

interface AppState {
  fields: FieldKey[];
  fieldGroups: FieldGroup[];
}

enum ActionTypes {
  CREATE_FIELD_GROUP,
  DELETE_FIELD_GROUP,
  RENAME_FIELD_GROUP
}
type Action =
  | { type: ActionTypes.CREATE_FIELD_GROUP }
  | { type: ActionTypes.DELETE_FIELD_GROUP; index: number }
  | { type: ActionTypes.RENAME_FIELD_GROUP; index: number; name: string };

const initialState: AppState = {
  fields: [],
  fieldGroups: []
};

function deleteFieldGroup(state: AppState, action: any) {
  const fieldGroups = state.fieldGroups
    .slice(0, action.index)
    .concat(state.fieldGroups.slice(action.index + 1));
  return { ...state, fieldGroups };
}

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
  }
  return { ...state };
};

export const App: React.FunctionComponent<AppProps> = (props: AppProps) => {
  const { fields } = props.sdk.entry;
  console.log(props.sdk);
  const [state, dispatch] = React.useReducer(reducer, initialState);
  console.log(state);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <Form className="f36-margin--l">
        <DisplayText testId="title">Entry extension demo</DisplayText>
        {Object.keys(fields).map(k => (
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

interface FieldGroupEditorProps {
  sdk: EditorExtensionSDK;
  fieldGroups: FieldGroup[];
  addGroup: () => void;
  // fields
}

class FieldGroupEditor extends React.Component<FieldGroupEditorProps> {
  render() {
    // const { fields } = this.props.sdk.entry;
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
  return (
    <div>
      <input
        value={name}
        onChange={e =>
          dispatch({
            type: ActionTypes.RENAME_FIELD_GROUP,
            index,
            name: e.target.value
          })
        }
      />
      <h3>{index}</h3>
      <button onClick={() => dispatch({ type: ActionTypes.DELETE_FIELD_GROUP, index })}>
        delete group
      </button>
      <div>
        {fields.map(() => (
          <p>field</p>
        ))}
      </div>
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
