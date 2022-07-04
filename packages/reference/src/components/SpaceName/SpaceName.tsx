import * as React from 'react';

import { Flex, Text, Tooltip } from '@contentful/f36-components';
import { FolderOpenTrimmedIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';

interface SpaceNameProps {
  spaceName: string;
}

const styles = {
  spaceIcon: css({
    flexShrink: 0,
    fill: tokens.purple600,
  }),
  spaceName: css({
    color: tokens.gray700,
    fontSize: tokens.fontSizeS,
    fontWeight: tokens.fontWeightDemiBold,
  }),
};

export function SpaceName(props: SpaceNameProps) {
  return (
    <Tooltip placement="top" as="div" content="Space">
      <Flex alignItems="center" gap="spacingXs" marginRight="spacingS">
        <FolderOpenTrimmedIcon className={styles.spaceIcon} size="tiny" aria-label="Source space" />
        <Text className={styles.spaceName}>{props.spaceName}</Text>
      </Flex>
    </Tooltip>
  );
}
