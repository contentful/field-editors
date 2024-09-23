import * as React from 'react';
import { render } from 'react-dom';
import { Modal, ModalHeader, GlobalStyles } from '@contentful/f36-components';
import { init, locations, EditorAppSDK, DialogAppSDK } from '@contentful/app-sdk';
import { FieldGroupsEditor } from './FieldGroupsEditor';
import { CollapsibleFieldGroup } from './CollapsibleFieldGroup';
import { findUnassignedFields, AppContext, SDKContext } from './shared';
import { useAppState } from './state';
import { ActionTypes, FieldType } from './types';
import { Field } from './Field';
import { renderMarkdownDialog } from '@contentful/field-editor-markdown';
import { renderRichTextDialog } from '@contentful/field-editor-rich-text';
import styles from './styles';

import { TextLink } from '@contentful/f36-components';

import { EditIcon } from '@contentful/f36-icons';

interface AppProps {
  sdk: EditorAppSDK;
}

const storageId = (sdk: EditorAppSDK): string => {
  const contentId = sdk.contentType.sys.id;
  const spaceId = sdk.contentType.sys.space?.sys.id;
  const environmentId = sdk.contentType.sys.environment?.sys.id;

  return `${contentId}-${spaceId}-${environmentId}`;
};

export const App: React.FunctionComponent<AppProps> = (props: AppProps) => {
  const { fields } = props.sdk.entry;

  const [state, dispatch] = useAppState(
    props.sdk.contentType.fields,
    storageId(props.sdk),
    props.sdk.contentType.sys.updatedAt
  );

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const closeDialog = () => setDialogOpen(false);
  const openDialog = () => setDialogOpen(true);

  const unassignedFields = findUnassignedFields(state);

  return (
    <SDKContext.Provider value={props.sdk}>
      <AppContext.Provider value={{ state, dispatch }}>
        <div className={styles.widthContainer}>
          <TextLink
            as="button"
            icon={<EditIcon />}
            className={styles.editGroupsButton}
            onClick={openDialog}
          >
            Edit field groups
          </TextLink>
        </div>
        <Modal size="large" isShown={dialogOpen} onClose={closeDialog}>
          {() => (
            <React.Fragment>
              <ModalHeader onClose={closeDialog} title="Edit field groups" />
              <FieldGroupsEditor
                addGroup={() => dispatch({ type: ActionTypes.CREATE_FIELD_GROUP })}
                fieldGroups={state.fieldGroups}
                onClose={closeDialog}
              />
            </React.Fragment>
          )}
        </Modal>

        <div className={styles.fieldGroupsContainer}>
          {state.fieldGroups.map((fieldGroup) => (
            <CollapsibleFieldGroup
              key={fieldGroup.id}
              locales={props.sdk.locales}
              fieldGroup={fieldGroup}
              fields={fields}
            />
          ))}

          <div className={styles.widthContainer}>
            <div>
              {unassignedFields.map((k: FieldType) => (
                <Field key={k.id} field={fields[k.id]} locales={props.sdk.locales} />
              ))}
            </div>
          </div>
        </div>
      </AppContext.Provider>
    </SDKContext.Provider>
  );
};

function renderAtRoot(element: JSX.Element) {
  render(
    <>
      <GlobalStyles />
      {element}
    </>,
    document.getElementById('root')
  );
}

init((sdk) => {
  if (sdk.location.is(locations.LOCATION_ENTRY_EDITOR)) {
    renderAtRoot(<App sdk={sdk as EditorAppSDK} />);
  } else if (sdk.location.is(locations.LOCATION_DIALOG)) {
    const dialogSdk = sdk as DialogAppSDK;
    const invocationParams = sdk.parameters.invocation as { type: string };
    if (invocationParams.type.startsWith('markdown')) {
      renderAtRoot(renderMarkdownDialog(dialogSdk as any));
    } else if (invocationParams.type.startsWith('rich-text')) {
      renderAtRoot(renderRichTextDialog(dialogSdk as any));
    }
  }
});

/**
 * By default, iframe of the app is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
