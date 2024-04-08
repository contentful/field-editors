import * as React from 'react';

import { Card, Flex, IconButton, SectionHeading } from '@contentful/f36-components';
import { CloseIcon } from '@contentful/f36-icons';

import * as styles from './styles';

export function MissingAssetCard(props: {
  asSquare?: boolean;
  isSelected?: boolean;
  isDisabled: boolean;
  onRemove?: Function;
}) {
  return (
    <Card className={styles.card} testId="cf-ui-missing-asset-card" isSelected={props.isSelected}>
      <Flex alignItems="center" justifyContent="space-between">
        <div className={props.asSquare ? styles.squareCard : ''}>
          <SectionHeading marginBottom="none">Asset is missing or inaccessible</SectionHeading>
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
