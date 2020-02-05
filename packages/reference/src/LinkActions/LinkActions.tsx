import * as React from 'react';
import { TextLink } from '@contentful/forma-36-react-components';
import * as styles from './styles';
import { EntityType } from '../types';

interface LinkActionsProps {
  entityType: EntityType;
  canCreateEntity: boolean;
  multiple: boolean;
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
  console.log(props);
  return (
    <div className={styles.container}>
      {props.entityType === 'entry' && (
        <TextLink
          className={styles.createLink}
          testId={testIds.createAndLink}
          onClick={() => {
            console.log('create new asset and link');
          }}
          linkType="primary"
          icon="Plus">
          {labels.createAndLink('asset')}
        </TextLink>
      )}
      {props.entityType === 'asset' && (
        <TextLink
          className={styles.createLink}
          testId={testIds.createAndLink}
          onClick={() => {
            console.log('create new asset and link');
          }}
          linkType="primary"
          icon="Plus">
          {labels.createAndLink('asset')}
        </TextLink>
      )}
      <TextLink
        testId={testIds.linkExisting}
        onClick={() => {
          console.log('open click');
        }}
        linkType="primary"
        icon="Link">
        {props.entityType === 'entry' && labels.linkExisting(props.multiple ? 'entries' : 'entry')}
        {props.entityType === 'asset' && labels.linkExisting(props.multiple ? 'assets' : 'asset')}
      </TextLink>
    </div>
  );
}
