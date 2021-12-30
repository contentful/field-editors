import React, { ReactNode } from 'react';

import { css } from 'emotion';

const styles = {
  nativeSticky: css`
    position: -webkit-sticky;
    position: sticky;
    top: -1px;
    z-index: 2;
  `,
};

type StickyToolbarProps = {
  isDisabled?: boolean;
  children: ReactNode;
};

const StickyToolbarWrapper = ({ isDisabled, children }: StickyToolbarProps) => (
  <div className={isDisabled ? '' : styles.nativeSticky}>{children}</div>
);

export default StickyToolbarWrapper;
