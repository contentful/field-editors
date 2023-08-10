import * as React from 'react';

import { Flex, Text, Tooltip } from '@contentful/f36-components';
import { FolderOpenTrimmedIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';

interface SourceProps {
  spaceName: string;
  environmentName?: string;
}

const styles = {
  spaceIcon: css({
    flexShrink: 0,
    fill: tokens.gray600,
  }),
  spaceName: css({
    color: tokens.gray600,
    fontSize: tokens.fontSizeS,
    fontWeight: tokens.fontWeightMedium,
    maxWidth: '80px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  }),
};

export function SpaceName(props: SourceProps) {
  let content = `Space: ${props.spaceName}`;
  if (props.environmentName) content += ` (Env.: ${props.environmentName})`;

  return (
    <Tooltip placement="top" as="div" content={content}>
      <Flex alignItems="center" gap="spacingXs" marginRight="spacingS">
        <FolderOpenTrimmedIcon className={styles.spaceIcon} size="tiny" aria-label="Source space" />
        <Text className={styles.spaceName}>{props.spaceName}</Text>
      </Flex>
    </Tooltip>
  );
}
