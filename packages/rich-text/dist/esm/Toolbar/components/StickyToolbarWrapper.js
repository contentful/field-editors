import React from 'react';
import { css } from 'emotion';
const styles = {
    nativeSticky: (offset)=>css`
    position: -webkit-sticky;
    position: sticky;
    top: ${offset ? offset : -1}px;
    z-index: 2;
  `
};
const StickyToolbarWrapper = ({ isDisabled, offset, children })=>/*#__PURE__*/ React.createElement("div", {
        className: isDisabled ? '' : styles.nativeSticky(offset)
    }, children);
export default StickyToolbarWrapper;
