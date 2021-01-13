import * as React from 'react';
import { TextLink } from '@contentful/forma-36-react-components';
import * as styles from './styles';
import { EntityType, ContentType, ActionLabels } from '../../types';
import { CreateEntryLinkButton } from '../CreateEntryLinkButton/CreateEntryLinkButton';
import { NoLinkPermissionsInfo } from './NoLinkPermissionsInfo';

export interface LinkActionsProps {
  entityType: EntityType;
  contentTypes: ContentType[];
  canCreateEntity: boolean;
  canLinkEntity: boolean;
  canLinkMultiple: boolean;
  isDisabled: boolean;
  isFull: boolean;
  isEmpty: boolean;
  onCreate: (contentType?: string, index?: number) => Promise<unknown>;
  onLinkExisting: (index?: number) => void;
  actionLabels?: Partial<ActionLabels>;
  combinedActionsLabel?: string | React.ReactElement;
}

const defaultEntryLabels: ActionLabels = {
  createNew: (props) =>
    props?.contentType ? `Create new ${props.contentType} and link` : 'Create new entry and link',
  linkExisting: (props) =>
    props?.canLinkMultiple ? 'Link existing entries' : 'Link existing entry',
};

const defaultAssetLabels: ActionLabels = {
  createNew: () => `Create new asset and link`,
  linkExisting: (props) =>
    props?.canLinkMultiple ? 'Link existing assets' : 'Link existing asset',
};

export const testIds = {
  dropdown: 'linkEditor.dropdown',
  createAndLink: 'linkEditor.createAndLink',
  createAndLinkWrapper: 'create-entry-button-menu-trigger',
  linkExisting: 'linkEditor.linkExisting',
};

export function LinkActions(props: LinkActionsProps) {
  if (props.isFull) {
    return null; // Don't render link actions if we reached max allowed links.
  }
  const defaultLabels = props.entityType === 'Entry' ? defaultEntryLabels : defaultAssetLabels;
  const labels = {
    ...defaultLabels,
    ...props.actionLabels,
  };

  return (
    <div className={styles.container}>
      {props.canCreateEntity && (
        <>
          {props.entityType === 'Entry' && (
            <CreateEntryLinkButton
              testId={testIds.createAndLink}
              disabled={props.isDisabled}
              text={labels.createNew({
                contentType:
                  props.contentTypes.length === 1 ? props.contentTypes[0].name : undefined,
              })}
              contentTypes={props.contentTypes}
              hasPlusIcon={true}
              onSelect={(contentTypeId) => {
                return contentTypeId ? props.onCreate(contentTypeId) : Promise.resolve();
              }}
            />
          )}
          {props.entityType === 'Asset' && (
            <TextLink
              disabled={props.isDisabled}
              testId={testIds.createAndLink}
              onClick={() => {
                props.onCreate();
              }}
              linkType="primary"
              icon="Plus">
              {labels.createNew()}
            </TextLink>
          )}
          <span className={styles.separator} />
        </>
      )}
      {props.canLinkEntity && (
        <TextLink
          disabled={props.isDisabled}
          testId={testIds.linkExisting}
          onClick={() => {
            props.onLinkExisting();
          }}
          linkType="primary"
          icon="Link">
          {labels.linkExisting({ canLinkMultiple: props.canLinkMultiple })}
        </TextLink>
      )}

      {!props.canCreateEntity && !props.canLinkEntity && <NoLinkPermissionsInfo />}
    </div>
  );
}
