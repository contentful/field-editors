import React from 'react';
import PropTypes from 'prop-types';
import Sticky from 'react-sticky-el';
import { SUPPORTS_STICKY_TOOLBAR } from '../helpers/browserSupport';

const StickyToolbarWrapper = ({ children, isDisabled }) =>
  SUPPORTS_STICKY_TOOLBAR ? (
    <Sticky
      className="sticky-wrapper"
      boundaryElement=".rich-text"
      scrollElement=".sticky-parent"
      stickyStyle={{ zIndex: 2 }}
      disabled={isDisabled}>
      {children}
    </Sticky>
  ) : (
    <div className="native-sticky">{children}</div>
  );

StickyToolbarWrapper.propTypes = {
  isDisabled: PropTypes.bool
};

export default StickyToolbarWrapper;
