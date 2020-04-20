import * as React from 'react';
import { render } from 'react-dom';
import { DisplayText, TextLink, Modal } from '@contentful/forma-36-react-components';
import { init, locations, EditorExtensionSDK } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import './index.css';
import { FieldGroupsEditor } from './FieldGroupsEditor';
import { CollapsibleFieldGroup } from './CollapsibleFieldGroup';
import { findUnassignedFields, AppContext, SDKContext } from './shared';
import { useAppState } from './state';
import { ActionTypes } from './types';

interface AppProps {
  sdk: EditorExtensionSDK;
}

export const App: React.FunctionComponent<AppProps> = (props: AppProps) => {
  const { fields } = props.sdk.entry;

  const [state, dispatch] = useAppState(props.sdk.contentType.fields);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const closeDialog = () => setDialogOpen(false);
  const openDialog = () => setDialogOpen(true);

  const unassignedFields = findUnassignedFields(state);

  return (
    <SDKContext.Provider value={props.sdk}>
      <AppContext.Provider value={{ state, dispatch }}>
        <DisplayText className="f36-margin--l" testId="title">
          Entry extension demo
        </DisplayText>
        {state.fieldGroups.map(fieldGroup => (
          <CollapsibleFieldGroup
            key={fieldGroup.id}
            locales={props.sdk.locales}
            fieldGroup={fieldGroup}
            fields={fields}
          />
        ))}
        {unassignedFields.length > 0 ? ( // TODO: ask fabianm
          <CollapsibleFieldGroup
            locales={props.sdk.locales}
            fieldGroup={{
              name: 'Unassigned fields',
              fields: unassignedFields,
              id: 'unassigned-fields'
            }}
            fields={fields}
          />
        ) : null}
        <TextLink className="f36-margin--l" onClick={openDialog}>
          Edit field groups
        </TextLink>
        <Modal size="large" isShown={dialogOpen} onClose={closeDialog}>
          {() => (
            <React.Fragment>
              <Modal.Header onClose={closeDialog} title="Edit field groups" />
              <FieldGroupsEditor
                addGroup={() => dispatch({ type: ActionTypes.CREATE_FIELD_GROUP })}
                fieldGroups={state.fieldGroups}
                onClose={closeDialog}
              />
            </React.Fragment>
          )}
        </Modal>
      </AppContext.Provider>
    </SDKContext.Provider>
  );
};

init(sdk => {
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
