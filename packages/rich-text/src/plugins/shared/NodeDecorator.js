import * as React from 'react';
import { NodePropTypes } from './PropTypes';

export default function(Tag, tagProps = {}) {
  const CommonNode = ({ attributes, children, node }) => {
    return (
      <Tag
        className={`cf-slate-${node.type}`}
        data-test-id={node.type}
        {...tagProps}
        {...attributes}>
        {children}
      </Tag>
    );
  };

  CommonNode.displayName = `${Tag}-node`;
  CommonNode.propTypes = NodePropTypes;

  return CommonNode;
}
