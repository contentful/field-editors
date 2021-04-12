import * as React from 'react';
import { Button } from '@contentful/forma-36-react-components';
import * as styles from './styles';
import {
  EntityType,
  ContentType,
  ActionLabels,
  Entry,
  Asset,
  NavigatorSlideInfo,
} from '../../types';
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
  onCreated: (entity: Entry | Asset, index?: number, slide?: NavigatorSlideInfo) => void;
  onLinkExisting: (index?: number) => void;
  onLinkedExisting: (entities: Array<Entry | Asset>, index?: number) => void;
  actionLabels?: Partial<ActionLabels>;
  combinedActionsLabel?: string | React.ReactElement;
  itemsLength?: number
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
                return contentTypeId ? props.onCreate(contentTypeId, props.itemsLength) : Promise.resolve();
              }}
            />
          )}
          {props.entityType === 'Asset' && (
            <Button
              disabled={props.isDisabled}
              testId={testIds.createAndLink}
              onClick={() => {
                props.onCreate(undefined, props.itemsLength);
              }}
              buttonType="muted"
              icon="Plus"
              size="small">
              {labels.createNew()}
            </Button>
          )}
          <span className={styles.separator} />
        </>
      )}
      {props.canLinkEntity && (
        <Button
          disabled={props.isDisabled}
          testId={testIds.linkExisting}
          onClick={() => {
            props.onLinkExisting();
          }}
          buttonType="muted"
          icon="Link"
          size="small">
          {labels.linkExisting({ canLinkMultiple: props.canLinkMultiple })}
        </Button>
      )}

      {!props.canCreateEntity && !props.canLinkEntity && <NoLinkPermissionsInfo />}
    </div>
  );
}
