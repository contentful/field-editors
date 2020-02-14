import React from 'react';
import PropTypes from 'prop-types';
import Sticky from 'react-sticky-el';
import { SUPPORTS_STICKY_TOOLBAR } from '../helpers/browserSupport';
import { css } from 'emotion';

const styles = {
  stickyWrapper: css({
    '-webkit-transform': 'none !important',
    transform: 'none !important'
  }),
  nativeStickyEnabled: css({
    position: [
      '-webkit-sticky',
      'sticky'
    ],
    top: 0,
    zIndex: 2
  })
};

const StickyToolbarWrapper = ({ children, isDisabled }) =>
  SUPPORTS_STICKY_TOOLBAR ? (
    <Sticky
      className={styles.stickyWrapper}
      boundaryElement=".rich-text"
      scrollElement=".sticky-parent"
      stickyStyle={{ zIndex: 2 }}
      disabled={isDisabled}>
      {children}
    </Sticky>
  ) : (
    <div className={isDisabled ? '' : styles.nativeStickyEnabled}>
      {children}
    </div>
  );

StickyToolbarWrapper.propTypes = {
  isDisabled: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired
};

export default StickyToolbarWrapper;
