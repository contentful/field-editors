import * as React from 'react';
import { CardDragHandle } from '@contentful/f36-components';
import {
  ModalContent,
  Text,
  TextLink,
  Paragraph,
  Button,
  IconButton,
  FormControl,
  TextInput,
  Menu,
  Card,
} from '@contentful/f36-components';
import { findUnassignedFields, AppContext, SDKContext } from './shared';
import { FieldType, FieldGroupType } from './types';
import { ActionTypes } from './types';
import styles from './styles';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';

import { CloseIcon, ChevronDownIcon, ChevronUpIcon } from '@contentful/f36-icons';

interface FieldGroupsEditorProps {
  fieldGroups: FieldGroupType[];
  addGroup: () => void;
  onClose: () => void;
}

const DragHandle = SortableHandle(() => (
  <CardDragHandle className={styles.handle}>Reorder item</CardDragHandle>
));

const SortableFieldItem = SortableElement(
  ({ field, groupId }: { field: FieldType; groupId: string }) => {
    const { dispatch } = React.useContext(AppContext);
    const sdk = React.useContext(SDKContext);
    const fieldDetails = sdk.contentType.fields.find(({ id }) => id === field.id);

    return (
      <Card className={styles.card}>
        <div className={styles.cardInfo}>
          <DragHandle />
          <Paragraph marginBottom="none" className={styles.fieldName}>
            {field.name}
          </Paragraph>
          {fieldDetails ? <Paragraph marginBottom="none">{fieldDetails.type}</Paragraph> : null}
        </div>
        <IconButton
          variant="transparent"
          icon={<CloseIcon variant="negative" />}
          aria-label="Remove field"
          onClick={() =>
            dispatch({
              type: ActionTypes.REMOVE_FIELD_FROM_GROUP,
              groupId,
              fieldKey: field.id,
            })
          }
        />
      </Card>
    );
  }
);

const SortableFieldList = SortableContainer(
  ({ items, groupId }: { items: FieldType[]; groupId: string }) => (
    <ul className={styles.listContainer}>
      {items.map((field: FieldType, index: number) => (
        <SortableFieldItem groupId={groupId} key={`item-${field.id}`} index={index} field={field} />
      ))}
    </ul>
  )
);

export class FieldGroupsEditor extends React.Component<FieldGroupsEditorProps> {
  render() {
    const { fieldGroups } = this.props;

    return (
      <React.Fragment>
        <div className={styles.controls}>
          <Text as="p" fontColor="gray500" marginTop="spacingXs">
            Group fields to seperate concerns in the entry editor
          </Text>
          <div>
            <Button variant="primary" onClick={this.props.addGroup}>
              Add Group
            </Button>
            <Button className={styles.saveButton} variant="positive" onClick={this.props.onClose}>
              Save
            </Button>
          </div>
        </div>
        <ModalContent>
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
        </ModalContent>
      </React.Fragment>
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

  const updateName = (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch({
      type: ActionTypes.RENAME_FIELD_GROUP,
      groupId,
      name: e.currentTarget.value,
    });

  const unassignedFields = findUnassignedFields(state);

  const onSortEnd = ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
    dispatch({
      type: ActionTypes.MOVE_FIELD_IN_GROUP,
      groupId,
      oldIndex,
      newIndex,
    });
  };

  return (
    <div className={styles.editor}>
      <FormControl id={`${groupId}-name-input`}>
        <FormControl.Label>Name</FormControl.Label>
        <TextInput name={`${groupId}-name-input`} value={name} onChange={updateName} />
      </FormControl>
      <FormControl>
        <FormControl.Label htmlFor="entry-app-collapsible" className={styles.formLabel}>
          Fields
        </FormControl.Label>
        {unassignedFields.length > 0 ? (
          <Menu>
            <Menu.Trigger>
              <Button endIcon={<ChevronDownIcon />} size="small" variant="secondary">
                Select a field to add
              </Button>
            </Menu.Trigger>
            <Menu.List>
              {unassignedFields.map(({ id, name }: FieldType) => (
                <Menu.Item
                  onClick={() => {
                    dispatch({
                      type: ActionTypes.ADD_FIELD_TO_GROUP,
                      groupId,
                      fieldKey: id,
                      fieldName: name,
                    });
                  }}
                  key={id}>
                  {name}
                </Menu.Item>
              ))}
            </Menu.List>
          </Menu>
        ) : (
          <FormControl.HelpText>No available fields to add.</FormControl.HelpText>
        )}
      </FormControl>
      <SortableFieldList
        distance={1 /* this hack is to allow buttons in the drag containers to work*/}
        onSortEnd={onSortEnd}
        items={fields}
        groupId={groupId}
      />
      <div>
        <TextLink
          as="button"
          className={styles.fieldGroupConfigurationTextLink}
          variant="negative"
          icon={<CloseIcon />}
          onClick={() => dispatch({ type: ActionTypes.DELETE_FIELD_GROUP, groupId })}>
          Remove
        </TextLink>
        {!last ? (
          <TextLink
            as="button"
            className={styles.fieldGroupConfigurationTextLink}
            icon={<ChevronDownIcon />}
            onClick={() => dispatch({ type: ActionTypes.MOVE_FIELD_GROUP_DOWN, groupId })}>
            Move down
          </TextLink>
        ) : null}
        {!first ? (
          <TextLink
            as="button"
            className={styles.fieldGroupConfigurationTextLink}
            icon={<ChevronUpIcon />}
            onClick={() => dispatch({ type: ActionTypes.MOVE_FIELD_GROUP_UP, groupId })}>
            Move up
          </TextLink>
        ) : null}
      </div>
    </div>
  );
};
