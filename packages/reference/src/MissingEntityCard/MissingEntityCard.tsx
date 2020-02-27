import React from 'react';
import { Card, SectionHeading, IconButton } from '@contentful/forma-36-react-components';
import { ReferenceEntityType } from '../types';
import * as styles from './styles';

export function MissingEntityCard(props: {
  entityType: ReferenceEntityType;
  disabled: boolean;
  onRemove: Function;
}) {
  return (
    <Card className={styles.card}>
      <SectionHeading>
        {props.entityType === 'entry' && 'Entry is missing or inaccessible'}
        {props.entityType === 'asset' && 'Asset is missing or inaccessible'}
      </SectionHeading>
      {!props.disabled && (
        <IconButton
          buttonType="muted"
          label="Delete"
          iconProps={{ icon: 'Close' }}
          onClick={() => {
            props.onRemove();
          }}
        />
      )}
    </Card>
  );
}
