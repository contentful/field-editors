import React from 'react';

import { Icon, Tooltip } from '@contentful/f36-components';
import { AlignToolbarButton } from '@udecode/plate-ui-alignment';

import AlignCenter from '../icons/AlignCenter';
import AlignJustified from '../icons/AlignJustified';
import AlignLeft from '../icons/AlignLeft';
import AlignRight from '../icons/AlignRight';

const AlignToolbarButtons = () => {
  return (
    <>
      <Tooltip content="Align Left" placement="bottom">
        <AlignToolbarButton
          value="left"
          icon={
            <Icon>
              <AlignLeft />
            </Icon>
          }
        />
      </Tooltip>
      <Tooltip content="Align Center" placement="bottom">
        <AlignToolbarButton
          value="center"
          icon={
            <Icon>
              <AlignCenter />
            </Icon>
          }
        />
      </Tooltip>
      <Tooltip content="Align Right" placement="bottom">
        <AlignToolbarButton
          value="right"
          icon={
            <Icon>
              <AlignRight />
            </Icon>
          }
        />
      </Tooltip>
      <Tooltip content="Justify" placement="bottom">
        <AlignToolbarButton
          value="justify"
          icon={
            <Icon>
              <AlignJustified />
            </Icon>
          }
        />
      </Tooltip>
    </>
  );
};

export default AlignToolbarButtons;
