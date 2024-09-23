import * as React from 'react';

import { Button } from '@contentful/f36-components';
import { PlusIcon, LinkIcon } from '@contentful/f36-icons';

import {
  ContentEntityType,
  ContentType,
  ActionLabels,
  Entry,
  Asset,
  NavigatorSlideInfo,
} from '../../types';
import { CreateEntryLinkButton } from '../CreateEntryLinkButton/CreateEntryLinkButton';
import { NoLinkPermissionsInfo } from './NoLinkPermissionsInfo';
import * as styles from './styles';

export interface LinkActionsProps {
  entityType: ContentEntityType;
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
  itemsLength?: number;
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
                return contentTypeId
                  ? props.onCreate(contentTypeId, props.itemsLength)
                  : Promise.resolve();
              }}
            />
          )}
          {props.entityType === 'Asset' && (
            <Button
              isDisabled={props.isDisabled}
              testId={testIds.createAndLink}
              onClick={() => {
                props.onCreate(undefined, props.itemsLength);
              }}
              variant="secondary"
              startIcon={<PlusIcon />}
              size="small">
              {labels.createNew()}
            </Button>
          )}
          <span className={styles.separator} />
        </>
      )}
      {props.canLinkEntity && (
        <Button
          isDisabled={props.isDisabled}
          testId={testIds.linkExisting}
          onClick={() => {
            props.onLinkExisting();
          }}
          variant="secondary"
          startIcon={<LinkIcon />}
          size="small">
          {labels.linkExisting({ canLinkMultiple: props.canLinkMultiple })}
        </Button>
      )}

      {!props.canCreateEntity && !props.canLinkEntity && <NoLinkPermissionsInfo />}
    </div>
  );
}
