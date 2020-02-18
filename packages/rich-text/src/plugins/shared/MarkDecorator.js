import React from 'react';
import { MarkPropTypes } from './PropTypes';

export default function(Tag, tagProps = {}) {
  const CommonMark = ({ attributes, children }) => {
    return (
      <Tag {...tagProps} {...attributes}>
        {children}
      </Tag>
    );
  };

  CommonMark.displayName = `${Tag}-mark`;
  CommonMark.propTypes = MarkPropTypes;

  return CommonMark;
}
