import React from 'react';
import PropTypes from 'prop-types';
import { css } from 'emotion';

const styles = {
  nativeSticky: css`
    position: -webkit-sticky;
    position: sticky;
    top: -1px;
    z-index: 2;
  `,
};

const StickyToolbarWrapper = ({ isDisabled, children }) => (
  <div className={isDisabled ? '' : styles.nativeSticky}>{children}</div>
);

StickyToolbarWrapper.propTypes = {
  isDisabled: PropTypes.bool,
  children: PropTypes.node,
};

export default StickyToolbarWrapper;
