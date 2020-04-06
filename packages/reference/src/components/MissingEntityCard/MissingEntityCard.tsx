import React from 'react';
import { Card, SectionHeading, IconButton } from '@contentful/forma-36-react-components';
import { EntityType } from '../../types';
import * as styles from './styles';

export function MissingEntityCard(props: {
  entityType: EntityType;
  disabled: boolean;
  onRemove: Function;
}) {
  return (
    <Card className={styles.card}>
      <SectionHeading>
        {props.entityType === 'Entry' && 'Entry is missing or inaccessible'}
        {props.entityType === 'Asset' && 'Asset is missing or inaccessible'}
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
