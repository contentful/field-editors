import * as React from 'react';
import { TextLink } from '@contentful/forma-36-react-components';
import * as styles from './styles';
import { EntityType, ContentType } from '../../types';
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
}

export const labels = {
  createAndLink: (name: string) => `Create new ${name} and link`,
  linkExisting: (name: string) => `Link existing ${name}`
};

export const testIds = {
  createAndLink: 'linkEditor.createAndLink',
  createAndLinkWrapper: 'create-entry-button-menu-trigger',
  linkExisting: 'linkEditor.linkExisting'
};

export function LinkActions(props: LinkActionsProps) {
  return (
    <div className={styles.container}>
      {props.canCreateEntity && (
        <>
          {props.entityType === 'Entry' && (
            <CreateEntryLinkButton
              testId={testIds.createAndLink}
              disabled={props.isDisabled}
              text={labels.createAndLink(
                props.contentTypes.length === 1 ? props.contentTypes[0].name : 'entry'
              )}
              contentTypes={props.contentTypes}
              hasPlusIcon={true}
              onSelect={contentTypeId => {
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
              {labels.createAndLink('asset')}
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
          {props.entityType === 'Entry' &&
            labels.linkExisting(props.multiple ? 'entries' : 'entry')}
          {props.entityType === 'Asset' && labels.linkExisting(props.multiple ? 'assets' : 'asset')}
        </TextLink>
      )}
    </div>
  );
}
