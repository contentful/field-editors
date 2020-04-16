import * as React from 'react';
import {
  Modal,
  Button,
  Dropdown,
  DropdownList,
  DropdownListItem,
} from '@contentful/forma-36-react-components';
import { ActionTypes, FieldType, FieldGroupType, findUnassignedFields, AppContext } from './shared';

// -----------------
// THE EDITOR DIALOGUE
// -----------------
interface FieldGroupsEditorProps {
  fieldGroups: FieldGroupType[];
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

interface FieldGroupProps {
  name: string;
  index: number;
  fields: FieldType[];
}

const FieldGroupEditor: React.FC<FieldGroupProps> = ({ name, fields, index }: FieldGroupProps) => {
  const { state, dispatch } = React.useContext(AppContext);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const updateName = (e: React.FormEvent<HTMLInputElement>) =>
    dispatch({
      type: ActionTypes.RENAME_FIELD_GROUP,
      index,
      name: e.currentTarget.value,
    });

  return (
    <div>
      <input value={name} onChange={updateName} />
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
          {findUnassignedFields(state).map(({ id, name }: FieldType) => (
            <DropdownListItem
              onClick={() =>
                dispatch({ type: ActionTypes.ADD_FIELD_TO_GROUP, index, fieldKey: id })
              }
              key={id}>
              {name}
            </DropdownListItem>
          ))}
        </DropdownList>
      </Dropdown>
      {fields.map((field: FieldType) => (
        <div key={field.id}>{field.name}</div>
      ))}
    </div>
  );
};
