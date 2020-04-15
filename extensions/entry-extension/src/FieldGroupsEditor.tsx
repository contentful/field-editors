import * as React from 'react';
import {
  Modal,
  Button,
  Dropdown,
  DropdownList,
  DropdownListItem
} from '@contentful/forma-36-react-components';
import { EditorExtensionSDK } from 'contentful-ui-extensions-sdk';
import { ActionTypes, FieldKey, FieldGroup, findUnassignedFields, AppContext } from './shared';

// -----------------
// THE EDITOR DIALOGUE
// -----------------
interface FieldGroupsEditorProps {
  sdk: EditorExtensionSDK;
  fieldGroups: FieldGroup[];
  addGroup: () => void;
  onClose: () => void;
  // fields
}

export class FieldGroupsEditor extends React.Component<FieldGroupsEditorProps> {
  render() {
    const { fieldGroups } = this.props;

    return (
      <Modal.Content>
        <p> group fields to seperate concerns in the entry editor</p>
        <Button onClick={this.props.addGroup}>Add Group</Button>
        <Button onClick={this.props.onClose}>save</Button>
        {fieldGroups.map(({ name, fields }, index) => (
          <FieldGroupEditor name={name} fields={fields} index={index} />
        ))}
      </Modal.Content>
    );
  }
}

interface FieldGroupProps extends FieldGroup {
  index: number;
}

const FieldGroupEditor: React.FC<FieldGroupProps> = ({ name, fields, index }: FieldGroupProps) => {
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
            name: e.target.value
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
