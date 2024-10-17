import React, { ReactNode } from 'react';

import { css } from 'emotion';

const styles = {
  nativeSticky: (offset?: number) => css`
    position: -webkit-sticky;
    position: sticky;
    top: ${offset ? offset : -1}px;
    z-index: 2;
  `,
};

type StickyToolbarProps = {
  isDisabled?: boolean;
  offset?: number;
  children: ReactNode;
};

const StickyToolbarWrapper = ({ isDisabled, offset, children }: StickyToolbarProps) => (
  <div className={isDisabled ? '' : styles.nativeSticky(offset)}>{children}</div>
);

export default StickyToolbarWrapper;
