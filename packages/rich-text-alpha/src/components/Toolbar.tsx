import * as React from 'react';

import { Flex, Box } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { css } from 'emotion';

const styles = {
  container: css({
    border: `1px solid ${tokens.gray400}`,
    backgroundColor: tokens.gray100,
    padding: tokens.spacingXs,
    borderRadius: `${tokens.borderRadiusMedium} ${tokens.borderRadiusMedium} 0 0`,
    minHeight: '50px',
  }),
  sticky: (offset?: number) =>
    css({
      position: 'sticky',
      top: `${offset ? offset : -1}px`,
      zIndex: 2,
    }),
  button: css({
    height: '30px',
    width: '30px',
    marginLeft: tokens.spacing2Xs,
    marginRight: tokens.spacing2Xs,
  }),
  divider: css({
    display: 'inline-block',
    height: '21px',
    width: '1px',
    background: tokens.gray300,
    margin: `0 ${tokens.spacing2Xs}`,
  }),
  left: css({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginRight: '20px',
  }),
  right: css({
    display: 'flex',
    alignSelf: 'flex-start',
  }),
};

export type ToolbarProps = {
  hidden?: boolean;
  stickyOffset?: number;
};

export const Toolbar = (props: ToolbarProps) => {
  const { hidden, stickyOffset } = props;

  if (hidden) {
    return null;
  }

  return (
    <Box className={styles.sticky(stickyOffset)} testId="toolbar">
      <Flex
        gap="spacingS"
        flexWrap="wrap"
        flexDirection="row"
        className={styles.container}
        justifyContent="space-between"
      >
        <div className={styles.left}></div>
        <div className={styles.right}></div>
      </Flex>
    </Box>
  );
};
