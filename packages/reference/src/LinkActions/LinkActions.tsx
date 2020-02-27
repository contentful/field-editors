import * as React from 'react';
import { TextLink } from '@contentful/forma-36-react-components';
import * as styles from './styles';
import { ReferenceEntityType, ContentType } from '../types';
import { CreateEntryLinkButton } from '../CreateEntryLinkButton/CreateEntryLinkButton';

interface LinkActionsProps {
  entityType: ReferenceEntityType;
  contentTypes: ContentType[];
  canCreateEntity: boolean;
  multiple: boolean;
  disabled: boolean;
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
          {props.entityType === 'entry' && (
            <CreateEntryLinkButton
              testId={testIds.createAndLink}
              disabled={props.disabled}
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
          {props.entityType === 'asset' && (
            <TextLink
              disabled={props.disabled}
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
      <TextLink
        disabled={props.disabled}
        testId={testIds.linkExisting}
        onClick={() => {
          props.onLinkExisting();
        }}
        linkType="primary"
        icon="Link">
        {props.entityType === 'entry' && labels.linkExisting(props.multiple ? 'entries' : 'entry')}
        {props.entityType === 'asset' && labels.linkExisting(props.multiple ? 'assets' : 'asset')}
      </TextLink>
    </div>
  );
}
