import * as React from 'react';

import { IconButton } from '@contentful/f36-button';
import { Card } from '@contentful/f36-card';
import { Flex } from '@contentful/f36-core';
import { CloseIcon } from '@contentful/f36-icons';
import { SectionHeading } from '@contentful/f36-typography';

import { ContentEntityType } from '../../types.js';
import * as styles from './styles.js';

export function MissingEntityCard(props: {
  entityType: ContentEntityType;
  asSquare?: boolean;
  isSelected?: boolean;
  isDisabled: boolean;
  onRemove?: Function;
}) {
  return (
    <Card className={styles.card} testId="cf-ui-missing-entry-card" isSelected={props.isSelected}>
      <Flex alignItems="center" justifyContent="space-between">
        <div className={props.asSquare ? styles.squareCard : ''}>
          <SectionHeading marginBottom="none">
            {props.entityType} is missing or inaccessible
          </SectionHeading>
        </div>
        {!props.isDisabled && props.onRemove && (
          <IconButton
            variant="transparent"
            icon={<CloseIcon variant="muted" />}
            aria-label="Delete"
            onClick={() => {
              props.onRemove && props.onRemove();
            }}
          />
        )}
      </Flex>
    </Card>
  );
}
