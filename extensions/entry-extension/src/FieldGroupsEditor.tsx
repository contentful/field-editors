import * as React from 'react';
import {
  Modal,
  Button,
  Dropdown,
  DropdownList,
  DropdownListItem,
  TextLink,
  Icon,
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
        {fieldGroups.map(({ name, fields, id }, index) => (
          <FieldGroupEditor
            first={index === 0}
            last={index === fieldGroups.length - 1}
            key={id}
            groupId={id}
            name={name}
            fields={fields}
          />
        ))}
      </Modal.Content>
    );
  }
}

interface FieldGroupProps {
  first: boolean;
  last: boolean;
  name: string;
  groupId: string;
  fields: FieldType[];
}

const FieldGroupEditor: React.FC<FieldGroupProps> = ({
  first,
  last,
  name,
  fields,
  groupId,
}: FieldGroupProps) => {
  const { state, dispatch } = React.useContext(AppContext);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const updateName = (e: React.FormEvent<HTMLInputElement>) =>
    dispatch({
      type: ActionTypes.RENAME_FIELD_GROUP,
      groupId,
      name: e.currentTarget.value,
    });

  return (
    <div>
      <input value={name} onChange={updateName} />
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
                dispatch({
                  type: ActionTypes.ADD_FIELD_TO_GROUP,
                  groupId,
                  fieldKey: id,
                  fieldName: name,
                })
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
      <div>
        <TextLink
          linkType="negative"
          onClick={() => dispatch({ type: ActionTypes.DELETE_FIELD_GROUP, groupId })}>
          <Icon color="negative" icon="Close" /> Remove
        </TextLink>
        {!last ? (
          <TextLink onClick={() => dispatch({ type: ActionTypes.MOVE_FIELD_GROUP_DOWN, groupId })}>
            <Icon icon="ChevronDown" /> Move down
          </TextLink>
        ) : null}
        {!first ? (
          <TextLink onClick={() => dispatch({ type: ActionTypes.MOVE_FIELD_GROUP_UP, groupId })}>
            <Icon icon="ChevronUp" /> Move up
          </TextLink>
        ) : null}
      </div>
    </div>
  );
};
