import * as React from 'react';
import { TextLink } from '@contentful/forma-36-react-components';
import * as styles from './styles';
import { EntityType, ContentType, ActionLabels } from '../../types';
import { CreateEntryLinkButton } from '../CreateEntryLinkButton/CreateEntryLinkButton';

interface LinkActionsProps {
  entityType: EntityType;
  contentTypes: ContentType[];
  canCreateEntity: boolean;
  canLinkEntity: boolean;
  multiple: boolean;
  isDisabled: boolean;
  onCreate: (contentType?: string) => Promise<unknown>;
  onLinkExisting: () => void;
  actionLabels?: Partial<ActionLabels>;
}

const defaultEntryLabels: ActionLabels = {
  createNew: (props) => {
    if (props?.contentType) {
      return `Create new ${props.contentType} and link`;
    }
    return 'Create new entry and link';
  },
  linkExisting: (props) => {
    if (props?.multiple) {
      return 'Link existing entries';
    }
    return 'Link existing entry';
  },
};

const defaultAssetLabels: ActionLabels = {
  createNew: () => `Create new asset and link`,
  linkExisting: (props) => {
    if (props?.multiple) {
      return 'Link existing assets';
    }
    return 'Link existing asset';
  },
};

export const testIds = {
  createAndLink: 'linkEditor.createAndLink',
  createAndLinkWrapper: 'create-entry-button-menu-trigger',
  linkExisting: 'linkEditor.linkExisting',
};

export function LinkActions(props: LinkActionsProps) {
  const labels = Object.assign(
    {},
    props.actionLabels,
    props.entityType === 'Entry' ? defaultEntryLabels : defaultAssetLabels
  );

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
                if (contentTypeId) {
                  return props.onCreate(contentTypeId);
                }
                return Promise.resolve();
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
          {props.entityType === 'Entry' && labels.linkExisting({ multiple: props.multiple })}
          {props.entityType === 'Asset' && labels.linkExisting({ multiple: props.multiple })}
        </TextLink>
      )}
    </div>
  );
}
