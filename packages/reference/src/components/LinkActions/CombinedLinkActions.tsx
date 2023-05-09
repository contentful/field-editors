import * as React from 'react';

import { Button, Menu } from '@contentful/f36-components';
import { LinkIcon, PlusIcon, ChevronDownIcon } from '@contentful/f36-icons';

import { CreateEntryLinkButton } from '../CreateEntryLinkButton/CreateEntryLinkButton';
import { testIds as sharedTextIds, LinkActionsProps } from './LinkActions';
import { NoLinkPermissionsInfo } from './NoLinkPermissionsInfo';
import * as styles from './redesignStyles';

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
        customDropdownItems={
          props.canLinkEntity ? (
            <Menu.Item
              testId={testIds.linkExisting}
              onClick={() => {
                props.onLinkExisting();
              }}>
              Add existing content
            </Menu.Item>
          ) : undefined
        }
      />
    );
  } else if (props.canLinkEntity) {
    return (
      <Button
        isDisabled={props.isDisabled}
        testId={testIds.linkExisting}
        className={styles.action}
        onClick={() => {
          props.onLinkExisting();
        }}
        variant="secondary"
        startIcon={<LinkIcon />}
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
          isDisabled={props.isDisabled}
          testId={testIds.linkExisting}
          className={styles.action}
          onClick={() => {
            props.onLinkExisting();
          }}
          variant="secondary"
          startIcon={<PlusIcon />}
          size="small">
          Add existing media
        </Button>
      );
    }
    if (props.canCreateEntity) {
      return (
        <Button
          isDisabled={props.isDisabled}
          testId={testIds.createAndLink}
          className={styles.action}
          onClick={() => {
            props.onCreate();
          }}
          variant="secondary"
          startIcon={<PlusIcon />}
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
    <Menu
      isOpen={isOpen}
      onClose={() => {
        setOpen(false);
      }}
      onOpen={() => {
        setOpen(true);
      }}>
      <Menu.Trigger>
        <Button
          endIcon={<ChevronDownIcon />}
          isDisabled={props.isDisabled}
          testId={testIds.actionsWrapper}
          className={styles.action}
          variant="secondary"
          startIcon={<PlusIcon />}
          size="small">
          Add media
        </Button>
      </Menu.Trigger>
      {isOpen && (
        <Menu.List testId={testIds.dropdown}>
          <Menu.Item
            testId={testIds.linkExisting}
            onClick={() => {
              props.onLinkExisting();
            }}>
            Add existing media
          </Menu.Item>
          <Menu.Item
            testId={testIds.createAndLink}
            onClick={() => {
              props.onCreate();
            }}>
            Add new media
          </Menu.Item>
        </Menu.List>
      )}
    </Menu>
  );
}
