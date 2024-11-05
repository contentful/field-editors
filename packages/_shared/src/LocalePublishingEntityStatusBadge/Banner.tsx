import React, { ReactNode } from 'react';

import { Text } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';

const styles = {
  content: css({
    display: 'block',
  }),
  banner: css({
    background: tokens.gray100,
    padding: tokens.spacingXs,
    margin: `${tokens.spacingXs} ${tokens.spacingS}`,
    borderRadius: tokens.borderRadiusSmall,
  }),
};

export function Banner({ content, highlight }: { content: ReactNode; highlight?: ReactNode }) {
  return (
    <div className={styles.banner}>
      <Text fontSize="fontSizeS" fontColor="gray700" className={styles.content}>
        {content}
      </Text>
      {highlight && (
        <Text fontSize="fontSizeS" fontColor="gray700" as="strong" fontWeight="fontWeightDemiBold">
          {highlight}
        </Text>
      )}
    </div>
  );
}
