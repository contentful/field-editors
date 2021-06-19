import React from 'react';
import ToolbarIcon from '../../shared/ToolbarIcon';

export const ToolbarIconCustom = props => {
  return (
    <div className={'toolbar-icon-custom'}>
      <div className={'replacement-icon'}>{props.children}</div>
      <ToolbarIcon {...props} />
    </div>
  );
};
