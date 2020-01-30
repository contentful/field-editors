import React from 'react';
import PropTypes from 'prop-types';
import Sticky from 'react-sticky-el';
import { isIE } from 'utils/browser';

const StickyToolbarWrapper = ({ children, isDisabled }) =>
  isIE() ? (
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
