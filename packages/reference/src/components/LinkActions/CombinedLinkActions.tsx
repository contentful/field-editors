import * as React from 'react';
import {
  Button,
  Dropdown,
  DropdownList,
  DropdownListItem,
} from '@contentful/forma-36-react-components';
import * as styles from './redesignStyles';
import { CreateEntryLinkButton } from '../CreateEntryLinkButton/CreateEntryLinkButton';
import { testIds as sharedTextIds, LinkActionsProps } from './LinkActions';
import { NoLinkPermissionsInfo } from './NoLinkPermissionsInfo';

const testIds = {
  ...sharedTextIds,
  actionsWrapper: 'link-actions-menu-trigger',
};

/**
 * Alternative, experimental alternative to <LinkActions /> that is planned to
 * replace the current default LinkActions in reference and media editors.
 *
 * Places both actions to create and link new, as well as link existing, behind
 * one action dropdown and introduces new copy for action labels.
 */
export function CombinedLinkActions(props: LinkActionsProps) {
  if (props.isFull) {
    return null; // Don't render link actions if we reached max allowed links.
  }
  // We don't want to render a spacious container in case there are are already
  // assets linked (in case of entries, always show it) as the border wouldn't be
  // nicely aligned with asset cards.
  const hideEmptyCard = props.entityType === 'Asset' && !props.isEmpty;
  return (
    <div className={hideEmptyCard ? '' : styles.container}>
      {!props.canCreateEntity && !props.canLinkEntity && <NoLinkPermissionsInfo />}
      {props.entityType === 'Entry' && <CombinedEntryLinkActions {...props} />}
      {props.entityType === 'Asset' && <CombinedAssetLinkActions {...props} />}
    </div>
  );
}

function CombinedEntryLinkActions(props: LinkActionsProps) {
  if (props.canCreateEntity) {
    return (
      <CreateEntryLinkButton
        testId={testIds.actionsWrapper}
        disabled={props.isDisabled}
        text={props.combinedActionsLabel || 'Add content'}
        contentTypes={props.contentTypes}
        hasPlusIcon={true}
        useExperimentalStyles={true}
        dropdownSettings={{
          position: 'bottom-left',
        }}
        onSelect={(contentTypeId) => {
          return contentTypeId ? props.onCreate(contentTypeId) : Promise.resolve();
        }}
        renderCustomDropdownItems={
          props.canLinkEntity
            ? ({ closeMenu }) => (
                <DropdownListItem
                  testId={testIds.linkExisting}
                  onClick={() => {
                    closeMenu();
                    props.onLinkExisting();
                  }}>
                  Add existing content
                </DropdownListItem>
              )
            : undefined
        }
      />
    );
  } else if (props.canLinkEntity) {
    return (
      <Button
        disabled={props.isDisabled}
        testId={testIds.linkExisting}
        className={styles.action}
        onClick={() => {
          props.onLinkExisting();
        }}
        buttonType="muted"
        icon="Link"
        size="small">
        Add existing content
      </Button>
    );
  }
  return null;
}

function CombinedAssetLinkActions(props: LinkActionsProps) {
  const [isOpen, setOpen] = React.useState(false);

  if (!props.canLinkEntity || !props.canCreateEntity) {
    if (props.canLinkEntity) {
      return (
        <Button
          disabled={props.isDisabled}
          testId={testIds.linkExisting}
          className={styles.action}
          onClick={() => {
            props.onLinkExisting();
          }}
          buttonType="muted"
          icon="Plus"
          size="small">
          Add existing media
        </Button>
      );
    }
    if (props.canCreateEntity) {
      return (
        <Button
          disabled={props.isDisabled}
          testId={testIds.createAndLink}
          className={styles.action}
          onClick={() => {
            props.onCreate();
          }}
          buttonType="muted"
          icon="Plus"
          size="small">
          Add media
        </Button>
      );
    }
    return null;
  }

  // TODO: If we fully switch to this new layout, make a more generic `CreateEntityLinkButton`
  //  that works without content types to cover asset use-case.
  return (
    <Dropdown
      isOpen={isOpen}
      onClose={() => setOpen(false)}
      toggleElement={
        <>
          <Button
            disabled={props.isDisabled}
            testId={testIds.actionsWrapper}
            className={styles.action}
            onClick={() => {
              setOpen(!isOpen);
            }}
            buttonType="muted"
            icon="Plus"
            indicateDropdown
            size="small">
            Add media
          </Button>
        </>
      }>
      <DropdownList testId={testIds.dropdown}>
        <DropdownListItem
          testId={testIds.createAndLink}
          onClick={() => {
            setOpen(false);
            props.onCreate();
          }}>
          Add new media
        </DropdownListItem>
        <DropdownListItem
          testId={testIds.linkExisting}
          onClick={() => {
            setOpen(false);
            props.onLinkExisting();
          }}>
          Add existing media
        </DropdownListItem>
      </DropdownList>
    </Dropdown>
  );
}
