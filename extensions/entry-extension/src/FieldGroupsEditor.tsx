import * as React from 'react';
import {
  Modal,
  Button,
  Dropdown,
  DropdownList,
  DropdownListItem,
  TextLink,
  HelpText,
  Icon,
  TextField,
  FormLabel,
  FieldGroup,
  Card,
  Paragraph,
  IconButton,
  CardDragHandle
} from '@contentful/forma-36-react-components';
import tokens from '@contentful/forma-36-tokens';
import { findUnassignedFields, AppContext, SDKContext } from './shared';
import { FieldType, FieldGroupType } from './types';
import { ActionTypes } from './types';
import { css } from 'emotion';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';

interface FieldGroupsEditorProps {
  fieldGroups: FieldGroupType[];
  addGroup: () => void;
  onClose: () => void;
}

const styles = {
  controls: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${tokens.spacingM} ${tokens.spacingXl}`,
    borderBottom: `1px solid ${tokens.colorElementMid}`
  }),
  saveButton: css({
    marginLeft: tokens.spacingS
  }),
  editor: css({
    background: tokens.colorElementLightest,
    padding: tokens.spacingL,
    marginBottom: tokens.spacingM
  }),
  dropDownTrigger: css({
    width: '100%'
  }),
  card: css({
    marginBottom: tokens.spacingXs,
    paddingTop: tokens.spacingXs,
    paddingBottom: tokens.spacingXs,
    paddingLeft: tokens.spacing2Xs,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 102 // This is to stop the sortable cards disappearing behind their container
  }),
  fieldName: css({
    marginRight: tokens.spacingXs,
    marginLeft: tokens.spacingXs,
    fontWeight: 700
  }),
  handle: css({
    border: 'none',
    background: 'none'
  })
};

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
        <div className={css({ display: 'flex', alignItems: 'center' })}>
          <DragHandle />
          <Paragraph className={styles.fieldName}>{field.name}</Paragraph>
          {fieldDetails ? <Paragraph>{fieldDetails.type}</Paragraph> : null}
        </div>
        <IconButton
          label="Remove field"
          buttonType="negative"
          iconProps={{ icon: 'Close' }}
          onClick={() =>
            dispatch({
              type: ActionTypes.REMOVE_FIELD_FROM_GROUP,
              groupId,
              fieldKey: field.id
            })
          }
        />
      </Card>
    );
  }
);

const SortableFieldList = SortableContainer(
  ({ items, groupId }: { items: FieldType[]; groupId: string }) => (
    <ul className={css({ paddingLeft: '0px' })}>
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
          <HelpText>Group fields to seperate concerns in the entry editor</HelpText>
          <div>
            <Button onClick={this.props.addGroup}>Add Group</Button>
            <Button
              className={styles.saveButton}
              buttonType="positive"
              onClick={this.props.onClose}>
              save
            </Button>
          </div>
        </div>
        <Modal.Content>
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
  groupId
}: FieldGroupProps) => {
  const { state, dispatch } = React.useContext(AppContext);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const updateName = (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch({
      type: ActionTypes.RENAME_FIELD_GROUP,
      groupId,
      name: e.currentTarget.value
    });

  const unassignedFields = findUnassignedFields(state);
  const closeDropdown = () => setDropdownOpen(false);
  const openDropdown = () => {
    if (unassignedFields.length > 0) {
      setDropdownOpen(true);
    } else {
      setDropdownOpen(false);
    }
  };

  const onSortEnd = ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
    dispatch({
      type: ActionTypes.MOVE_FIELD_IN_GROUP,
      groupId,
      oldIndex,
      newIndex
    });
  };

  return (
    <div className={styles.editor}>
      <TextField
        id={`${groupId}-name-input`}
        name={`${groupId}-name-input`}
        labelText="Name"
        onChange={updateName}
        value={name}
      />
      <FieldGroup>
        <FormLabel className={css({ marginTop: tokens.spacingS })}>Fields</FormLabel>
        <Dropdown
          className={styles.dropDownTrigger}
          isOpen={dropdownOpen}
          onClose={closeDropdown}
          toggleElement={
            <Button
              className={styles.dropDownTrigger}
              size="small"
              buttonType="muted"
              onClick={openDropdown}
              indicateDropdown>
              Select a field to add
            </Button>
          }>
          <DropdownList>
            {unassignedFields.map(({ id, name }: FieldType) => (
              <DropdownListItem
                onClick={() => {
                  dispatch({
                    type: ActionTypes.ADD_FIELD_TO_GROUP,
                    groupId,
                    fieldKey: id,
                    fieldName: name
                  });
                  closeDropdown();
                }}
                key={id}>
                {name}
              </DropdownListItem>
            ))}
          </DropdownList>
        </Dropdown>
      </FieldGroup>
      <SortableFieldList
        distance={1 /* this hack is to allow buttons in the drag containers to work*/}
        onSortEnd={onSortEnd}
        items={fields}
        groupId={groupId}
      />
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
