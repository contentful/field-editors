import * as React from 'react';
import { Dropdown, DropdownListItem, Icon, TextLink } from '@contentful/forma-36-react-components';
import * as styles from './styles';
import { CreateEntryLinkButton } from '../CreateEntryLinkButton/CreateEntryLinkButton';
import { testIds as sharedTextIds, LinkActionsProps } from './LinkActions';

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
  // TODO: We don't want to render a spacious container in case there are
  //  are already assets linked (in case of entries, always show it) as the
  //  border wouldn't be nicely aligned with asset cards.
  return (
    <div className={styles.spaciousContainer}>
      {props.canCreateEntity && (
        <>
          {props.entityType === 'Entry' && <CombinedEntryLinkActions {...props} />}
          {props.entityType === 'Asset' && <CombinedAssetLinkActions {...props} />}
        </>
      )}
    </div>
  );
}

function CombinedEntryLinkActions(props: LinkActionsProps) {
  return (
    <CreateEntryLinkButton
      testId={testIds.actionsWrapper}
      disabled={props.isDisabled}
      text="Add content"
      contentTypes={props.contentTypes}
      hasPlusIcon={true}
      onSelect={(contentTypeId) => {
        return contentTypeId ? props.onCreate(contentTypeId) : Promise.resolve();
      }}
      renderCustomDropdownItems={({ closeMenu }) => (
        <DropdownListItem
          testId={testIds.linkExisting}
          onClick={() => {
            closeMenu();
            props.onLinkExisting();
          }}>
          Add existing content
        </DropdownListItem>
      )}
    />
  );
}

function CombinedAssetLinkActions(props: LinkActionsProps) {
  const [isOpen, setOpen] = React.useState(false);

  // TODO: If we fully switch to this new layout, make a more generic `CreateEntityLinkButton`
  //  that works without content types to cover asset use-case.
  return (
    <Dropdown
      isOpen={isOpen}
      onClose={() => setOpen(false)}
      toggleElement={
        <>
          <TextLink
            disabled={props.isDisabled}
            testId={testIds.actionsWrapper}
            onClick={() => {
              setOpen(!isOpen);
            }}
            linkType="primary"
            icon="PlusCircle">
            Add media
            <Icon
              data-test-id="dropdown-icon"
              icon="ChevronDown"
              color="secondary"
              className={styles.chevronIcon}
            />
          </TextLink>
        </>
      }>
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
    </Dropdown>
  );
}
