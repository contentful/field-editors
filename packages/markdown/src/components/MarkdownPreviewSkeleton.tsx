import React from 'react';

import { Skeleton } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';

const styles = {
  root: css({
    border: `1px solid ${tokens.gray400}`,
    borderWidth: '0 1px',
    minHeight: '300px',
    padding: `${tokens.spacingL}`,
  }),
};

export default function MarkdownPreviewSkeleton() {
  return (
    <Skeleton.Container className={styles.root}>
      <Skeleton.DisplayText />
      <Skeleton.BodyText offsetTop={37} numberOfLines={5} />
    </Skeleton.Container>
  );
}
