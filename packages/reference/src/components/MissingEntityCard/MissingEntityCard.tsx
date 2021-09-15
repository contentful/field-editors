import React from 'react';
import { Card, IconButton } from '@contentful/forma-36-react-components';
import { EntityType } from '../../types';
import * as styles from './styles';

import { SectionHeading } from '@contentful/f36-components';

export function MissingEntityCard(props: {
  entityType: EntityType;
  asSquare?: boolean;
  isDisabled: boolean;
  onRemove?: Function;
}) {
  return (
    <Card className={styles.card}>
      <div className={props.asSquare ? styles.squareCard : ''}>
        <SectionHeading marginBottom="none">
          {props.entityType === 'Entry' && 'Entry is missing or inaccessible'}
          {props.entityType === 'Asset' && 'Asset is missing or inaccessible'}
        </SectionHeading>
      </div>
      {!props.isDisabled && props.onRemove && (
        <IconButton
          className={styles.close}
          buttonType="muted"
          label="Delete"
          iconProps={{ icon: 'Close' }}
          onClick={() => {
            props.onRemove && props.onRemove();
          }}
        />
      )}
    </Card>
  );
}
